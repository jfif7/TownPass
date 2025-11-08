from sqlalchemy.orm import Session
from typing import List
from app.models.nfc_tag import NFCTag
from app.models.mission import Mission
from app.models.event import Event


def get_nfc_tag_by_uid(db: Session, tag_uid: str) -> NFCTag | None:
    """根據 tag_uid 取得 NFC 標籤"""
    return db.query(NFCTag).filter(NFCTag.tag_uid == tag_uid).first()


def get_nfc_tag_with_mission(db: Session, tag_uid: str) -> tuple[NFCTag, Mission, Event] | None:
    """取得 NFC 標籤及其關聯的 mission 和 event"""
    nfc_tag = db.query(NFCTag).filter(NFCTag.tag_uid == tag_uid).first()
    if not nfc_tag:
        return None
    
    mission = db.query(Mission).filter(Mission.id == nfc_tag.mission_id).first()
    if not mission:
        return None
    
    event = db.query(Event).filter(Event.id == mission.event_id).first()
    if not event:
        return None
    
    return nfc_tag, mission, event


def get_nfc_tag_by_id(db: Session, nfc_tag_id: int) -> NFCTag | None:
    """根據 id 取得 NFC 標籤"""
    return db.query(NFCTag).filter(NFCTag.id == nfc_tag_id).first()


def get_nfc_tags_by_mission(
    db: Session,
    mission_id: int,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[NFCTag], int]:
    """取得任務的所有 NFC 標籤"""
    query = db.query(NFCTag).filter(
        NFCTag.mission_id == mission_id,
        NFCTag.is_active == True
    )
    
    total = query.count()
    nfc_tags = query.offset(skip).limit(limit).all()
    
    return nfc_tags, total


def create_nfc_tag(db: Session, nfc_tag_data: dict) -> NFCTag:
    """創建新 NFC 標籤"""
    db_nfc_tag = NFCTag(**nfc_tag_data)
    db.add(db_nfc_tag)
    db.commit()
    db.refresh(db_nfc_tag)
    return db_nfc_tag


def update_nfc_tag(db: Session, nfc_tag_id: int, nfc_tag_data: dict) -> NFCTag | None:
    """更新 NFC 標籤"""
    db_nfc_tag = get_nfc_tag_by_id(db, nfc_tag_id)
    if not db_nfc_tag:
        return None
    
    for key, value in nfc_tag_data.items():
        if value is not None:
            setattr(db_nfc_tag, key, value)
    
    db.commit()
    db.refresh(db_nfc_tag)
    return db_nfc_tag


def delete_nfc_tag(db: Session, nfc_tag_id: int) -> bool:
    """刪除 NFC 標籤（軟刪除）"""
    db_nfc_tag = get_nfc_tag_by_id(db, nfc_tag_id)
    if not db_nfc_tag:
        return False
    
    db_nfc_tag.is_active = False
    db.commit()
    return True


def hard_delete_nfc_tag(db: Session, nfc_tag_id: int) -> bool:
    """硬刪除 NFC 標籤"""
    db_nfc_tag = get_nfc_tag_by_id(db, nfc_tag_id)
    if not db_nfc_tag:
        return False
    
    db.delete(db_nfc_tag)
    db.commit()
    return True

