from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def create_tables() -> None:
    from . import models  # noqa: F401 — ensure models are registered
    Base.metadata.create_all(bind=engine)
