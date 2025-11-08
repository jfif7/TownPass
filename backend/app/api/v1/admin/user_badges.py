from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import user_badge as crud_user_badge
from app.schemas.badge import UserBadgeCreate, UserBadgeResponse

router = APIRouter()


def user_badge_to_response(user_badge) -> UserBadgeResponse:
    """將 UserBadge 模型轉換為 UserBadgeResponse"""
    return UserBadgeResponse(
        id=user_badge.badge.id,
        name=user_badge.badge.name,
        description=user_badge.badge.description,
        image_url=user_badge.badge.image_url,
        badge_type=user_badge.badge.badge_type,
        timestamp_earned=user_badge.timestamp_earned,
        event_id=user_badge.event_id,
        event_title=user_badge.event.title if user_badge.event else None
    )


@router.post("", response_model=UserBadgeResponse, status_code=status.HTTP_201_CREATED)
async def create_user_badge(
    user_badge_data: UserBadgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """授予使用者徽章"""
    user_badge = crud_user_badge.create_user_badge(
        db,
        user_badge_data.model_dump()
    )
    
    # 轉換為響應格式
    return user_badge_to_response(user_badge)


@router.get("", response_model=List[UserBadgeResponse])
async def get_user_badges(
    user_id: Optional[int] = Query(None),
    event_id: Optional[int] = Query(None),
    badge_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得使用者徽章列表"""
    if not user_id:
        user_id = current_user.id
    
    user_badges, total = crud_user_badge.get_user_badges_by_user(
        db, user_id, event_id, badge_id, skip, limit
    )
    
    # 轉換為響應格式
    return [user_badge_to_response(ub) for ub in user_badges]


@router.get("/{user_badge_id}", response_model=UserBadgeResponse)
async def get_user_badge(
    user_badge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得使用者徽章詳情"""
    user_badge = crud_user_badge.get_user_badge_by_id(db, user_badge_id)
    if not user_badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="使用者徽章不存在"
        )
    
    return user_badge_to_response(user_badge)


@router.delete("/{user_badge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_badge(
    user_badge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """移除使用者徽章"""
    success = crud_user_badge.delete_user_badge(db, user_badge_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="使用者徽章不存在"
        )
    return None


@router.delete("/user/{user_id}/badge/{badge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_badge_by_ids(
    user_id: int,
    badge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """根據使用者和徽章 ID 移除徽章"""
    success = crud_user_badge.delete_user_badge_by_user_and_badge(
        db, user_id, badge_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="使用者徽章不存在"
        )
    return None

