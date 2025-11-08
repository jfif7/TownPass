from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import mission as crud_mission
from app.schemas.mission import MissionCreate, MissionUpdate, MissionResponse

router = APIRouter()


@router.post("", response_model=MissionResponse, status_code=status.HTTP_201_CREATED)
async def create_mission(
    mission_data: MissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建新任務"""
    mission = crud_mission.create_mission(db, mission_data.model_dump())
    return mission


@router.get("/{mission_id}", response_model=MissionResponse)
async def get_mission(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得任務詳情"""
    mission = crud_mission.get_mission_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任務不存在"
        )
    return mission


@router.get("/event/{event_id}", response_model=List[MissionResponse])
async def get_missions_by_event(
    event_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得活動的所有任務"""
    missions, total = crud_mission.get_missions_by_event(
        db, event_id, skip, limit
    )
    return missions


@router.put("/{mission_id}", response_model=MissionResponse)
async def update_mission(
    mission_id: int,
    mission_data: MissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新任務"""
    mission = crud_mission.update_mission(
        db,
        mission_id,
        mission_data.model_dump(exclude_unset=True)
    )
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任務不存在"
        )
    return mission


@router.delete("/{mission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mission(
    mission_id: int,
    hard: bool = Query(False, description="是否硬刪除"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除任務"""
    if hard:
        success = crud_mission.hard_delete_mission(db, mission_id)
    else:
        success = crud_mission.delete_mission(db, mission_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任務不存在"
        )
    return None

