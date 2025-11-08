from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class BadgeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: str
    badge_type: str
    is_earned: Optional[bool] = None
    timestamp_earned: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserBadgeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: str
    badge_type: str
    timestamp_earned: datetime
    event_id: Optional[int] = None
    event_title: Optional[str] = None

    class Config:
        from_attributes = True


class BadgeListResponse(BaseModel):
    badges: List[BadgeResponse]
    statistics: Optional[dict] = None


class BadgeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: str
    badge_type: str = "event"  # event, global, special
    is_active: bool = True


class BadgeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    badge_type: Optional[str] = None
    is_active: Optional[bool] = None


class UserBadgeCreate(BaseModel):
    user_id: int
    badge_id: int
    event_id: Optional[int] = None


class NFCTagCreate(BaseModel):
    tag_uid: str
    checkpoint_id: int
    reward_points: int = 0
    is_active: bool = True


class NFCTagUpdate(BaseModel):
    tag_uid: Optional[str] = None
    checkpoint_id: Optional[int] = None
    reward_points: Optional[int] = None
    is_active: Optional[bool] = None


class NFCTagResponse(BaseModel):
    id: int
    tag_uid: str
    checkpoint_id: int
    reward_points: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

