from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.checkpoint import Checkpoint


def get_checkpoint_by_id(db: Session, checkpoint_id: int) -> Checkpoint | None:
    """根據 id 取得檢查點"""
    return db.query(Checkpoint).filter(Checkpoint.id == checkpoint_id).first()


def get_checkpoints_by_mission(
    db: Session,
    mission_id: int,
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False
) -> tuple[List[Checkpoint], int]:
    """取得任務的所有檢查點"""
    query = db.query(Checkpoint).filter(Checkpoint.mission_id == mission_id)
    
    if not include_inactive:
        query = query.filter(Checkpoint.is_active == True)
    
    total = query.count()
    checkpoints = query.order_by(Checkpoint.order).offset(skip).limit(limit).all()
    
    return checkpoints, total


def get_all_checkpoints(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False
) -> tuple[List[Checkpoint], int]:
    """取得所有檢查點"""
    query = db.query(Checkpoint)
    
    if not include_inactive:
        query = query.filter(Checkpoint.is_active == True)
    
    total = query.count()
    checkpoints = query.order_by(Checkpoint.mission_id, Checkpoint.order).offset(skip).limit(limit).all()
    
    return checkpoints, total


def create_checkpoint(db: Session, checkpoint_data: dict) -> Checkpoint:
    """創建新檢查點"""
    db_checkpoint = Checkpoint(**checkpoint_data)
    db.add(db_checkpoint)
    db.commit()
    db.refresh(db_checkpoint)
    return db_checkpoint


def update_checkpoint(db: Session, checkpoint_id: int, checkpoint_data: dict) -> Checkpoint | None:
    """更新檢查點"""
    db_checkpoint = get_checkpoint_by_id(db, checkpoint_id)
    if not db_checkpoint:
        return None
    
    for key, value in checkpoint_data.items():
        if value is not None:
            setattr(db_checkpoint, key, value)
    
    db.commit()
    db.refresh(db_checkpoint)
    return db_checkpoint


def delete_checkpoint(db: Session, checkpoint_id: int) -> bool:
    """刪除檢查點（軟刪除）"""
    db_checkpoint = get_checkpoint_by_id(db, checkpoint_id)
    if not db_checkpoint:
        return False
    
    db_checkpoint.is_active = False
    db.commit()
    return True


def hard_delete_checkpoint(db: Session, checkpoint_id: int) -> bool:
    """硬刪除檢查點"""
    db_checkpoint = get_checkpoint_by_id(db, checkpoint_id)
    if not db_checkpoint:
        return False
    
    db.delete(db_checkpoint)
    db.commit()
    return True


def get_checkpoint_by_nfc_tag(db: Session, nfc_tag_id: int) -> Checkpoint | None:
    """根據 NFC tag ID 取得檢查點"""
    return db.query(Checkpoint).filter(
        Checkpoint.nfc_tag_id == nfc_tag_id,
        Checkpoint.is_active == True
    ).first()


def get_checkpoint_by_qrcode(db: Session, qrcode_data: str) -> Checkpoint | None:
    """根據 QR Code 資料取得檢查點"""
    return db.query(Checkpoint).filter(
        Checkpoint.qrcode_data == qrcode_data,
        Checkpoint.is_active == True
    ).first()
