from fastapi import FastAPI, WebSocket, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uvicorn
from typing import List
import asyncio
import json
from datetime import datetime, timedelta

from app.core.config import Settings
from app.services.audio_processor import AudioProcessor
from app.services.gpt_processor import GPTProcessor
from app.services.websocket_manager import ConnectionManager
from app.schemas.user import User, UserCreate, UserInDB
from app.schemas.conversation import Conversation, ConversationCreate
from app.db.session import SessionLocal
from app.models.user import User as UserModel
from app.core.security import verify_password

settings = Settings()
app = FastAPI(title="CognJob API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize connection manager
manager = ConnectionManager()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = await UserModel.get_by_token(db, token)
    if user is None:
        raise credentials_exception
    return user

async def authenticate_user(db: Session, username: str, password: str) -> UserModel:
    user = await UserModel.get_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

@app.post("/api/users/", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = await UserModel.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return await UserModel.create(db=db, user=user)

@app.post("/api/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = await get_current_user(token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, client_id)
    
    audio_processor = AudioProcessor()
    gpt_processor = GPTProcessor()
    
    try:
        while True:
            data = await websocket.receive_bytes()
            
            # Process audio
            transcript = await audio_processor.process_audio(data)
            if transcript:
                # Generate response
                response = await gpt_processor.generate_response(transcript)
                
                # Store conversation
                conv = await Conversation.create(
                    db=db,
                    obj_in=ConversationCreate(
                        user_id=user.id,
                        transcript=transcript,
                        response=response
                    )
                )
                
                # Send response
                await manager.send_message(
                    client_id,
                    {
                        "type": "transcript",
                        "data": {
                            "id": conv.id,
                            "transcript": transcript,
                            "response": response,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    }
                )
    except Exception as e:
        print(f"Error in websocket connection: {e}")
    finally:
        await manager.disconnect(client_id)

@app.get("/api/conversations/", response_model=List[Conversation])
async def get_conversations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = await Conversation.get_multi_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return conversations

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
