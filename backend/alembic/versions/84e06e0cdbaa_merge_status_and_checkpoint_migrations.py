"""merge_status_and_checkpoint_migrations

Revision ID: 84e06e0cdbaa
Revises: 59bed5b72b5a, 9c1bc4024828
Create Date: 2025-11-08 20:34:25.133144

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84e06e0cdbaa'
down_revision: Union[str, None] = ('59bed5b72b5a', '9c1bc4024828')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

