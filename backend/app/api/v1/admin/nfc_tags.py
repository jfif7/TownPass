from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import nfc_tag as crud_nfc_tag
from app.schemas.badge import NFCTagCreate, NFCTagUpdate, NFCTagResponse

router = APIRouter()


@router.post("", response_model=NFCTagResponse, status_code=status.HTTP_201_CREATED)
async def create_nfc_tag(
    nfc_tag_data: NFCTagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建新 NFC 標籤"""
    # 檢查 tag_uid 是否已存在
    existing = crud_nfc_tag.get_nfc_tag_by_uid(db, nfc_tag_data.tag_uid)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="此 NFC 標籤 UID 已存在"
        )
    
    nfc_tag = crud_nfc_tag.create_nfc_tag(db, nfc_tag_data.model_dump())
    return nfc_tag


@router.get("/{nfc_tag_id}", response_model=NFCTagResponse)
async def get_nfc_tag(
    nfc_tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得 NFC 標籤詳情"""
    nfc_tag = crud_nfc_tag.get_nfc_tag_by_id(db, nfc_tag_id)
    if not nfc_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NFC 標籤不存在"
        )
    return nfc_tag


@router.get("/mission/{mission_id}", response_model=List[NFCTagResponse])
async def get_nfc_tags_by_mission(
    mission_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得任務的所有 NFC 標籤"""
    nfc_tags, total = crud_nfc_tag.get_nfc_tags_by_mission(
        db, mission_id, skip, limit
    )
    return nfc_tags


@router.put("/{nfc_tag_id}", response_model=NFCTagResponse)
async def update_nfc_tag(
    nfc_tag_id: int,
    nfc_tag_data: NFCTagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新 NFC 標籤"""
    # 如果更新 tag_uid，檢查是否重複
    if nfc_tag_data.tag_uid:
        existing = crud_nfc_tag.get_nfc_tag_by_uid(db, nfc_tag_data.tag_uid)
        if existing and existing.id != nfc_tag_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="此 NFC 標籤 UID 已被使用"
            )
    
    nfc_tag = crud_nfc_tag.update_nfc_tag(
        db,
        nfc_tag_id,
        nfc_tag_data.model_dump(exclude_unset=True)
    )
    if not nfc_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NFC 標籤不存在"
        )
    return nfc_tag


@router.delete("/{nfc_tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_nfc_tag(
    nfc_tag_id: int,
    hard: bool = Query(False, description="是否硬刪除"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除 NFC 標籤"""
    if hard:
        success = crud_nfc_tag.hard_delete_nfc_tag(db, nfc_tag_id)
    else:
        success = crud_nfc_tag.delete_nfc_tag(db, nfc_tag_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NFC 標籤不存在"
        )
    return None

