from datetime import datetime
from enum import StrEnum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(StrEnum):
    USER = "user"
    ADMIN = "admin"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    discord_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(64))
    avatar_url: Mapped[str | None] = mapped_column(String(512))
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)

    access_token_encrypted: Mapped[str | None] = mapped_column(String(1024))
    refresh_token_encrypted: Mapped[str | None] = mapped_column(String(1024))
    token_expires_at: Mapped[datetime | None]

    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda members: [m.value for m in members],
        ),
        default=UserRole.USER,
    )
    is_active: Mapped[bool] = mapped_column(default=True)
