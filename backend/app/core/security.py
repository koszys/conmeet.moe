from base64 import urlsafe_b64encode
from datetime import UTC, datetime, timedelta
from hashlib import sha256

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _fernet() -> Fernet:
    key = urlsafe_b64encode(sha256(settings.jwt_secret_key.get_secret_value().encode()).digest())
    return Fernet(key)


def encrypt_token(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt_token(value: str) -> str:
    return _fernet().decrypt(value.encode()).decode()


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: datetime
    iss: str = "conmeet.moe"


def hash_password(password: str) -> str:
    return str(pwd_context.hash(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bool(pwd_context.verify(plain_password, hashed_password))


def create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "iss": "conmeet.moe",
    }
    return str(
        jwt.encode(
            payload,
            settings.jwt_secret_key.get_secret_value(),
            algorithm=settings.jwt_algorithm,
        )
    )


def create_access_token(subject: str) -> str:
    return create_token(
        subject,
        "access",
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(subject: str) -> str:
    return create_token(
        subject,
        "refresh",
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str, expected_type: str | None = None) -> TokenPayload:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Invalid token") from exc

    if expected_type is not None and payload.get("type") != expected_type:
        raise ValueError("Unexpected token type")

    return TokenPayload(**payload)
