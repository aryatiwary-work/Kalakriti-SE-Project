import jwt
import pytest

from app import security


def test_hash_is_salted_and_verifiable():
    h1 = security.hash_password("pottery-lover")
    h2 = security.hash_password("pottery-lover")
    assert h1 != h2  # different salts
    assert h1.count("$") == 2
    assert h1.startswith(f"{security.PBKDF2_ITERATIONS}$")
    assert security.verify_password("pottery-lover", h1)
    assert security.verify_password("pottery-lover", h2)


def test_wrong_password_is_rejected():
    h = security.hash_password("correct-horse")
    assert not security.verify_password("wrong-horse", h)
    assert not security.verify_password("", h)


def test_malformed_hash_is_rejected():
    assert security.verify_password("x", "not-a-valid-hash") is False


def test_token_round_trip():
    token = security.create_access_token(42, "host")
    payload = security.decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["role"] == "host"


def test_expired_token_raises():
    token = security.create_access_token(1, "learner", expires_minutes=-1)
    with pytest.raises(jwt.ExpiredSignatureError):
        security.decode_access_token(token)


def test_tampered_token_raises():
    token = security.create_access_token(1, "learner")
    forged = jwt.encode({"sub": "1", "role": "admin"}, "some-other-key", algorithm="HS256")
    with pytest.raises(jwt.InvalidSignatureError):
        security.decode_access_token(forged)
    assert security.decode_access_token(token)["role"] == "learner"


def test_hash_parameters_are_pinned():
    # Added after mutation testing: iteration count and salt size are security parameters.
    iterations, salt, digest = security.hash_password("x").split("$")
    assert iterations == "200000"
    assert len(salt) == 32  # 16 random bytes, hex encoded
    assert len(digest) == 64  # SHA-256


def test_settings_are_read_from_environment(monkeypatch):
    import importlib
    from datetime import datetime, timezone

    monkeypatch.setenv("SECRET_KEY", "from-env")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "5")
    reloaded = importlib.reload(security)
    try:
        assert reloaded.SECRET_KEY == "from-env"
        assert reloaded.ACCESS_TOKEN_EXPIRE_MINUTES == 5
        exp = reloaded.decode_access_token(reloaded.create_access_token(1, "learner"))["exp"]
        remaining = exp - datetime.now(timezone.utc).timestamp()
        assert 240 < remaining <= 300
    finally:
        monkeypatch.undo()
        importlib.reload(security)


def test_default_token_lifetime_is_twelve_hours(monkeypatch):
    import importlib
    from datetime import datetime, timezone

    monkeypatch.delenv("ACCESS_TOKEN_EXPIRE_MINUTES", raising=False)
    reloaded = importlib.reload(security)
    exp = reloaded.decode_access_token(reloaded.create_access_token(1, "learner"))["exp"]
    remaining = exp - datetime.now(timezone.utc).timestamp()
    assert 719 * 60 < remaining <= 720 * 60
