from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCheckpointProgressBase(BaseModel):
    completed: bool = False
    verification_data: Optional[str] = None
    points_earned: int = 0


class UserCheckpointProgressCreate(UserCheckpointProgressBase):
    user_id: int
    checkpoint_id: int


class UserCheckpointProgressUpdate(BaseModel):
    completed: Optional[bool] = None
    verification_data: Optional[str] = None
    points_earned: Optional[int] = None
    completed_at: Optional[datetime] = None


class UserCheckpointProgressResponse(UserCheckpointProgressBase):
    id: int
    user_id: int
    checkpoint_id: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CheckpointWithProgress(BaseModel):
    """Checkpoint 資訊加上使用者的完成狀態"""
    id: int
    name: str
    description: Optional[str] = None
    checkpoint_type: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    order: int
    reward_points: int
    is_active: bool
    mission_id: int
    
    # 使用者進度
    completed: bool = False
    completed_at: Optional[datetime] = None
    points_earned: int = 0

    class Config:
        from_attributes = True
