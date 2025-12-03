"""
生成假資料的腳本
用於開發和測試環境

使用方式:
    python seed.py

注意: 會清空現有資料並重新生成
"""
import sys
import random
from datetime import datetime, timedelta, timezone
from faker import Faker

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.checkpoint import Checkpoint
from app.models.badge import Badge
from app.models.nfc_tag import NFCTag
from app.models.user_badge import UserBadge
from app.models.attendance import Attendance
from app.models.user_checkpoint_progress import UserCheckpointProgress
from app.core.security import get_password_hash

# 初始化 Faker (支援繁體中文)
fake = Faker(['zh_TW', 'en_US'])

# 台北市各區景點
TAIPEI_LOCATIONS = [
    "台北101",
    "國父紀念館",
    "中正紀念堂",
    "西門町",
    "信義商圈",
    "饒河夜市",
    "寧夏夜市",
    "士林夜市",
    "北投溫泉",
    "陽明山國家公園",
    "故宮博物院",
    "龍山寺",
    "大稻埕碼頭",
    "華山1914文創園區",
    "松山文創園區",
]

# 活動封面圖片 URLs
EVENT_COVER_IMAGES = [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    "https://images.unsplash.com/photo-1511578314322-379afb476865",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
]

# 徽章圖片 URLs
BADGE_IMAGES = [
    "https://images.unsplash.com/photo-1618609378039-b572f64c5b42",
    "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f",
    "https://images.unsplash.com/photo-1604871000636-074fa5117945",
    "https://images.unsplash.com/photo-1589561253898-768105ca91a8",
    "https://images.unsplash.com/photo-1587837073080-448bc6a2329b",
]

# 任務名稱範本
MISSION_TEMPLATES = [
    "探索{location}之旅",
    "發現{location}的秘密",
    "{location}尋寶記",
    "走訪{location}",
    "{location}文化巡禮",
]

# 問題範本
QUESTIONS = [
    "這裡最有名的特色是什麼？",
    "這個景點建於哪一年？",
    "這裡的開放時間是？",
    "請問這個地方的歷史背景？",
    "這裡最適合什麼季節來訪？",
    "這個景點的門票價格是多少？",
    "請描述這裡最特別的建築特色",
    "這個地方與哪個歷史人物有關？",
]


def clear_database():
    """清空資料庫所有資料"""
    print("🗑️  清空現有資料...")
    db = SessionLocal()
    try:
        # 刪除順序很重要，要先刪除有外鍵關聯的資料
        db.query(UserCheckpointProgress).delete()
        db.query(UserBadge).delete()
        db.query(Attendance).delete()
        db.query(NFCTag).delete()
        db.query(Checkpoint).delete()
        db.query(Badge).delete()
        db.query(Mission).delete()
        db.query(Event).delete()
        db.query(User).delete()
        db.commit()
        print("✅ 資料清空完成")
    except Exception as e:
        print(f"❌ 清空資料失敗: {e}")
        db.rollback()
    finally:
        db.close()


def create_users(db, count=10):
    """創建使用者"""
    print(f"\n👥 創建 {count} 個使用者...")
    users = []
    
    # 創建管理員
    admin = User(
        email="admin@townpass.com",
        hashed_password=get_password_hash("admin123"),
        name="系統管理員",
        is_active=True
    )
    db.add(admin)
    users.append(admin)
    
    # 創建一般使用者
    for i in range(count - 1):
        user = User(
            email=fake.email(),
            hashed_password=get_password_hash("password123"),
            name=fake.name(),
            is_active=True
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"✅ 創建了 {len(users)} 個使用者")
    return users


def create_events(db, admin_user, upcoming=3, ongoing=4, completed=2):
    """創建活動"""
    print(f"\n📅 創建活動 (upcoming: {upcoming}, ongoing: {ongoing}, completed: {completed})...")
    events = []
    now = datetime.now(timezone.utc)
    
    event_types = [
        ("upcoming", upcoming, timedelta(days=7), timedelta(days=14)),
        ("ongoing", ongoing, timedelta(days=-3), timedelta(days=7)),
        ("past", completed, timedelta(days=-30), timedelta(days=-7)),
    ]
    
    for status, count, start_offset, end_offset in event_types:
        for i in range(count):
            location = random.choice(TAIPEI_LOCATIONS)
            start_time = now + start_offset + timedelta(days=random.randint(0, 3))
            end_time = start_time + (end_offset - start_offset)
            
            event = Event(
                admin_id=admin_user.id,
                title=f"{location}探索活動",
                description=fake.text(max_nb_chars=200),
                start_time=start_time,
                end_time=end_time,
                location=location,
                cover_image_url=random.choice(EVENT_COVER_IMAGES),
                status=status,
                is_active=True,
                max_participants=random.randint(20, 100)
            )
            db.add(event)
            events.append(event)
    
    db.commit()
    print(f"✅ 創建了 {len(events)} 個活動")
    return events


def create_missions_and_checkpoints(db, events):
    """為每個活動創建任務和檢查點"""
    print(f"\n🎯 為 {len(events)} 個活動創建任務和檢查點...")
    
    all_missions = []
    all_checkpoints = []
    all_nfc_tags = []
    
    # 台北市區的經緯度範圍
    taipei_lat_range = (25.010, 25.090)
    taipei_lng_range = (121.450, 121.650)
    
    for event in events:
        # 每個活動 3 個任務
        for mission_idx in range(3):
            mission = Mission(
                event_id=event.id,
                name=random.choice(MISSION_TEMPLATES).format(location=event.location),
                description=fake.text(max_nb_chars=150),
                order=mission_idx + 1,
                is_active=True
            )
            db.add(mission)
            db.flush()  # 確保獲得 mission.id
            all_missions.append(mission)
            
            # 每個任務 3 個檢查點 (nfc, question, qrcode 各一)
            checkpoint_types = ['nfc', 'question', 'qrcode']
            
            for cp_idx, cp_type in enumerate(checkpoint_types):
                lat = random.uniform(*taipei_lat_range)
                lng = random.uniform(*taipei_lng_range)
                
                checkpoint_data = {
                    "mission_id": mission.id,
                    "name": f"{cp_type.upper()} 檢查點 {cp_idx + 1}",
                    "description": f"請完成 {cp_type} 檢查",
                    "checkpoint_type": cp_type,
                    "lat": lat,
                    "lng": lng,
                    "order": cp_idx + 1,
                    "reward_points": random.randint(5, 20),
                    "is_active": True,
                }
                
                # 根據類型添加額外資料
                if cp_type == "question":
                    checkpoint_data["question_data"] = random.choice(QUESTIONS)
                elif cp_type == "qrcode":
                    checkpoint_data["qrcode_data"] = f"QR-{fake.uuid4()[:8]}"
                
                checkpoint = Checkpoint(**checkpoint_data)
                db.add(checkpoint)
                db.flush()
                all_checkpoints.append(checkpoint)
                
                # 為 NFC 檢查點創建 NFC 標籤
                if cp_type == "nfc":
                    nfc_tag = NFCTag(
                        tag_uid=fake.uuid4(),
                        checkpoint_id=checkpoint.id,
                        reward_points=checkpoint.reward_points,
                        is_active=True
                    )
                    db.add(nfc_tag)
                    all_nfc_tags.append(nfc_tag)
    
    db.commit()
    print(f"✅ 創建了 {len(all_missions)} 個任務")
    print(f"✅ 創建了 {len(all_checkpoints)} 個檢查點")
    print(f"✅ 創建了 {len(all_nfc_tags)} 個 NFC 標籤")
    
    return all_missions, all_checkpoints


def create_badges(db, missions):
    """為每個任務創建徽章"""
    print(f"\n🏆 為 {len(missions)} 個任務創建徽章...")
    badges = []
    
    badge_types = ["event", "global", "special"]
    
    for mission in missions:
        badge = Badge(
            name=f"{mission.name} 完成徽章",
            description=f"完成 {mission.name} 獲得的徽章",
            image_url=random.choice(BADGE_IMAGES),
            badge_type=random.choice(badge_types),
            is_active=True
        )
        db.add(badge)
        badges.append(badge)
    
    db.commit()
    print(f"✅ 創建了 {len(badges)} 個徽章")
    
    # 創建任務ID到徽章的映射，用於後續授予
    mission_badge_map = {mission.id: badge for mission, badge in zip(missions, badges)}
    return badges, mission_badge_map


def create_user_progress(db, users, events, checkpoints, mission_badge_map):
    """為部分使用者創建進度資料"""
    print(f"\n📊 創建使用者進度資料...")
    
    # 隨機選擇一些ongoing和past的活動
    active_events = [e for e in events if e.status in ['ongoing', 'past']]
    
    attendances = []
    progresses = []
    user_badges_list = []
    
    for user in users[:5]:  # 只為前5個使用者創建進度
        # 每個使用者參加1-3個活動
        user_events = random.sample(active_events, min(random.randint(1, 3), len(active_events)))
        
        for event in user_events:
            # 找出該活動相關的 NFC 標籤
            # 先找出活動的任務
            event_mission_ids = [m.id for m in db.query(Mission).filter(Mission.event_id == event.id).all()]
            # 找出任務下的 NFC 檢查點
            nfc_checkpoints = [cp for cp in checkpoints if cp.mission_id in event_mission_ids and cp.checkpoint_type == 'nfc']
            
            # 如果有 NFC 檢查點，隨機選一個來報到
            nfc_tag_id = None
            if nfc_checkpoints:
                target_cp = random.choice(nfc_checkpoints)
                # 查詢對應的 NFC Tag
                nfc_tag = db.query(NFCTag).filter(NFCTag.checkpoint_id == target_cp.id).first()
                if nfc_tag:
                    nfc_tag_id = nfc_tag.id
            
            # 只有在找到 NFC Tag 時才創建報到記錄 (因為模型限制 nfc_tag_id 不能為空)
            if nfc_tag_id:
                attendance = Attendance(
                    user_id=user.id,
                    event_id=event.id,
                    nfc_tag_id=nfc_tag_id,
                    timestamp=event.start_time + timedelta(hours=random.randint(1, 24))
                )
                db.add(attendance)
                attendances.append(attendance)
            
            # 為該活動的部分檢查點創建完成記錄
            event_checkpoints = [cp for cp in checkpoints 
                               if any(m.event_id == event.id for m in db.query(Mission).filter(Mission.id == cp.mission_id).all())]
            
            completed_count = random.randint(1, min(5, len(event_checkpoints)))
            completed_checkpoints = random.sample(event_checkpoints, completed_count)
            
            for checkpoint in completed_checkpoints:
                progress = UserCheckpointProgress(
                    user_id=user.id,
                    checkpoint_id=checkpoint.id,
                    completed=True,
                    completed_at=attendance.timestamp + timedelta(minutes=random.randint(5, 60))
                )
                db.add(progress)
                progresses.append(progress)
            
            # 如果完成了某個任務的所有檢查點，授予徽章
            event_missions = db.query(Mission).filter(Mission.event_id == event.id).all()
            for mission in event_missions:
                mission_checkpoints = [cp for cp in event_checkpoints if cp.mission_id == mission.id]
                if mission_checkpoints and all(cp in completed_checkpoints for cp in mission_checkpoints):
                    # 從映射中獲取對應的徽章
                    badge = mission_badge_map.get(mission.id)
                    if badge:
                        completed_at_list = [progress.completed_at for progress in progresses 
                                           if progress.checkpoint_id in [cp.id for cp in mission_checkpoints]]
                        if completed_at_list:
                            user_badge = UserBadge(
                                user_id=user.id,
                                badge_id=badge.id,
                                event_id=event.id,
                                timestamp_earned=max(completed_at_list)
                            )
                            db.add(user_badge)
                            user_badges_list.append(user_badge)
    
    db.commit()
    print(f"✅ 創建了 {len(attendances)} 個報到記錄")
    print(f"✅ 創建了 {len(progresses)} 個檢查點完成記錄")
    print(f"✅ 授予了 {len(user_badges_list)} 個徽章")


def main():
    """主函數"""
    print("=" * 50)
    print("🌟 TownPass 假資料生成工具")
    print("=" * 50)
    
    # 確認是否要清空資料
    response = input("\n⚠️  警告: 此操作將清空所有現有資料！\n是否繼續? (yes/no): ").strip().lower()
    if response not in ['yes', 'y']:
        print("❌ 操作已取消")
        return
    
    # 清空資料庫
    clear_database()
    
    # 創建資料庫連線
    db = SessionLocal()
    
    try:
        # 1. 創建使用者
        users = create_users(db, count=10)
        admin = users[0]
        
        # 2. 創建活動
        events = create_events(db, admin, upcoming=3, ongoing=4, completed=2)
        
        # 3. 創建任務和檢查點
        missions, checkpoints = create_missions_and_checkpoints(db, events)
        
        # 4. 創建徽章
        badges, mission_badge_map = create_badges(db, missions)
        
        # 5. 創建使用者進度
        create_user_progress(db, users, events, checkpoints, mission_badge_map)
        
        print("\n" + "=" * 50)
        print("✅ 假資料生成完成！")
        print("=" * 50)
        print("\n📋 資料統計:")
        print(f"   👥 使用者: {len(users)}")
        print(f"   📅 活動: {len(events)}")
        print(f"   🎯 任務: {len(missions)}")
        print(f"   📍 檢查點: {len(checkpoints)}")
        print(f"   🏆 徽章: {len(badges)}")
        print("\n🔑 測試帳號:")
        print("   Email: admin@townpass.com")
        print("   Password: admin123")
        print("\n   其他使用者密碼: password123")
        
    except Exception as e:
        print(f"\n❌ 錯誤: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()

