from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.user import User


def create_user(db: Session, email: str, password: str, full_name: str) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=email, password=password, full_name=full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user
