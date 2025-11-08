from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional
from app.models.attendance import Attendance
from app.models.nfc_tag import NFCTag
from app.models.mission import Mission
from app.models.event import Event


def check_attendance_exists(db: Session, user_id: int, nfc_tag_id: int) -> bool:
    """檢查使用者是否已經報到過"""
    return db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.nfc_tag_id == nfc_tag_id
    ).first() is not None


def create_attendance(
    db: Session,
    user_id: int,
    event_id: int,
    nfc_tag_id: int,
    reward_points: int
) -> Attendance:
    """創建報到記錄"""
    attendance = Attendance(
        user_id=user_id,
        event_id=event_id,
        nfc_tag_id=nfc_tag_id,
        reward_points_earned=reward_points,
        timestamp=datetime.utcnow()
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


def get_user_attendances(
    db: Session,
    user_id: int,
    event_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50
) -> tuple[List[Attendance], int]:
    """取得使用者的報到記錄"""
    query = db.query(Attendance).filter(Attendance.user_id == user_id)
    
    if event_id:
        query = query.filter(Attendance.event_id == event_id)
    
    total = query.count()
    attendances = query.order_by(Attendance.timestamp.desc()).offset(skip).limit(limit).all()
    
    return attendances, total


def get_user_attendance_summary(db: Session, user_id: int) -> dict:
    """取得使用者報到摘要"""
    total_events = db.query(func.count(func.distinct(Attendance.event_id))).filter(
        Attendance.user_id == user_id
    ).scalar() or 0
    
    total_checkpoints = db.query(func.count(Attendance.id)).filter(
        Attendance.user_id == user_id
    ).scalar() or 0
    
    total_points = db.query(func.sum(Attendance.reward_points_earned)).filter(
        Attendance.user_id == user_id
    ).scalar() or 0
    
    return {
        "total_events_attended": total_events,
        "total_checkpoints": total_checkpoints,
        "total_points": total_points
    }

