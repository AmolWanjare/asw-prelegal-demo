from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..config import settings
from ..dependencies import get_db, get_current_user
from ..models.user import User
from ..schemas.auth import SignupRequest, SigninRequest, UserResponse
from ..schemas.common import MessageResponse
from ..services.user_service import create_user, authenticate_user

router = APIRouter(prefix="/auth")


def _set_session_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=str(user.id),
        httponly=True,
        samesite="lax",
    )


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(
    body: SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    user = create_user(db, body.email, body.password, body.full_name)
    _set_session_cookie(response, user)
    return user


@router.post("/signin", response_model=UserResponse)
def signin(
    body: SigninRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    user = authenticate_user(db, body.email, body.password)
    _set_session_cookie(response, user)
    return user


@router.post("/signout", response_model=MessageResponse)
def signout(response: Response) -> MessageResponse:
    response.delete_cookie(key=settings.COOKIE_NAME)
    return MessageResponse(message="Signed out")


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user
