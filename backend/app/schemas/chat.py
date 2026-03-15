from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class PartyPatch(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    noticeAddress: Optional[str] = None
    date: Optional[str] = None


class ExtractedFields(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["fixed", "until_terminated"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["fixed", "perpetuity"]] = None
    confidentialityTermYears: Optional[int] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None
    party1: Optional[PartyPatch] = None
    party2: Optional[PartyPatch] = None


class LLMResponse(BaseModel):
    reply: str
    extracted_fields: ExtractedFields
    is_complete: bool


class ChatMessageRequest(BaseModel):
    session_id: Optional[int] = None
    message: str


class ChatMessageResponse(BaseModel):
    session_id: int
    message_id: int
    reply: str
    extracted_fields: ExtractedFields
    is_complete: bool
    nda_data: dict


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str
    field_updates: Optional[str] = None
    created_at: datetime


class SessionMessagesResponse(BaseModel):
    session_id: int
    nda_data: dict
    is_complete: bool
    messages: list[MessageOut]
