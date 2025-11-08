from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from datetime import datetime

from app.models.user_checkpoint_progress import UserCheckpointProgress
from app.schemas.user_checkpoint_progress import UserCheckpointProgressCreate, UserCheckpointProgressUpdate


class CRUDUserCheckpointProgress:
    def get(self, db: Session, id: int) -> Optional[UserCheckpointProgress]:
        return db.query(UserCheckpointProgress).filter(UserCheckpointProgress.id == id).first()

    def get_by_user_and_checkpoint(
        self, db: Session, user_id: int, checkpoint_id: int
    ) -> Optional[UserCheckpointProgress]:
        return db.query(UserCheckpointProgress).filter(
            UserCheckpointProgress.user_id == user_id,
            UserCheckpointProgress.checkpoint_id == checkpoint_id
        ).first()

    def get_user_progress_for_mission(
        self, db: Session, user_id: int, mission_id: int
    ) -> List[UserCheckpointProgress]:
        """獲取使用者在特定任務中所有 checkpoint 的進度"""
        from app.models.checkpoint import Checkpoint
        return db.query(UserCheckpointProgress).join(
            Checkpoint, UserCheckpointProgress.checkpoint_id == Checkpoint.id
        ).filter(
            UserCheckpointProgress.user_id == user_id,
            Checkpoint.mission_id == mission_id
        ).all()

    def get_multi_by_user(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[UserCheckpointProgress]:
        return db.query(UserCheckpointProgress).filter(
            UserCheckpointProgress.user_id == user_id
        ).offset(skip).limit(limit).all()

    def create(
        self, db: Session, obj_in: UserCheckpointProgressCreate
    ) -> UserCheckpointProgress:
        db_obj = UserCheckpointProgress(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: UserCheckpointProgress, obj_in: UserCheckpointProgressUpdate
    ) -> UserCheckpointProgress:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # 如果標記為完成,設置完成時間
        if update_data.get("completed") is True and not db_obj.completed:
            update_data["completed_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def mark_completed(
        self, db: Session, user_id: int, checkpoint_id: int, 
        verification_data: Optional[str] = None, points_earned: int = 0
    ) -> UserCheckpointProgress:
        """標記 checkpoint 為已完成"""
        progress = self.get_by_user_and_checkpoint(db, user_id, checkpoint_id)
        
        if not progress:
            # 如果不存在,創建新的進度記錄
            progress = UserCheckpointProgress(
                user_id=user_id,
                checkpoint_id=checkpoint_id,
                completed=True,
                completed_at=datetime.utcnow(),
                verification_data=verification_data,
                points_earned=points_earned
            )
            db.add(progress)
        else:
            # 更新現有記錄
            progress.completed = True
            progress.completed_at = datetime.utcnow()
            if verification_data:
                progress.verification_data = verification_data
            progress.points_earned = points_earned
            db.add(progress)
        
        db.commit()
        db.refresh(progress)
        return progress

    def delete(self, db: Session, id: int) -> Optional[UserCheckpointProgress]:
        obj = db.query(UserCheckpointProgress).filter(UserCheckpointProgress.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


user_checkpoint_progress = CRUDUserCheckpointProgress()
