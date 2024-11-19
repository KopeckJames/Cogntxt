from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserCreate
from app.schemas.conversation import Conversation
from app.models.user import User as UserModel
from app.models.conversation import Conversation as ConversationModel

router = APIRouter()

@router.post("/users/", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = await UserModel.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return await UserModel.create(db=db, user=user)

@router.get("/conversations/", response_model=List[Conversation])
async def get_conversations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = await ConversationModel.get_multi_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return conversations
