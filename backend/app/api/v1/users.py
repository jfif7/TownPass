from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import attendance as crud_attendance
from app.schemas.attendance import AttendanceHistoryResponse, AttendanceResponse
from app.models.attendance import Attendance
from app.models.mission import Mission
from app.models.event import Event

router = APIRouter()


@router.get("/me/attendance", response_model=AttendanceHistoryResponse)
async def get_my_attendance(
    event_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得我的報到記錄"""
    skip = (page - 1) * limit
    attendances, total = crud_attendance.get_user_attendances(
        db=db,
        user_id=current_user.id,
        event_id=event_id,
        skip=skip,
        limit=limit
    )
    
    # 構建響應
    attendance_responses = []
    for att in attendances:
        # 取得 event
        event = db.query(Event).filter(Event.id == att.event_id).first()
        
        # 取得 mission（通過 nfc_tag）
        from app.models.nfc_tag import NFCTag
        nfc_tag = db.query(NFCTag).filter(NFCTag.id == att.nfc_tag_id).first()
        mission = None
        if nfc_tag:
            mission = db.query(Mission).filter(Mission.id == nfc_tag.mission_id).first()
        
        attendance_responses.append(AttendanceResponse(
            id=att.id,
            event_id=att.event_id,
            event_title=event.title if event else "未知活動",
            mission_name=mission.name if mission else "未知任務",
            mission_id=mission.id if mission else 0,
            timestamp=att.timestamp,
            reward_points=att.reward_points_earned
        ))
    
    # 取得摘要
    summary = crud_attendance.get_user_attendance_summary(db, current_user.id)
    
    return AttendanceHistoryResponse(
        attendance_history=attendance_responses,
        pagination={
            "page": page,
            "limit": limit,
            "total": total
        },
        summary=summary
    )

