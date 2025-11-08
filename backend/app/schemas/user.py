from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, timezone
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=200, description="密碼長度需在 8-200 字元之間")
    name: str = Field(..., min_length=1, max_length=255, description="姓名")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('密碼長度至少需要 8 個字元')
        if len(v) > 200:
            raise ValueError('密碼長度不能超過 200 個字元')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

