"""Integration: auth router + security module + users table working together."""


def test_signup_then_login_then_me(client):
    res = client.post(
        "/auth/signup",
        json={"name": "Meera", "email": "Meera@Clay.in", "password": "wheel-and-kiln", "role": "host"},
    )
    assert res.status_code == 201
    assert res.json()["user"]["email"] == "meera@clay.in"
    assert res.json()["user"]["role"] == "host"

    login = client.post("/auth/login", data={"username": "meera@clay.in", "password": "wheel-and-kiln"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["name"] == "Meera"
    assert me.json()["is_verified"] is False


def test_duplicate_email_rejected(client, signup):
    assert client.post("/auth/signup", json={"name": "Al", "email": "a@x.in", "password": "12345678"}).status_code == 201
    res = client.post("/auth/signup", json={"name": "Ab", "email": "A@x.in", "password": "12345678"})
    assert res.status_code == 400


def test_wrong_password_and_unknown_user(client, signup):
    signup("learner")
    assert client.post("/auth/login", data={"username": "learner1@example.com", "password": "nope"}).status_code == 401
    assert client.post("/auth/login", data={"username": "ghost@example.com", "password": "x"}).status_code == 401


def test_admin_role_cannot_be_self_assigned(client):
    res = client.post("/auth/signup", json={"name": "Eve", "email": "e@x.in", "password": "12345678", "role": "admin"})
    assert res.status_code == 422


def test_short_password_and_bad_email_rejected(client):
    assert client.post("/auth/signup", json={"name": "Al", "email": "a@x.in", "password": "short"}).status_code == 422
    assert client.post("/auth/signup", json={"name": "Al", "email": "not-an-email", "password": "12345678"}).status_code == 422


def test_protected_route_requires_valid_token(client):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401
