SIGNUP_DATA = {
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
}


def test_signup_success(client):
    response = client.post("/api/auth/signup", json=SIGNUP_DATA)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == SIGNUP_DATA["email"]
    assert data["full_name"] == SIGNUP_DATA["full_name"]
    assert "id" in data
    assert "prelegal_session" in response.cookies


def test_signup_duplicate_email(client):
    client.post("/api/auth/signup", json=SIGNUP_DATA)
    response = client.post("/api/auth/signup", json=SIGNUP_DATA)
    assert response.status_code == 409


def test_signin_success(client):
    client.post("/api/auth/signup", json=SIGNUP_DATA)
    response = client.post(
        "/api/auth/signin",
        json={"email": SIGNUP_DATA["email"], "password": SIGNUP_DATA["password"]},
    )
    assert response.status_code == 200
    assert response.json()["email"] == SIGNUP_DATA["email"]
    assert "prelegal_session" in response.cookies


def test_signin_wrong_password(client):
    client.post("/api/auth/signup", json=SIGNUP_DATA)
    response = client.post(
        "/api/auth/signin",
        json={"email": SIGNUP_DATA["email"], "password": "wrong"},
    )
    assert response.status_code == 401


def test_signin_nonexistent_email(client):
    response = client.post(
        "/api/auth/signin",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_me_with_session(client):
    signup_resp = client.post("/api/auth/signup", json=SIGNUP_DATA)
    cookie = signup_resp.cookies["prelegal_session"]
    response = client.get("/api/auth/me", cookies={"prelegal_session": cookie})
    assert response.status_code == 200
    assert response.json()["email"] == SIGNUP_DATA["email"]


def test_me_without_session(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_signout(client):
    signup_resp = client.post("/api/auth/signup", json=SIGNUP_DATA)
    cookie = signup_resp.cookies["prelegal_session"]
    response = client.post("/api/auth/signout", cookies={"prelegal_session": cookie})
    assert response.status_code == 200
    assert response.json()["message"] == "Signed out"
