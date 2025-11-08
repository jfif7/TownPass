from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import event as crud_event
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter()


def get_event_status(event) -> str:
    """取得活動狀態"""
    now = datetime.now(timezone.utc)
    if event.start_time > now:
        return "upcoming"
    elif event.end_time < now:
        return "past"
    else:
        return "ongoing"


def event_to_response(event) -> EventResponse:
    """將 Event 模型轉換為 EventResponse"""
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        location=event.location,
        cover_image_url=event.cover_image_url,
        status=get_event_status(event),
        total_missions=None,
        my_missions_completed=None,
        is_registered=None
    )


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建新活動"""
    event_dict = event_data.model_dump(exclude_unset=True)
    if not event_dict.get("admin_id"):
        event_dict["admin_id"] = current_user.id
    
    event = crud_event.create_event(db, event_dict)
    return event_to_response(event)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得活動詳情"""
    event = crud_event.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    return event_to_response(event)


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新活動"""
    event = crud_event.update_event(
        db,
        event_id,
        event_data.model_dump(exclude_unset=True)
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    return event_to_response(event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    hard: bool = Query(False, description="是否硬刪除"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除活動"""
    if hard:
        success = crud_event.hard_delete_event(db, event_id)
    else:
        success = crud_event.delete_event(db, event_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    return None

