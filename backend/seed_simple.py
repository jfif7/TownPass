"""
簡易版假資料生成腳本 (不清空現有資料)
用於在現有資料基礎上添加測試資料

使用方式:
    python seed_simple.py
"""
import random
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.checkpoint import Checkpoint
from app.models.badge import Badge
from app.models.nfc_tag import NFCTag
from app.models.user_badge import UserBadge
from app.models.user_checkpoint_progress import UserCheckpointProgress
from app.models.attendance import Attendance
from app.core.security import get_password_hash


def add_sample_data():
    """添加範例資料 (不清空現有資料)"""
    print("🌟 開始生成範例資料...")
    
    # 確保資料庫表存在
    print("🔧 檢查並創建資料庫表...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. 確保有至少一個管理員
        admin = db.query(User).filter(User.email == "admin@townpass.com").first()
        if not admin:
            admin = User(
                email="admin@townpass.com",
                hashed_password=get_password_hash("admin123"),
                name="系統管理員",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ 創建管理員帳號")
        
        # 2. 創建一個測試活動
        now = datetime.now(timezone.utc)
        event = Event(
            admin_id=admin.id,
            title="台北101探索之旅",
            description="探索台北101周邊的文化景點，完成任務獲得徽章！",
            start_time=now - timedelta(days=1),
            end_time=now + timedelta(days=7),
            location="台北101",
            cover_image_url="https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
            status="ongoing",
            is_active=True,
            max_participants=50
        )
        db.add(event)
        db.commit()
        print(f"✅ 創建活動: {event.title}")
        
        # 3. 為活動創建 3 個任務
        missions_data = [
            {"name": "探索信義商圈", "description": "走訪信義區的各個景點"},
            {"name": "美食尋寶", "description": "品嚐信義區的特色美食"},
            {"name": "文化巡禮", "description": "了解信義區的歷史文化"},
        ]
        
        missions = []
        for idx, m_data in enumerate(missions_data):
            mission = Mission(
                event_id=event.id,
                name=m_data["name"],
                description=m_data["description"],
                order=idx + 1,
                is_active=True
            )
            db.add(mission)
            db.flush()
            missions.append(mission)
            print(f"✅ 創建任務: {mission.name}")
        
        # 4. 為每個任務創建 3 種檢查點
        checkpoint_configs = [
            {"type": "nfc", "name": "NFC 打卡", "description": "使用 NFC 感應打卡"},
            {"type": "question", "name": "問答挑戰", "description": "回答問題獲得積分", "question": "這個地方最有名的是什麼？"},
            {"type": "qrcode", "name": "QR Code 掃描", "description": "掃描 QR Code 完成打卡", "qrcode": "QR-12345"},
        ]
        
        checkpoints_count = 0
        for mission in missions:
            for idx, cp_config in enumerate(checkpoint_configs):
                checkpoint_data = {
                    "mission_id": mission.id,
                    "name": cp_config["name"],
                    "description": cp_config["description"],
                    "checkpoint_type": cp_config["type"],
                    "lat": 25.033 + random.uniform(-0.01, 0.01),
                    "lng": 121.565 + random.uniform(-0.01, 0.01),
                    "order": idx + 1,
                    "reward_points": 10,
                    "is_active": True,
                }
                
                if cp_config["type"] == "question":
                    checkpoint_data["question_data"] = cp_config["question"]
                elif cp_config["type"] == "qrcode":
                    checkpoint_data["qrcode_data"] = cp_config["qrcode"]
                
                checkpoint = Checkpoint(**checkpoint_data)
                db.add(checkpoint)
                db.flush()
                checkpoints_count += 1
                
                # 為 NFC 檢查點創建標籤
                if cp_config["type"] == "nfc":
                    nfc_tag = NFCTag(
                        tag_uid=f"NFC-{mission.id}-{idx}",
                        checkpoint_id=checkpoint.id,
                        reward_points=10,
                        is_active=True
                    )
                    db.add(nfc_tag)
        
        db.commit()
        print(f"✅ 創建了 {checkpoints_count} 個檢查點")
        
        # 5. 為每個任務創建徽章
        for mission in missions:
            badge = Badge(
                name=f"{mission.name} 完成徽章",
                description=f"完成 {mission.name} 獲得的徽章",
                image_url="https://images.unsplash.com/photo-1618609378039-b572f64c5b42",
                badge_type="event",
                is_active=True
            )
            db.add(badge)
        
        db.commit()
        print(f"✅ 創建了 {len(missions)} 個徽章")
        
        print("\n✅ 範例資料生成完成！")
        print(f"\n📋 已創建:")
        print(f"   - 1 個活動: {event.title}")
        print(f"   - {len(missions)} 個任務")
        print(f"   - {checkpoints_count} 個檢查點")
        print(f"   - {len(missions)} 個徽章")
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_sample_data()

