from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.models.user_badge import UserBadge


def get_user_badge_by_id(db: Session, user_badge_id: int) -> UserBadge | None:
    """根據 id 取得使用者徽章"""
    return db.query(UserBadge).options(
        joinedload(UserBadge.badge),
        joinedload(UserBadge.event)
    ).filter(UserBadge.id == user_badge_id).first()


def get_user_badges_by_user(
    db: Session,
    user_id: int,
    event_id: Optional[int] = None,
    badge_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[UserBadge], int]:
    """取得使用者的徽章列表"""
    query = db.query(UserBadge).options(
        joinedload(UserBadge.badge),
        joinedload(UserBadge.event)
    ).filter(UserBadge.user_id == user_id)
    
    if event_id:
        query = query.filter(UserBadge.event_id == event_id)
    
    if badge_id:
        query = query.filter(UserBadge.badge_id == badge_id)
    
    total = query.count()
    user_badges = query.order_by(UserBadge.timestamp_earned.desc()).offset(skip).limit(limit).all()
    
    return user_badges, total


def create_user_badge(db: Session, user_badge_data: dict) -> UserBadge:
    """創建使用者徽章"""
    # 檢查是否已存在
    existing = db.query(UserBadge).options(
        joinedload(UserBadge.badge),
        joinedload(UserBadge.event)
    ).filter(
        UserBadge.user_id == user_badge_data["user_id"],
        UserBadge.badge_id == user_badge_data["badge_id"]
    ).first()
    
    if existing:
        return existing  # 已存在，返回現有記錄
    
    db_user_badge = UserBadge(**user_badge_data)
    db.add(db_user_badge)
    db.commit()
    db.refresh(db_user_badge)
    
    # 重新載入關聯資料
    db_user_badge = db.query(UserBadge).options(
        joinedload(UserBadge.badge),
        joinedload(UserBadge.event)
    ).filter(UserBadge.id == db_user_badge.id).first()
    
    return db_user_badge


def delete_user_badge(db: Session, user_badge_id: int) -> bool:
    """刪除使用者徽章"""
    db_user_badge = get_user_badge_by_id(db, user_badge_id)
    if not db_user_badge:
        return False
    
    db.delete(db_user_badge)
    db.commit()
    return True


def delete_user_badge_by_user_and_badge(
    db: Session,
    user_id: int,
    badge_id: int
) -> bool:
    """根據使用者和徽章 ID 刪除"""
    db_user_badge = db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_id == badge_id
    ).first()
    
    if not db_user_badge:
        return False
    
    db.delete(db_user_badge)
    db.commit()
    return True

