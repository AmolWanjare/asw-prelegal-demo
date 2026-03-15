from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.conversation import Conversation, Message
from ..models.user import User
from ..schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    SessionMessagesResponse,
    MessageOut,
)
from ..schemas.common import MessageResponse
from ..services.chat_service import call_llm, merge_nda_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat")

MAX_HISTORY_MESSAGES = 30


def _get_session(db: Session, session_id: int, user: User) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.id == session_id).first()
    if not conv or conv.user_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    return conv


@router.post("/message", response_model=ChatMessageResponse)
def send_message(
    body: ChatMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ChatMessageResponse:
    if body.session_id is not None:
        conv = _get_session(db, body.session_id, user)
    else:
        conv = Conversation(user_id=user.id, document_type="mutual_nda")
        db.add(conv)
        db.commit()
        db.refresh(conv)

    current_nda_data = json.loads(conv.nda_data) if conv.nda_data else {}

    # Build history from existing DB messages (before adding the new one)
    # Fetch most recent N messages, ordered by ID for deterministic ordering
    db_messages = list(
        reversed(
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.id.desc())
            .limit(MAX_HISTORY_MESSAGES)
            .all()
        )
    )
    history = [{"role": m.role, "content": m.content} for m in db_messages]

    try:
        llm_response = call_llm(history, body.message, current_nda_data)
    except Exception as e:
        logger.error("LLM call failed: %s", e)
        raise HTTPException(status_code=502, detail="AI service unavailable")

    new_nda_data = merge_nda_data(current_nda_data, llm_response.extracted_fields)
    conv.nda_data = json.dumps(new_nda_data)
    conv.is_complete = llm_response.is_complete

    # Persist both user and assistant messages in a single commit
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=body.message,
    )
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=llm_response.reply,
        field_updates=llm_response.extracted_fields.model_dump_json(exclude_none=True),
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageResponse(
        session_id=conv.id,
        message_id=assistant_msg.id,
        reply=llm_response.reply,
        extracted_fields=llm_response.extracted_fields,
        is_complete=llm_response.is_complete,
        nda_data=new_nda_data,
    )


@router.get("/session/{session_id}/messages", response_model=SessionMessagesResponse)
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SessionMessagesResponse:
    conv = _get_session(db, session_id, user)
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.id)
        .all()
    )
    return SessionMessagesResponse(
        session_id=conv.id,
        nda_data=json.loads(conv.nda_data) if conv.nda_data else {},
        is_complete=conv.is_complete,
        messages=[MessageOut.model_validate(m) for m in messages],
    )


@router.delete("/session/{session_id}", response_model=MessageResponse)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MessageResponse:
    conv = _get_session(db, session_id, user)
    db.delete(conv)
    db.commit()
    return MessageResponse(message="Session deleted")
