from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MissionResponse(BaseModel):
    id: int
    event_id: int
    name: str
    description: Optional[str] = None
    order: int
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MissionCreate(BaseModel):
    event_id: int
    name: str
    description: Optional[str] = None
    order: int = 0
    is_active: bool = True


class MissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

