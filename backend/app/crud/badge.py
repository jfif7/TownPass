from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.badge import Badge
from app.models.user_badge import UserBadge


def get_user_badges(
    db: Session,
    user_id: int,
    event_id: Optional[int] = None,
    badge_type: Optional[str] = None
) -> List[UserBadge]:
    """取得使用者的徽章"""
    query = db.query(UserBadge).filter(UserBadge.user_id == user_id)
    
    if event_id:
        query = query.filter(UserBadge.event_id == event_id)
    
    if badge_type:
        query = query.join(Badge).filter(Badge.badge_type == badge_type)
    
    return query.order_by(UserBadge.timestamp_earned.desc()).all()


def get_all_badges(db: Session, user_id: Optional[int] = None) -> List[Badge]:
    """取得所有徽章（可選：標記使用者是否已獲得）"""
    badges = db.query(Badge).filter(Badge.is_active == True).all()
    return badges


def check_user_has_badge(db: Session, user_id: int, badge_id: int) -> bool:
    """檢查使用者是否已獲得某個徽章"""
    return db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_id == badge_id
    ).first() is not None


def get_badge_by_id(db: Session, badge_id: int) -> Badge | None:
    """根據 id 取得徽章"""
    return db.query(Badge).filter(Badge.id == badge_id).first()


def create_badge(db: Session, badge_data: dict) -> Badge:
    """創建新徽章"""
    db_badge = Badge(**badge_data)
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge


def update_badge(db: Session, badge_id: int, badge_data: dict) -> Badge | None:
    """更新徽章"""
    db_badge = get_badge_by_id(db, badge_id)
    if not db_badge:
        return None
    
    for key, value in badge_data.items():
        if value is not None:
            setattr(db_badge, key, value)
    
    db.commit()
    db.refresh(db_badge)
    return db_badge


def delete_badge(db: Session, badge_id: int) -> bool:
    """刪除徽章（軟刪除）"""
    db_badge = get_badge_by_id(db, badge_id)
    if not db_badge:
        return False
    
    db_badge.is_active = False
    db.commit()
    return True


def hard_delete_badge(db: Session, badge_id: int) -> bool:
    """硬刪除徽章"""
    db_badge = get_badge_by_id(db, badge_id)
    if not db_badge:
        return False
    
    db.delete(db_badge)
    db.commit()
    return True

