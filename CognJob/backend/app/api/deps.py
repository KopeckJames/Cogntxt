from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import verify_password

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = await User.get_by_token(db, token)
    if user is None:
        raise credentials_exception
    return user

async def authenticate_user(db: Session, username: str, password: str) -> User:
    user = await User.get_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
