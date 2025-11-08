from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class CheckInRequest(BaseModel):
    nfc_tag_uid: str


class CheckInResponse(BaseModel):
    status: str
    event_id: int
    event_title: str
    mission_name: str
    mission_id: int
    reward_points: int
    message: str
    timestamp: datetime
    total_missions_in_event: int
    user_missions_completed: int


class AttendanceResponse(BaseModel):
    id: int
    event_id: int
    event_title: str
    mission_name: str
    mission_id: int
    timestamp: datetime
    reward_points: int

    class Config:
        from_attributes = True


class AttendanceHistoryResponse(BaseModel):
    attendance_history: List[AttendanceResponse]
    pagination: dict
    summary: dict

