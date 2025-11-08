from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from typing import Optional, List
from app.models.event import Event
from app.models.attendance import Attendance
from app.models.mission import Mission


def get_events(
    db: Session,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None
) -> tuple[List[Event], int]:
    """取得活動列表"""
    query = db.query(Event).filter(Event.is_active == True)
    
    # 搜尋
    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%")
            )
        )
    
    # 狀態過濾
    now = datetime.utcnow()
    if status == "upcoming":
        query = query.filter(Event.start_time > now)
    elif status == "ongoing":
        query = query.filter(
            and_(Event.start_time <= now, Event.end_time >= now)
        )
    elif status == "past":
        query = query.filter(Event.end_time < now)
    
    total = query.count()
    events = query.order_by(Event.start_time.desc()).offset(skip).limit(limit).all()
    
    return events, total


def get_event_by_id(db: Session, event_id: int) -> Event | None:
    """根據 id 取得活動"""
    return db.query(Event).filter(Event.id == event_id).first()


def get_user_event_progress(db: Session, user_id: int, event_id: int) -> dict:
    """取得使用者在活動的進度"""
    from app.models.nfc_tag import NFCTag
    
    # 取得活動的所有 missions
    missions = db.query(Mission).filter(Mission.event_id == event_id).all()
    total_missions = len(missions)
    
    # 取得使用者完成的 missions（通過 attendance -> nfc_tag -> mission）
    completed_mission_ids = db.query(Mission.id).join(
        NFCTag, NFCTag.mission_id == Mission.id
    ).join(
        Attendance, Attendance.nfc_tag_id == NFCTag.id
    ).filter(
        Attendance.user_id == user_id,
        Mission.event_id == event_id
    ).distinct().all()
    
    completed_count = len(completed_mission_ids)
    
    return {
        "total_missions": total_missions,
        "completed_missions": completed_count,
        "completion_percentage": (completed_count / total_missions * 100) if total_missions > 0 else 0
    }


def create_event(db: Session, event_data: dict) -> Event:
    """創建新活動"""
    db_event = Event(**event_data)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event_data: dict) -> Event | None:
    """更新活動"""
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return None
    
    for key, value in event_data.items():
        if value is not None:
            setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int) -> bool:
    """刪除活動（軟刪除）"""
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return False
    
    db_event.is_active = False
    db.commit()
    return True


def hard_delete_event(db: Session, event_id: int) -> bool:
    """硬刪除活動"""
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return False
    
    db.delete(db_event)
    db.commit()
    return True

