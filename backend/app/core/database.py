from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# 創建資料庫引擎
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # 檢查連線是否有效
    pool_size=10,
    max_overflow=20,
)

# 創建 SessionLocal 類別
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 創建 Base 類別，所有模型將繼承它
Base = declarative_base()


# 依賴注入：取得資料庫 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

