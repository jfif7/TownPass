from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class CheckpointType(str, enum.Enum):
    NFC = "nfc"
    QUESTION = "question"
    QRCODE = "qrcode"


class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    checkpoint_type = Column(SQLEnum(CheckpointType), nullable=False, index=True)
    
    # 位置資訊
    lat = Column(Float, nullable=True)  # 緯度
    lng = Column(Float, nullable=True)  # 經度
    
    # 關聯資料 (根據 checkpoint_type 使用不同的欄位)
    # nfc_tag 透過 relationship 關聯,不需要 nfc_tag_id 欄位
    question_data = Column(Text, nullable=True)  # JSON 格式儲存問題相關資料
    qrcode_data = Column(String(255), nullable=True)  # QR Code 的內容或識別碼
    
    # 排序與狀態
    order = Column(Integer, default=0, nullable=False, index=True)  # 檢查點順序
    is_active = Column(Boolean, default=True, nullable=False)
    
    # 獎勵積分
    reward_points = Column(Integer, default=0, nullable=False)
    
    # 時間戳記
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="checkpoints")
    nfc_tag = relationship("NFCTag", back_populates="checkpoint", uselist=False, cascade="all, delete-orphan")
    # 可以添加 user_checkpoint_progress 關聯來追蹤用戶完成狀態
