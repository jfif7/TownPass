#!/usr/bin/env python3
"""
簡單的資料庫連接測試腳本
用於驗證資料庫設置是否正確
"""

from sqlalchemy import inspect
from app.core.database import engine, Base
from app.models import User, Event, Mission, NFCTag, Attendance, Badge, UserBadge


def test_connection():
    """測試資料庫連接"""
    try:
        with engine.connect() as conn:
            print("✅ 資料庫連接成功！")
            return True
    except Exception as e:
        print(f"❌ 資料庫連接失敗：{e}")
        print("\n請確認：")
        print("1. Docker 容器是否運行：docker ps")
        print("2. 資料庫是否健康：docker-compose ps")
        print("3. DATABASE_URL 是否正確設置")
        return False


def test_tables():
    """檢查資料表是否存在"""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = ["users", "events", "missions", "nfc_tags", "attendance", "badges", "user_badges"]
        
        print(f"\n📊 資料庫中的表：{tables}")
        
        missing_tables = [t for t in expected_tables if t not in tables]
        
        if missing_tables:
            print(f"\n⚠️  缺少以下表：{missing_tables}")
            print("請執行：alembic upgrade head")
            return False
        else:
            print("\n✅ 所有必要的表都已存在！")
            return True
    except Exception as e:
        print(f"❌ 檢查表時發生錯誤：{e}")
        return False


def test_models():
    """測試模型定義"""
    try:
        print("\n🔍 檢查模型定義...")
        
        models = [User, Event, Mission, NFCTag, Attendance, Badge, UserBadge]
        model_names = [m.__name__ for m in models]
        
        print(f"✅ 已載入 {len(models)} 個模型：{', '.join(model_names)}")
        return True
    except Exception as e:
        print(f"❌ 載入模型時發生錯誤：{e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("TownPass 資料庫連接測試")
    print("=" * 50)
    
    # 測試模型
    model_ok = test_models()
    
    # 測試連接
    connection_ok = test_connection()
    
    # 測試表
    tables_ok = False
    if connection_ok:
        tables_ok = test_tables()
    
    print("\n" + "=" * 50)
    if connection_ok and tables_ok and model_ok:
        print("✅ 所有測試通過！")
    else:
        print("❌ 部分測試失敗，請檢查上述訊息")
    print("=" * 50)

