from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import badge as crud_badge
from app.schemas.badge import BadgeCreate, BadgeUpdate, BadgeResponse

router = APIRouter()


@router.post("", response_model=BadgeResponse, status_code=status.HTTP_201_CREATED)
async def create_badge(
    badge_data: BadgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建新徽章"""
    badge = crud_badge.create_badge(db, badge_data.model_dump())
    return badge


@router.get("", response_model=List[BadgeResponse])
async def get_badges(
    badge_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得徽章列表"""
    badges = crud_badge.get_all_badges(db)
    
    if badge_type:
        badges = [b for b in badges if b.badge_type == badge_type]
    
    if is_active is not None:
        badges = [b for b in badges if b.is_active == is_active]
    
    return badges


@router.get("/{badge_id}", response_model=BadgeResponse)
async def get_badge(
    badge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得徽章詳情"""
    badge = crud_badge.get_badge_by_id(db, badge_id)
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="徽章不存在"
        )
    return badge


@router.put("/{badge_id}", response_model=BadgeResponse)
async def update_badge(
    badge_id: int,
    badge_data: BadgeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新徽章"""
    badge = crud_badge.update_badge(
        db,
        badge_id,
        badge_data.model_dump(exclude_unset=True)
    )
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="徽章不存在"
        )
    return badge


@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_badge(
    badge_id: int,
    hard: bool = Query(False, description="是否硬刪除"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除徽章"""
    if hard:
        success = crud_badge.hard_delete_badge(db, badge_id)
    else:
        success = crud_badge.delete_badge(db, badge_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="徽章不存在"
        )
    return None

