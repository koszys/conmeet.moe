"""init

Revision ID: f48464fbc0c8
Revises:
Create Date: 2026-09-04 17:10:41.931383

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM

# revision identifiers, used by Alembic.
revision: str = "f48464fbc0c8"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

user_role_enum = ENUM("user", "admin", name="user_role", create_type=False)


def upgrade() -> None:
    """Upgrade schema."""
    user_role_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "conventions",
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("starts_at", sa.DateTime(), nullable=False),
        sa.Column("ends_at", sa.DateTime(), nullable=False),
        sa.Column("venue_name", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=120), nullable=True),
        sa.Column("country", sa.String(length=120), nullable=True),
        sa.Column("website_url", sa.String(length=512), nullable=True),
        sa.Column("image_url", sa.String(length=512), nullable=True),
        sa.Column("map_url", sa.String(length=512), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_conventions")),
    )
    op.create_index(op.f("ix_conventions_slug"), "conventions", ["slug"], unique=True)
    op.create_table(
        "users",
        sa.Column("discord_id", sa.String(length=64), nullable=True),
        sa.Column("username", sa.String(length=64), nullable=False),
        sa.Column("avatar_url", sa.String(length=512), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("access_token_encrypted", sa.String(length=1024), nullable=True),
        sa.Column("refresh_token_encrypted", sa.String(length=1024), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(), nullable=True),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
    )
    op.create_index(op.f("ix_users_discord_id"), "users", ["discord_id"], unique=True)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_discord_id"), table_name="users")
    op.drop_table("users")
    user_role_enum.drop(op.get_bind(), checkfirst=True)
    op.drop_index(op.f("ix_conventions_slug"), table_name="conventions")
    op.drop_table("conventions")
