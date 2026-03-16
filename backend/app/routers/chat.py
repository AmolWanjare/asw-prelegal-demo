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
from ..services.chat_service import call_llm, merge_document_data
from ..registry.document_registry import get_config, REGISTRY

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
        # Validate document type ("generic" is allowed for discovery mode)
        doc_type = body.document_type
        if doc_type != "generic" and doc_type not in REGISTRY:
            raise HTTPException(status_code=400, detail=f"Unsupported document type: {doc_type}")
        conv = Conversation(user_id=user.id, document_type=doc_type)
        db.add(conv)
        db.commit()
        db.refresh(conv)

    current_data = json.loads(conv.document_data) if conv.document_data else {}

    # Load config for the document type (None if still in discovery)
    config = None
    if conv.document_type != "generic":
        try:
            config = get_config(conv.document_type)
        except ValueError:
            config = None

    # Build history from existing DB messages
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
        llm_response = call_llm(history, body.message, current_data, config)
    except Exception as e:
        logger.error("LLM call failed: %s", e)
        raise HTTPException(status_code=502, detail="AI service unavailable")

    # Check if LLM discovered a document type during the discovery phase
    extracted = llm_response.extracted_fields
    if conv.document_type == "generic" and isinstance(extracted.get("document_type"), str):
        detected_type = extracted["document_type"]
        if detected_type in REGISTRY:
            conv.document_type = detected_type
            # Update config now that we know the document type
            config = get_config(detected_type)
            # Remove discovery-specific field from extracted data
            extracted = {k: v for k, v in extracted.items() if k != "document_type"}
            llm_response = llm_response.model_copy(update={"extracted_fields": extracted})

    new_data = merge_document_data(current_data, extracted, config)
    conv.document_data = json.dumps(new_data)
    conv.is_complete = llm_response.is_complete

    # Persist both user and assistant messages
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=body.message,
    )
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=llm_response.reply,
        field_updates=json.dumps(
            {k: v for k, v in extracted.items() if v is not None}
        ) if extracted else None,
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageResponse(
        session_id=conv.id,
        message_id=assistant_msg.id,
        reply=llm_response.reply,
        extracted_fields=extracted,
        is_complete=llm_response.is_complete,
        document_data=new_data,
        document_type=conv.document_type,
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
        document_data=json.loads(conv.document_data) if conv.document_data else {},
        document_type=conv.document_type,
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
