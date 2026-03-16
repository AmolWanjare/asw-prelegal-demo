import json
from unittest.mock import MagicMock, patch

from ..schemas.chat import ExtractedFields, LLMResponse
from ..services.chat_service import call_llm, _extract_plain_text_reply, _parse_llm_response

SIGNUP_DATA = {
    "email": "chatuser@example.com",
    "password": "password123",
    "full_name": "Chat User",
}


def _signup_and_get_cookie(client):
    resp = client.post("/api/auth/signup", json=SIGNUP_DATA)
    return resp.cookies["prelegal_session"]


MOCK_LLM_RESPONSE = LLMResponse(
    reply="Great! What is the purpose of this NDA?",
    extracted_fields=ExtractedFields(),
    is_complete=False,
)

MOCK_LLM_WITH_FIELDS = LLMResponse(
    reply="Got it, the purpose is set.",
    extracted_fields=ExtractedFields(purpose="Business evaluation"),
    is_complete=False,
)


def test_send_message_requires_auth(client):
    resp = client.post("/api/chat/message", json={"message": "hello"})
    assert resp.status_code == 401


@patch("app.routers.chat.call_llm", return_value=MOCK_LLM_RESPONSE)
def test_send_message_creates_session(mock_llm, client):
    cookie = _signup_and_get_cookie(client)
    resp = client.post(
        "/api/chat/message",
        json={"message": "I want to create an NDA"},
        cookies={"prelegal_session": cookie},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] > 0
    assert data["reply"] == MOCK_LLM_RESPONSE.reply
    assert data["is_complete"] is False


@patch("app.routers.chat.call_llm", return_value=MOCK_LLM_WITH_FIELDS)
def test_send_message_extracts_fields(mock_llm, client):
    cookie = _signup_and_get_cookie(client)
    resp = client.post(
        "/api/chat/message",
        json={"message": "The purpose is business evaluation"},
        cookies={"prelegal_session": cookie},
    )
    data = resp.json()
    assert data["extracted_fields"]["purpose"] == "Business evaluation"
    assert data["nda_data"]["purpose"] == "Business evaluation"


@patch("app.routers.chat.call_llm", return_value=MOCK_LLM_RESPONSE)
def test_reuse_session(mock_llm, client):
    cookie = _signup_and_get_cookie(client)

    resp1 = client.post(
        "/api/chat/message",
        json={"message": "hello"},
        cookies={"prelegal_session": cookie},
    )
    session_id = resp1.json()["session_id"]

    resp2 = client.post(
        "/api/chat/message",
        json={"session_id": session_id, "message": "more info"},
        cookies={"prelegal_session": cookie},
    )
    assert resp2.json()["session_id"] == session_id


@patch("app.routers.chat.call_llm", return_value=MOCK_LLM_RESPONSE)
def test_get_session_messages(mock_llm, client):
    cookie = _signup_and_get_cookie(client)

    resp = client.post(
        "/api/chat/message",
        json={"message": "hello"},
        cookies={"prelegal_session": cookie},
    )
    session_id = resp.json()["session_id"]

    resp2 = client.get(
        f"/api/chat/session/{session_id}/messages",
        cookies={"prelegal_session": cookie},
    )
    assert resp2.status_code == 200
    data = resp2.json()
    assert len(data["messages"]) == 2  # user + assistant
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][1]["role"] == "assistant"


def test_get_session_wrong_user(client):
    # Sign up user 1
    resp1 = client.post("/api/auth/signup", json=SIGNUP_DATA)
    cookie1 = resp1.cookies["prelegal_session"]

    with patch("app.routers.chat.call_llm", return_value=MOCK_LLM_RESPONSE):
        resp = client.post(
            "/api/chat/message",
            json={"message": "hello"},
            cookies={"prelegal_session": cookie1},
        )
    session_id = resp.json()["session_id"]

    # Sign up user 2
    resp2 = client.post(
        "/api/auth/signup",
        json={"email": "other@example.com", "password": "pass", "full_name": "Other"},
    )
    cookie2 = resp2.cookies["prelegal_session"]

    # User 2 tries to access user 1's session
    resp3 = client.get(
        f"/api/chat/session/{session_id}/messages",
        cookies={"prelegal_session": cookie2},
    )
    assert resp3.status_code == 404


@patch("app.routers.chat.call_llm", return_value=MOCK_LLM_RESPONSE)
def test_delete_session(mock_llm, client):
    cookie = _signup_and_get_cookie(client)

    resp = client.post(
        "/api/chat/message",
        json={"message": "hello"},
        cookies={"prelegal_session": cookie},
    )
    session_id = resp.json()["session_id"]

    resp2 = client.delete(
        f"/api/chat/session/{session_id}",
        cookies={"prelegal_session": cookie},
    )
    assert resp2.status_code == 200

    resp3 = client.get(
        f"/api/chat/session/{session_id}/messages",
        cookies={"prelegal_session": cookie},
    )
    assert resp3.status_code == 404


# --- Plain-text fallback tests ---


def test_extract_plain_text_reply_valid():
    text = '"I\'ll add that modification. Is the wording correct?"'
    result = _extract_plain_text_reply(text)
    assert result == "I'll add that modification. Is the wording correct?"


def test_extract_plain_text_reply_too_short():
    assert _extract_plain_text_reply("-1.1e-12") is None
    assert _extract_plain_text_reply("") is None
    assert _extract_plain_text_reply("   ") is None


@patch("app.services.chat_service._do_llm_call")
def test_call_llm_plain_text_fallback(mock_call):
    """When the LLM returns plain text instead of JSON, use it as the reply."""
    plain_reply = "Sure, I can help you draft that NDA. What is the purpose?"
    # Both attempts return plain text (not JSON)
    mock_call.side_effect = [
        f'"{plain_reply}"',
        f'"{plain_reply}"',
    ]
    result = call_llm([], "hello", {})
    assert result.reply == plain_reply
    assert result.extracted_fields == ExtractedFields()
    assert result.is_complete is False


@patch("app.services.chat_service._do_llm_call")
def test_call_llm_float_response_fallback(mock_call):
    """When the LLM returns garbage like a float, show a generic error."""
    mock_call.side_effect = ["-1.1e-12", "-1.1e-12"]
    result = call_llm([], "hello", {})
    # -1.1e-12 is too short to be a useful reply
    assert "unexpected response" in result.reply.lower()
    assert result.extracted_fields == ExtractedFields()


@patch("app.services.chat_service._do_llm_call")
def test_call_llm_retries_then_succeeds(mock_call):
    """First attempt returns garbage, second returns valid JSON."""
    valid_json = '{"reply": "Got it!", "extracted_fields": {"purpose": "Business eval"}, "is_complete": false}'
    mock_call.side_effect = ["-1.1e-12", valid_json]
    result = call_llm([], "hello", {})
    assert result.reply == "Got it!"
    assert result.extracted_fields.purpose == "Business eval"


def test_parse_llm_response_extracts_from_array():
    """When the LLM returns a JSON array with analysis + response, extract the response."""
    raw = json.dumps([
        {"role": "analysis", "content": "thinking..."},
        {"reply": "Hello! I can help you draft an NDA.", "extracted_fields": {}, "is_complete": False},
    ])
    result = _parse_llm_response(raw)
    assert result.reply == "Hello! I can help you draft an NDA."
    assert result.is_complete is False


def test_parse_llm_response_array_no_reply_raises():
    """A JSON array with no dict containing 'reply' should raise."""
    raw = json.dumps([{"role": "analysis", "content": "thinking..."}])
    import pytest
    with pytest.raises(ValueError, match="no valid response object"):
        _parse_llm_response(raw)


def test_parse_llm_response_missing_reply_with_fields():
    """When LLM returns extracted_fields but no reply, should still succeed with a default reply."""
    raw = json.dumps({
        "extracted_fields": {
            "purpose": "to provide food",
            "effectiveDate": "2026-03-16",
            "mndaTermType": "fixed",
            "mndaTermYears": 2,
            "confidentialityTermType": "fixed",
            "confidentialityTermYears": 1,
            "governingLaw": "Arizona",
            "jurisdiction": "Phoenix, AZ",
            "modifications": None,
            "party1": {
                "name": "Amol Wanjare",
                "title": None,
                "company": "ASW",
                "noticeAddress": None,
                "date": None,
            },
            "party2": {
                "name": None,
                "title": None,
                "company": None,
                "noticeAddress": None,
                "date": None,
            },
        },
        "is_complete": False,
    })
    result = _parse_llm_response(raw)
    # Should not raise — fields are preserved even without reply
    assert result.extracted_fields.purpose == "to provide food"
    assert result.extracted_fields.governingLaw == "Arizona"
    assert result.extracted_fields.party1.name == "Amol Wanjare"
    assert result.is_complete is False
    assert len(result.reply) > 0  # has some default reply


@patch("app.services.chat_service._do_llm_call")
def test_call_llm_connection_failure_returns_fallback(mock_call):
    """When the LLM service is completely down, return a graceful fallback instead of raising."""
    mock_call.side_effect = ConnectionError("service unavailable")
    result = call_llm([], "hello", {})
    assert "unexpected response" in result.reply.lower()
    assert result.extracted_fields == ExtractedFields()
    assert result.is_complete is False


@patch("app.services.chat_service._do_llm_call")
def test_call_llm_connection_failure_then_succeeds(mock_call):
    """First attempt raises, second returns valid JSON."""
    valid_json = '{"reply": "Welcome!", "extracted_fields": {}, "is_complete": false}'
    mock_call.side_effect = [ConnectionError("timeout"), valid_json]
    result = call_llm([], "hello", {})
    assert result.reply == "Welcome!"
