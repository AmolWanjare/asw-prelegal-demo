from unittest.mock import patch

from ..schemas.chat import ExtractedFields, LLMResponse

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
