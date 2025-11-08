from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.mission import Mission


def get_mission_by_id(db: Session, mission_id: int) -> Mission | None:
    """根據 id 取得任務"""
    return db.query(Mission).filter(Mission.id == mission_id).first()


def get_missions_by_event(
    db: Session,
    event_id: int,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[Mission], int]:
    """取得活動的所有任務"""
    query = db.query(Mission).filter(
        Mission.event_id == event_id,
        Mission.is_active == True
    )
    
    total = query.count()
    missions = query.order_by(Mission.order).offset(skip).limit(limit).all()
    
    return missions, total


def create_mission(db: Session, mission_data: dict) -> Mission:
    """創建新任務"""
    db_mission = Mission(**mission_data)
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission


def update_mission(db: Session, mission_id: int, mission_data: dict) -> Mission | None:
    """更新任務"""
    db_mission = get_mission_by_id(db, mission_id)
    if not db_mission:
        return None
    
    for key, value in mission_data.items():
        if value is not None:
            setattr(db_mission, key, value)
    
    db.commit()
    db.refresh(db_mission)
    return db_mission


def delete_mission(db: Session, mission_id: int) -> bool:
    """刪除任務（軟刪除）"""
    db_mission = get_mission_by_id(db, mission_id)
    if not db_mission:
        return False
    
    db_mission.is_active = False
    db.commit()
    return True


def hard_delete_mission(db: Session, mission_id: int) -> bool:
    """硬刪除任務"""
    db_mission = get_mission_by_id(db, mission_id)
    if not db_mission:
        return False
    
    db.delete(db_mission)
    db.commit()
    return True

