"""change_nfc_tag_mission_id_to_checkpoint_id

Revision ID: dc8e41b22213
Revises: 84e06e0cdbaa
Create Date: 2025-11-09 02:23:42.235122

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc8e41b22213'
down_revision: Union[str, None] = '84e06e0cdbaa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. 移除 checkpoints 表中的 nfc_tag_id 欄位
    op.drop_constraint('checkpoints_nfc_tag_id_fkey', 'checkpoints', type_='foreignkey')
    op.drop_column('checkpoints', 'nfc_tag_id')
    
    # 2. 為 nfc_tags 表添加新的 checkpoint_id 欄位
    op.add_column('nfc_tags', sa.Column('checkpoint_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_nfc_tags_checkpoint_id'), 'nfc_tags', ['checkpoint_id'], unique=False)
    op.create_foreign_key('nfc_tags_checkpoint_id_fkey', 'nfc_tags', 'checkpoints', ['checkpoint_id'], ['id'], ondelete='CASCADE')
    
    # 3. 移除舊的 mission_id 欄位及其約束
    op.drop_constraint('nfc_tags_mission_id_fkey', 'nfc_tags', type_='foreignkey')
    op.drop_index('ix_nfc_tags_mission_id', table_name='nfc_tags')
    op.drop_column('nfc_tags', 'mission_id')
    
    # 4. 為 checkpoint_id 添加 unique 約束
    op.create_unique_constraint('nfc_tags_checkpoint_id_key', 'nfc_tags', ['checkpoint_id'])


def downgrade() -> None:
    # 反向操作
    # 1. 為 nfc_tags 表重新添加 mission_id 欄位
    op.add_column('nfc_tags', sa.Column('mission_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_nfc_tags_mission_id'), 'nfc_tags', ['mission_id'], unique=False)
    op.create_foreign_key('nfc_tags_mission_id_fkey', 'nfc_tags', 'missions', ['mission_id'], ['id'], ondelete='CASCADE')
    
    # 2. 移除 checkpoint_id 欄位及其約束
    op.drop_constraint('nfc_tags_checkpoint_id_key', 'nfc_tags', type_='unique')
    op.drop_constraint('nfc_tags_checkpoint_id_fkey', 'nfc_tags', type_='foreignkey')
    op.drop_index(op.f('ix_nfc_tags_checkpoint_id'), table_name='nfc_tags')
    op.drop_column('nfc_tags', 'checkpoint_id')
    
    # 3. 為 checkpoints 表重新添加 nfc_tag_id 欄位
    op.add_column('checkpoints', sa.Column('nfc_tag_id', sa.Integer(), nullable=True))
    op.create_foreign_key('checkpoints_nfc_tag_id_fkey', 'checkpoints', 'nfc_tags', ['nfc_tag_id'], ['id'], ondelete='SET NULL')

