from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserCheckpointProgress(Base):
    """記錄使用者在特定 checkpoint 的完成狀態"""
    __tablename__ = "user_checkpoint_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 完成狀態
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 驗證資料 (例如 NFC 掃描記錄、問題答案等)
    verification_data = Column(Text, nullable=True)  # JSON 格式
    
    # 獲得的積分
    points_earned = Column(Integer, default=0, nullable=False)
    
    # 時間戳記
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="checkpoint_progress")
    checkpoint = relationship("Checkpoint", backref="user_progress")
