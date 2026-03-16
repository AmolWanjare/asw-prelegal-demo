from collections.abc import Generator

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from .config import settings
from .database import SessionLocal
from .models.user import User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    prelegal_session: str | None = Cookie(default=None),
) -> User:
    if not prelegal_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user_id = int(prelegal_session)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
