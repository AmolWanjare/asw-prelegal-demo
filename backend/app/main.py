import os
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import create_tables
from .routers import auth, health


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Ensure data directory exists for SQLite
    if settings.DATABASE_URL.startswith("sqlite:///"):
        db_path = settings.DATABASE_URL[len("sqlite:///"):]
        db_dir = os.path.dirname(db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
    create_tables()
    yield


APP_VERSION = "0.1.0"

app = FastAPI(title="Prelegal", version=APP_VERSION, lifespan=lifespan)

# CORS for local frontend dev (npm run dev on port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# Serve static frontend build (must be last — catch-all)
if os.path.isdir(settings.STATIC_DIR):
    app.mount("/", StaticFiles(directory=settings.STATIC_DIR, html=True), name="static")
