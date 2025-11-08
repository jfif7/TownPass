from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.mission import MissionResponse


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str  # upcoming, ongoing, past
    total_missions: Optional[int] = None
    my_missions_completed: Optional[int] = None
    is_registered: Optional[bool] = None

    class Config:
        from_attributes = True


class EventDetail(BaseModel):
    id: int
    admin_id: Optional[int] = None
    admin_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str
    total_missions: int
    missions: List[MissionResponse]
    my_progress: dict
    badges_available: List[dict]

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    events: List[EventResponse]
    pagination: dict


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    max_participants: Optional[int] = None
    admin_id: Optional[int] = None
    status: Optional[str] = None  # upcoming, ongoing, past


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    max_participants: Optional[int] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None  # upcoming, ongoing, past

