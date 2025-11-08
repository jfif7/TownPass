# TownPass 使用流程指南

## 📋 目錄

1. [快速開始](#快速開始)
2. [使用者註冊與登入](#使用者註冊與登入)
3. [管理員流程：建立活動系統](#管理員流程建立活動系統)
4. [參與者流程：參加活動](#參與者流程參加活動)
5. [完整範例](#完整範例)

---

## 快速開始

### 前置需求

1. 啟動資料庫：
   ```bash
   cd backend
   docker-compose up -d
   ```

2. 啟動 API 伺服器：
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. API 文件：訪問 `http://localhost:8000/docs`

---

## 使用者註冊與登入

### 1. 註冊新使用者

**API**: `POST /api/v1/auth/register`

**請求範例**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "張三"
  }'
```

**回應**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "張三",
  "is_active": true,
  "created_at": "2025-11-08T12:00:00Z"
}
```

### 2. 登入取得 Token

**API**: `POST /api/v1/auth/login`

**請求範例**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

**回應**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**保存 Token**:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 管理員流程：建立活動系統

管理員需要按照以下順序建立活動系統：

1. **建立活動 (Event)**
2. **建立任務 (Mission)** - 每個活動可以有多個任務
3. **建立 NFC 標籤 (NFC Tag)** - 每個任務對應一個 NFC 標籤
4. **建立徽章 (Badge)** - 可選，用於獎勵系統

### 步驟 1: 建立活動 (Event)

**API**: `POST /api/v1/admin/events`

**請求範例**:
```bash
curl -X POST http://localhost:8000/api/v1/admin/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2025 年度開發者大會",
    "description": "年度最大開發者聚會，包含技術分享、工作坊和社交活動",
    "start_time": "2025-11-10T09:00:00Z",
    "end_time": "2025-11-10T18:00:00Z",
    "location": "台北國際會議中心",
    "cover_image_url": "https://example.com/event-cover.jpg",
    "max_participants": 500
  }'
```

**回應**:
```json
{
  "id": 1,
  "title": "2025 年度開發者大會",
  "description": "年度最大開發者聚會...",
  "start_time": "2025-11-10T09:00:00Z",
  "end_time": "2025-11-10T18:00:00Z",
  "location": "台北國際會議中心",
  "cover_image_url": "https://example.com/event-cover.jpg",
  "max_participants": 500,
  "is_active": true
}
```

**保存 Event ID**:
```bash
export EVENT_ID=1
```

### 步驟 2: 建立任務 (Mission)

為活動建立多個任務，每個任務代表一個檢查點。

**API**: `POST /api/v1/admin/missions`

**範例 1: 入口報到任務**
```bash
curl -X POST http://localhost:8000/api/v1/admin/missions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "name": "入口報到",
    "description": "完成入口報到，領取活動手冊",
    "order": 1,
    "is_active": true
  }'
```

**範例 2: 主會場任務**
```bash
curl -X POST http://localhost:8000/api/v1/admin/missions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "name": "主會場簽到",
    "description": "進入主會場並完成簽到",
    "order": 2,
    "is_active": true
  }'
```

**範例 3: 工作坊 A 任務**
```bash
curl -X POST http://localhost:8000/api/v1/admin/missions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "name": "工作坊 A 參與",
    "description": "參加工作坊 A 並完成互動",
    "order": 3,
    "is_active": true
  }'
```

**回應範例**:
```json
{
  "id": 1,
  "event_id": 1,
  "name": "入口報到",
  "description": "完成入口報到，領取活動手冊",
  "order": 1,
  "is_active": true,
  "created_at": "2025-11-08T12:00:00Z"
}
```

**保存 Mission IDs**:
```bash
export MISSION_1_ID=1  # 入口報到
export MISSION_2_ID=2  # 主會場
export MISSION_3_ID=3  # 工作坊 A
```

### 步驟 3: 建立 NFC 標籤 (NFC Tag)

為每個任務建立對應的 NFC 標籤。**重要**: 每個任務只能有一個 NFC 標籤。

**API**: `POST /api/v1/admin/nfc-tags`

**範例 1: 入口報到的 NFC 標籤**
```bash
curl -X POST http://localhost:8000/api/v1/admin/nfc-tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tag_uid": "ABC123XYZ789",
    "mission_id": 1,
    "reward_points": 10,
    "is_active": true
  }'
```

**範例 2: 主會場的 NFC 標籤**
```bash
curl -X POST http://localhost:8000/api/v1/admin/nfc-tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tag_uid": "DEF456UVW012",
    "mission_id": 2,
    "reward_points": 15,
    "is_active": true
  }'
```

**範例 3: 工作坊 A 的 NFC 標籤**
```bash
curl -X POST http://localhost:8000/api/v1/admin/nfc-tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tag_uid": "GHI789RST345",
    "mission_id": 3,
    "reward_points": 20,
    "is_active": true
  }'
```

**回應範例**:
```json
{
  "id": 1,
  "tag_uid": "ABC123XYZ789",
  "mission_id": 1,
  "reward_points": 10,
  "is_active": true,
  "created_at": "2025-11-08T12:00:00Z"
}
```

**注意事項**:
- `tag_uid` 必須是唯一的（跨所有活動）
- 每個 `mission_id` 只能對應一個 NFC 標籤
- `reward_points` 是完成任務獲得的點數

### 步驟 4: 建立徽章 (Badge) - 可選

建立徽章用於獎勵系統。

**API**: `POST /api/v1/admin/badges`

**範例 1: 早鳥報到徽章**
```bash
curl -X POST http://localhost:8000/api/v1/admin/badges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "早鳥報到",
    "description": "在活動開始前 30 分鐘完成報到",
    "image_url": "https://example.com/badges/early_bird.png",
    "badge_type": "event",
    "is_active": true
  }'
```

**範例 2: 完美通關徽章**
```bash
curl -X POST http://localhost:8000/api/v1/admin/badges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "完美通關",
    "description": "完成活動所有任務",
    "image_url": "https://example.com/badges/perfect.png",
    "badge_type": "event",
    "is_active": true
  }'
```

**回應範例**:
```json
{
  "id": 1,
  "name": "早鳥報到",
  "description": "在活動開始前 30 分鐘完成報到",
  "image_url": "https://example.com/badges/early_bird.png",
  "badge_type": "event",
  "is_active": true,
  "created_at": "2025-11-08T12:00:00Z"
}
```

**保存 Badge IDs**:
```bash
export BADGE_1_ID=1  # 早鳥報到
export BADGE_2_ID=2  # 完美通關
```

---

## 參與者流程：參加活動

### 1. 查看活動列表

**API**: `GET /api/v1/events`

```bash
curl -X GET "http://localhost:8000/api/v1/events?status=upcoming" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. 查看活動詳情

**API**: `GET /api/v1/events/{event_id}`

```bash
curl -X GET http://localhost:8000/api/v1/events/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 3. NFC 報到

當參與者使用 Flutter App 掃描 NFC 標籤時，App 會呼叫此 API。

**API**: `POST /api/v1/check-in`

```bash
curl -X POST http://localhost:8000/api/v1/check-in \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_tag_uid": "ABC123XYZ789"
  }'
```

**回應**:
```json
{
  "status": "success",
  "event_id": 1,
  "event_title": "2025 年度開發者大會",
  "mission_name": "入口報到",
  "mission_id": 1,
  "reward_points": 10,
  "message": "報到成功！",
  "timestamp": "2025-11-10T09:01:15Z",
  "total_missions_in_event": 3,
  "user_missions_completed": 1
}
```

### 4. 查看我的報到記錄

**API**: `GET /api/v1/users/me/attendance`

```bash
curl -X GET "http://localhost:8000/api/v1/users/me/attendance?event_id=1" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. 查看我的徽章

**API**: `GET /api/v1/badges/me/badges`

```bash
curl -X GET "http://localhost:8000/api/v1/badges/me/badges?event_id=1" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. 查看活動成果

**API**: `GET /api/v1/events/{event_id}/my-results`

```bash
curl -X GET http://localhost:8000/api/v1/events/1/my-results \
  -H "Authorization: Bearer $TOKEN"
```

---

## 完整範例

### 場景：建立一個完整的活動系統

假設你要建立一個「開發者大會」活動，包含 3 個任務和 2 個徽章。

#### 1. 登入管理員帳號

```bash
# 登入
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123"

# 保存 Token
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. 建立活動

```bash
curl -X POST http://localhost:8000/api/v1/admin/events \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2025 年度開發者大會",
    "description": "年度最大開發者聚會",
    "start_time": "2025-11-10T09:00:00Z",
    "end_time": "2025-11-10T18:00:00Z",
    "location": "台北國際會議中心",
    "max_participants": 500
  }'

# 假設返回 event_id = 1
export EVENT_ID=1
```

#### 3. 建立 3 個任務

```bash
# 任務 1: 入口報到
curl -X POST http://localhost:8000/api/v1/admin/missions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"event_id\": $EVENT_ID,
    \"name\": \"入口報到\",
    \"description\": \"完成入口報到\",
    \"order\": 1
  }"
# 假設返回 mission_id = 1
export MISSION_1_ID=1

# 任務 2: 主會場
curl -X POST http://localhost:8000/api/v1/admin/missions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"event_id\": $EVENT_ID,
    \"name\": \"主會場簽到\",
    \"description\": \"進入主會場\",
    \"order\": 2
  }"
# 假設返回 mission_id = 2
export MISSION_2_ID=2

# 任務 3: 工作坊
curl -X POST http://localhost:8000/api/v1/admin/missions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"event_id\": $EVENT_ID,
    \"name\": \"工作坊參與\",
    \"description\": \"參加工作坊\",
    \"order\": 3
  }"
# 假設返回 mission_id = 3
export MISSION_3_ID=3
```

#### 4. 為每個任務建立 NFC 標籤

```bash
# NFC 標籤 1 (對應任務 1)
curl -X POST http://localhost:8000/api/v1/admin/nfc-tags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tag_uid\": \"ABC123XYZ789\",
    \"mission_id\": $MISSION_1_ID,
    \"reward_points\": 10
  }"

# NFC 標籤 2 (對應任務 2)
curl -X POST http://localhost:8000/api/v1/admin/nfc-tags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tag_uid\": \"DEF456UVW012\",
    \"mission_id\": $MISSION_2_ID,
    \"reward_points\": 15
  }"

# NFC 標籤 3 (對應任務 3)
curl -X POST http://localhost:8000/api/v1/admin/nfc-tags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tag_uid\": \"GHI789RST345\",
    \"mission_id\": $MISSION_3_ID,
    \"reward_points\": 20
  }"
```

#### 5. 建立徽章

```bash
# 徽章 1: 早鳥報到
curl -X POST http://localhost:8000/api/v1/admin/badges \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "早鳥報到",
    "description": "在活動開始前 30 分鐘完成報到",
    "image_url": "https://example.com/badges/early_bird.png",
    "badge_type": "event"
  }'
# 假設返回 badge_id = 1
export BADGE_1_ID=1

# 徽章 2: 完美通關
curl -X POST http://localhost:8000/api/v1/admin/badges \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "完美通關",
    "description": "完成活動所有任務",
    "image_url": "https://example.com/badges/perfect.png",
    "badge_type": "event"
  }'
# 假設返回 badge_id = 2
export BADGE_2_ID=2
```

#### 6. 活動開始後，參與者報到流程

```bash
# 參與者登入
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"

# 保存參與者 Token
export USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 掃描第一個 NFC 標籤（入口報到）
curl -X POST http://localhost:8000/api/v1/check-in \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_tag_uid": "ABC123XYZ789"
  }'

# 掃描第二個 NFC 標籤（主會場）
curl -X POST http://localhost:8000/api/v1/check-in \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_tag_uid": "DEF456UVW012"
  }'

# 掃描第三個 NFC 標籤（工作坊）
curl -X POST http://localhost:8000/api/v1/check-in \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_tag_uid": "GHI789RST345"
  }'

# 查看活動成果
curl -X GET http://localhost:8000/api/v1/events/1/my-results \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

## Python 腳本範例

### 完整的管理員設置腳本

```python
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

# 1. 登入管理員
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    data={"username": "admin@example.com", "password": "admin123"}
)
admin_token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {admin_token}"}

# 2. 建立活動
event_data = {
    "title": "2025 年度開發者大會",
    "description": "年度最大開發者聚會",
    "start_time": (datetime.now() + timedelta(days=2)).isoformat() + "Z",
    "end_time": (datetime.now() + timedelta(days=2, hours=9)).isoformat() + "Z",
    "location": "台北國際會議中心",
    "max_participants": 500
}
event_response = requests.post(
    f"{BASE_URL}/admin/events",
    headers=headers,
    json=event_data
)
event_id = event_response.json()["id"]
print(f"✅ 活動已建立，ID: {event_id}")

# 3. 建立任務
missions = [
    {"name": "入口報到", "description": "完成入口報到", "order": 1},
    {"name": "主會場簽到", "description": "進入主會場", "order": 2},
    {"name": "工作坊參與", "description": "參加工作坊", "order": 3},
]

mission_ids = []
for mission in missions:
    mission["event_id"] = event_id
    mission_response = requests.post(
        f"{BASE_URL}/admin/missions",
        headers=headers,
        json=mission
    )
    mission_id = mission_response.json()["id"]
    mission_ids.append(mission_id)
    print(f"✅ 任務已建立，ID: {mission_id}")

# 4. 建立 NFC 標籤
nfc_tags = [
    {"tag_uid": "ABC123XYZ789", "reward_points": 10},
    {"tag_uid": "DEF456UVW012", "reward_points": 15},
    {"tag_uid": "GHI789RST345", "reward_points": 20},
]

for i, nfc_tag in enumerate(nfc_tags):
    nfc_tag["mission_id"] = mission_ids[i]
    nfc_response = requests.post(
        f"{BASE_URL}/admin/nfc-tags",
        headers=headers,
        json=nfc_tag
    )
    print(f"✅ NFC 標籤已建立，UID: {nfc_tag['tag_uid']}")

# 5. 建立徽章
badges = [
    {
        "name": "早鳥報到",
        "description": "在活動開始前 30 分鐘完成報到",
        "image_url": "https://example.com/badges/early_bird.png",
        "badge_type": "event"
    },
    {
        "name": "完美通關",
        "description": "完成活動所有任務",
        "image_url": "https://example.com/badges/perfect.png",
        "badge_type": "event"
    },
]

for badge in badges:
    badge_response = requests.post(
        f"{BASE_URL}/admin/badges",
        headers=headers,
        json=badge
    )
    badge_id = badge_response.json()["id"]
    print(f"✅ 徽章已建立，ID: {badge_id}")

print("\n🎉 活動系統設置完成！")
```

---

## 常見問題

### Q1: 如何更新活動資訊？

```bash
curl -X PUT http://localhost:8000/api/v1/admin/events/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新的活動標題"
  }'
```

### Q2: 如何查看活動的所有任務？

```bash
curl -X GET http://localhost:8000/api/v1/admin/missions/event/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Q3: 如何授予使用者徽章？

```bash
curl -X POST http://localhost:8000/api/v1/admin/user-badges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "badge_id": 1,
    "event_id": 1
  }'
```

### Q4: 如何刪除活動？

```bash
# 軟刪除（推薦，保留資料）
curl -X DELETE "http://localhost:8000/api/v1/admin/events/1?hard=false" \
  -H "Authorization: Bearer $TOKEN"

# 硬刪除（永久刪除）
curl -X DELETE "http://localhost:8000/api/v1/admin/events/1?hard=true" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 流程圖

```
管理員流程：
註冊/登入
  ↓
建立活動 (Event)
  ↓
建立任務 (Mission) × N
  ↓
建立 NFC 標籤 (NFC Tag) × N (每個任務一個)
  ↓
建立徽章 (Badge) × M (可選)
  ↓
活動開始

參與者流程：
註冊/登入
  ↓
查看活動列表
  ↓
查看活動詳情
  ↓
掃描 NFC 標籤報到
  ↓
查看報到記錄
  ↓
查看獲得的徽章
  ↓
查看活動成果
```

---

## 注意事項

1. **NFC 標籤唯一性**: 每個 `tag_uid` 必須是唯一的，不能重複使用
2. **任務順序**: `order` 欄位用於排序任務，建議從 1 開始遞增
3. **時間格式**: 所有時間使用 ISO 8601 格式，時區使用 UTC (Z)
4. **Token 過期**: JWT Token 預設 24 小時過期，過期後需要重新登入
5. **錯誤處理**: 所有 API 都有完整的錯誤回應，請檢查 HTTP 狀態碼

---

## 更多資源

- **API 文件**: `http://localhost:8000/docs`
- **API 規格**: 參考 `API_SPEC.md`
- **CRUD API**: 參考 `CRUD_API.md`

