from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import event as crud_event
from app.schemas.event import EventResponse, EventDetail, EventListResponse
from app.schemas.mission import MissionResponse
from app.models.mission import Mission
from app.models.attendance import Attendance

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


@router.get("", response_model=EventListResponse)
async def get_events(
    status: Optional[str] = Query(None, description="活動狀態: upcoming, ongoing, past"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得活動列表"""
    skip = (page - 1) * limit
    events, total = crud_event.get_events(
        db=db,
        status=status,
        skip=skip,
        limit=limit,
        search=search
    )
    
    # 為每個活動添加額外資訊
    event_responses = []
    for event in events:
        progress = crud_event.get_user_event_progress(db, current_user.id, event.id)
        event_response = EventResponse(
            id=event.id,
            title=event.title,
            description=event.description,
            start_time=event.start_time,
            end_time=event.end_time,
            location=event.location,
            cover_image_url=event.cover_image_url,
            status=get_event_status(event),
            total_missions=progress["total_missions"],
            my_missions_completed=progress["completed_missions"],
            is_registered=progress["completed_missions"] > 0
        )
        event_responses.append(event_response)
    
    return EventListResponse(
        events=event_responses,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    )


@router.get("/{event_id}", response_model=EventDetail)
async def get_event_detail(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得活動詳情"""
    event = crud_event.get_event_by_id(db, event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    
    # 取得 missions
    missions = db.query(Mission).filter(
        Mission.event_id == event_id
    ).order_by(Mission.order).all()
    
    # 取得使用者完成的 missions
    completed_mission_ids = db.query(Attendance.nfc_tag_id).join(
        Mission, Mission.id == Attendance.nfc_tag_id
    ).filter(
        Attendance.user_id == current_user.id,
        Mission.event_id == event_id
    ).distinct().all()
    
    completed_ids = {row[0] for row in completed_mission_ids}
    
    mission_responses = []
    for mission in missions:
        # 檢查是否完成（需要通過 nfc_tag 關聯）
        from app.models.nfc_tag import NFCTag
        nfc_tag = db.query(NFCTag).filter(NFCTag.mission_id == mission.id).first()
        is_completed = nfc_tag and nfc_tag.id in completed_ids if nfc_tag else False
        
        # 取得完成時間
        completed_at = None
        if is_completed and nfc_tag:
            attendance = db.query(Attendance).filter(
                Attendance.user_id == current_user.id,
                Attendance.nfc_tag_id == nfc_tag.id
            ).first()
            if attendance:
                completed_at = attendance.timestamp
        
        mission_responses.append(MissionResponse(
            id=mission.id,
            name=mission.name,
            description=mission.description,
            order=mission.order,
            is_completed=is_completed,
            completed_at=completed_at
        ))
    
    # 取得進度
    progress = crud_event.get_user_event_progress(db, current_user.id, event_id)
    
    # 取得可用徽章（簡化版，實際應該從 badge 表查詢）
    badges_available = []  # TODO: 實作徽章查詢
    
    return EventDetail(
        id=event.id,
        admin_id=event.admin_id,
        admin_name=event.admin.name if event.admin else None,
        title=event.title,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        location=event.location,
        cover_image_url=event.cover_image_url,
        status=get_event_status(event),
        total_missions=len(missions),
        missions=mission_responses,
        my_progress={
            "missions_completed": progress["completed_missions"],
            "total_missions": progress["total_missions"],
            "completion_percentage": progress["completion_percentage"]
        },
        badges_available=badges_available
    )

