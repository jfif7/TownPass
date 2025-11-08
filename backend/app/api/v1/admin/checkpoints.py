from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import checkpoint as crud_checkpoint
from app.crud import mission as crud_mission
from app.schemas.checkpoint import CheckpointCreate, CheckpointUpdate, CheckpointResponse

router = APIRouter()


@router.post("", response_model=CheckpointResponse, status_code=status.HTTP_201_CREATED)
async def create_checkpoint(
    checkpoint_data: CheckpointCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建新檢查點"""
    # 驗證任務是否存在
    mission = crud_mission.get_mission_by_id(db, checkpoint_data.mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mission not found"
        )
    
    checkpoint = crud_checkpoint.create_checkpoint(db, checkpoint_data.model_dump())
    return checkpoint


@router.get("/{checkpoint_id}", response_model=CheckpointResponse)
async def get_checkpoint(
    checkpoint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得檢查點詳情"""
    checkpoint = crud_checkpoint.get_checkpoint_by_id(db, checkpoint_id)
    if not checkpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found"
        )
    return checkpoint


@router.get("/mission/{mission_id}", response_model=List[CheckpointResponse])
async def get_checkpoints_by_mission(
    mission_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    include_inactive: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得任務的所有檢查點"""
    # 驗證任務是否存在
    mission = crud_mission.get_mission_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mission not found"
        )
    
    checkpoints, total = crud_checkpoint.get_checkpoints_by_mission(
        db=db,
        mission_id=mission_id,
        skip=skip,
        limit=limit,
        include_inactive=include_inactive
    )
    return checkpoints


@router.get("", response_model=List[CheckpointResponse])
async def get_all_checkpoints(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    include_inactive: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得所有檢查點"""
    checkpoints, total = crud_checkpoint.get_all_checkpoints(
        db=db,
        skip=skip,
        limit=limit,
        include_inactive=include_inactive
    )
    return checkpoints


@router.put("/{checkpoint_id}", response_model=CheckpointResponse)
async def update_checkpoint(
    checkpoint_id: int,
    checkpoint_data: CheckpointUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新檢查點"""
    checkpoint = crud_checkpoint.update_checkpoint(
        db,
        checkpoint_id,
        checkpoint_data.model_dump(exclude_unset=True)
    )
    if not checkpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found"
        )
    return checkpoint


@router.delete("/{checkpoint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkpoint(
    checkpoint_id: int,
    hard: bool = Query(False, description="是否硬刪除"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除檢查點"""
    if hard:
        success = crud_checkpoint.hard_delete_checkpoint(db, checkpoint_id)
    else:
        success = crud_checkpoint.delete_checkpoint(db, checkpoint_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found"
        )
    return None
