from datetime import datetime, timedelta
from typing import Optional
import hashlib

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session

settings = get_settings()

# OAuth2 設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def _preprocess_password(password: str) -> bytes:
    """
    預處理密碼以處理 bcrypt 的 72 字節限制
    使用 SHA-256 hash，返回 32 字節的 bytes（遠小於 72 字節限制）
    """
    return hashlib.sha256(password.encode('utf-8')).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證密碼"""
    # 先對明文密碼進行 SHA-256 hash，然後用 bcrypt 驗證
    preprocessed = _preprocess_password(plain_password)
    # hashed_password 是字符串，需要轉換為 bytes
    return bcrypt.checkpw(preprocessed, hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """
    產生密碼雜湊
    先使用 SHA-256 hash 處理長密碼問題，然後再用 bcrypt
    SHA-256 輸出 32 字節，遠小於 bcrypt 的 72 字節限制
    """
    # 先對密碼進行 SHA-256 hash，確保長度不超過 72 字節
    preprocessed = _preprocess_password(password)
    # 使用 bcrypt 生成 hash，然後轉換為字符串
    hashed = bcrypt.hashpw(preprocessed, bcrypt.gensalt())
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """創建 JWT Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """從 Token 取得當前使用者"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無法驗證憑證",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="使用者帳號已停用"
        )
    
    return user

