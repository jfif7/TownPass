from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import badge as crud_badge
from app.schemas.badge import BadgeResponse, UserBadgeResponse, BadgeListResponse
from app.models.badge import Badge
from app.models.user_badge import UserBadge

router = APIRouter()


@router.get("/me/badges", response_model=BadgeListResponse)
async def get_my_badges(
    event_id: Optional[int] = Query(None),
    badge_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得我的徽章"""
    user_badges = crud_badge.get_user_badges(
        db=db,
        user_id=current_user.id,
        event_id=event_id,
        badge_type=badge_type
    )
    
    badge_responses = []
    for ub in user_badges:
        badge_responses.append(UserBadgeResponse(
            id=ub.badge.id,
            name=ub.badge.name,
            description=ub.badge.description,
            image_url=ub.badge.image_url,
            badge_type=ub.badge.badge_type,
            timestamp_earned=ub.timestamp_earned,
            event_id=ub.event_id,
            event_title=ub.event.title if ub.event else None
        ))
    
    # 計算摘要
    total_badges = len(badge_responses)
    by_type = {}
    for badge in badge_responses:
        badge_type = badge.badge_type
        by_type[badge_type] = by_type.get(badge_type, 0) + 1
    
    return BadgeListResponse(
        badges=badge_responses,
        statistics={
            "total_badges": total_badges,
            "by_type": by_type
        }
    )


@router.get("/all", response_model=BadgeListResponse)
async def get_all_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得所有徽章（包含已獲得和未獲得的）"""
    badges = crud_badge.get_all_badges(db, user_id=current_user.id)
    
    badge_responses = []
    earned_count = 0
    
    for badge in badges:
        is_earned = crud_badge.check_user_has_badge(db, current_user.id, badge.id)
        if is_earned:
            earned_count += 1
        
        # 取得獲得時間（如果已獲得）
        timestamp_earned = None
        if is_earned:
            user_badge = db.query(UserBadge).filter(
                UserBadge.user_id == current_user.id,
                UserBadge.badge_id == badge.id
            ).first()
            if user_badge:
                timestamp_earned = user_badge.timestamp_earned
        
        badge_responses.append(BadgeResponse(
            id=badge.id,
            name=badge.name,
            description=badge.description,
            image_url=badge.image_url,
            badge_type=badge.badge_type,
            is_earned=is_earned,
            timestamp_earned=timestamp_earned
        ))
    
    return BadgeListResponse(
        badges=badge_responses,
        statistics={
            "total_badges": len(badges),
            "earned_count": earned_count,
            "completion_percentage": (earned_count / len(badges) * 100) if badges else 0
        }
    )

