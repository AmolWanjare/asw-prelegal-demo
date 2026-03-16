from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LLMResponse(BaseModel):
    reply: str
    extracted_fields: dict
    is_complete: bool


class ChatMessageRequest(BaseModel):
    session_id: Optional[int] = None
    message: str
    document_type: str = "generic"


class ChatMessageResponse(BaseModel):
    session_id: int
    message_id: int
    reply: str
    extracted_fields: dict
    is_complete: bool
    document_data: dict
    document_type: str


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str
    field_updates: Optional[str] = None
    created_at: datetime


class SessionMessagesResponse(BaseModel):
    session_id: int
    document_data: dict
    document_type: str
    is_complete: bool
    messages: list[MessageOut]
