from datetime import datetime

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Convention(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "conventions"

    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text)

    starts_at: Mapped[datetime]
    ends_at: Mapped[datetime]

    venue_name: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str | None] = mapped_column(String(120))
    country: Mapped[str | None] = mapped_column(String(120))

    website_url: Mapped[str | None] = mapped_column(String(512))
    image_url: Mapped[str | None] = mapped_column(String(512))
    map_url: Mapped[str | None] = mapped_column(String(512))

    is_featured: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
