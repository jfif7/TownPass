from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class CheckpointType(str, Enum):
    NFC = "nfc"
    QUESTION = "question"
    QRCODE = "qrcode"


class CheckpointBase(BaseModel):
    name: str
    description: Optional[str] = None
    checkpoint_type: CheckpointType
    lat: Optional[float] = None
    lng: Optional[float] = None
    order: int = 0
    reward_points: int = 0
    is_active: bool = True


class CheckpointCreate(CheckpointBase):
    mission_id: int
    question_data: Optional[str] = None  # JSON string
    qrcode_data: Optional[str] = None


class CheckpointUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    checkpoint_type: Optional[CheckpointType] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    question_data: Optional[str] = None
    qrcode_data: Optional[str] = None
    order: Optional[int] = None
    reward_points: Optional[int] = None
    is_active: Optional[bool] = None


class CheckpointResponse(CheckpointBase):
    id: int
    mission_id: int
    question_data: Optional[str] = None
    qrcode_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed: bool = False  # 用戶是否完成此檢查點 (需要從 user progress 判斷)

    class Config:
        from_attributes = True


class CheckpointWithDetails(CheckpointResponse):
    """包含更多細節的檢查點資訊"""
    pass
