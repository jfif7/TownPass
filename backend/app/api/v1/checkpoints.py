from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import checkpoint as crud_checkpoint
from app.crud import mission as crud_mission
from app.crud.user_checkpoint_progress import user_checkpoint_progress
from app.schemas.checkpoint import CheckpointResponse
from app.schemas.user_checkpoint_progress import CheckpointWithProgress

router = APIRouter()


@router.get("/missions/{mission_id}/checkpoints", response_model=List[CheckpointWithProgress])
async def get_mission_checkpoints(
    mission_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得任務的所有檢查點及使用者完成狀態"""
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
        include_inactive=False
    )
    
    # 獲取使用者在這個任務的所有進度
    user_progress_list = user_checkpoint_progress.get_user_progress_for_mission(
        db=db, user_id=current_user.id, mission_id=mission_id
    )
    print(current_user.id, mission_id, user_progress_list)
    
    # 建立進度查詢字典
    progress_map = {progress.checkpoint_id: progress for progress in user_progress_list}
    
    checkpoint_responses = []
    for checkpoint in checkpoints:
        progress = progress_map.get(checkpoint.id)
        checkpoint_response = CheckpointWithProgress(
            id=checkpoint.id,
            mission_id=checkpoint.mission_id,
            name=checkpoint.name,
            description=checkpoint.description,
            checkpoint_type=checkpoint.checkpoint_type.value,
            lat=checkpoint.lat,
            lng=checkpoint.lng,
            order=checkpoint.order,
            reward_points=checkpoint.reward_points,
            is_active=checkpoint.is_active,
            completed=progress.completed if progress else False,
            completed_at=progress.completed_at if progress else None,
            points_earned=progress.points_earned if progress else 0
        )
        checkpoint_responses.append(checkpoint_response)
    
    return checkpoint_responses


@router.get("/checkpoints/{checkpoint_id}", response_model=CheckpointWithProgress)
async def get_checkpoint(
    checkpoint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得單一檢查點資訊及使用者完成狀態"""
    checkpoint = crud_checkpoint.get_checkpoint_by_id(db, checkpoint_id)
    if not checkpoint or not checkpoint.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found"
        )
    
    # 獲取使用者進度
    progress = user_checkpoint_progress.get_by_user_and_checkpoint(
        db=db, user_id=current_user.id, checkpoint_id=checkpoint_id
    )
    
    return CheckpointWithProgress(
        id=checkpoint.id,
        mission_id=checkpoint.mission_id,
        name=checkpoint.name,
        description=checkpoint.description,
        checkpoint_type=checkpoint.checkpoint_type.value,
        lat=checkpoint.lat,
        lng=checkpoint.lng,
        order=checkpoint.order,
        reward_points=checkpoint.reward_points,
        is_active=checkpoint.is_active,
        completed=progress.completed if progress else False,
        completed_at=progress.completed_at if progress else None,
        points_earned=progress.points_earned if progress else 0
    )


@router.post("/checkpoints/{checkpoint_id}/complete")
async def complete_checkpoint(
    checkpoint_id: int,
    verification_data: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """完成檢查點並記錄進度"""
    checkpoint = crud_checkpoint.get_checkpoint_by_id(db, checkpoint_id)
    if not checkpoint or not checkpoint.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found"
        )
    
    # 檢查是否已完成
    existing_progress = user_checkpoint_progress.get_by_user_and_checkpoint(
        db=db, user_id=current_user.id, checkpoint_id=checkpoint_id
    )
    if existing_progress and existing_progress.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Checkpoint already completed"
        )
    
    # TODO: 驗證檢查點條件（NFC/QRCode/問題答案）
    # 根據 checkpoint_type 進行相應的驗證
    
    # 標記為完成並給予獎勵積分
    progress = user_checkpoint_progress.mark_completed(
        db=db,
        user_id=current_user.id,
        checkpoint_id=checkpoint_id,
        verification_data=verification_data,
        points_earned=checkpoint.reward_points
    )
    
    return {
        "message": "Checkpoint completed successfully",
        "checkpoint_id": checkpoint_id,
        "points_earned": checkpoint.reward_points,
        "completed_at": progress.completed_at
    }
