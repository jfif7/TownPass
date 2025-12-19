"""add_discount_checkpoint_type

Revision ID: 5fff777aeafe
Revises: dc8e41b22213
Create Date: 2025-12-19 11:51:35.194683

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5fff777aeafe'
down_revision: Union[str, None] = 'dc8e41b22213'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'DISCOUNT' to the checkpointtype enum
    op.execute("ALTER TYPE checkpointtype ADD VALUE IF NOT EXISTS 'DISCOUNT'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type, which is complex
    # For now, we'll leave this as a no-op
    # In production, you might want to handle this differently
    pass

