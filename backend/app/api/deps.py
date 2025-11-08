from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User


def get_db_session() -> Session:
    """取得資料庫 session"""
    return Depends(get_db)


def get_current_active_user() -> User:
    """取得當前活躍使用者"""
    return Depends(get_current_user)

