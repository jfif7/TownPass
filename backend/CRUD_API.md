# CRUD API 文檔

## 概述

所有管理員 CRUD API 都需要認證（Bearer Token），並且位於 `/api/v1/admin/` 路徑下。

## Event (活動) CRUD

### 創建活動
- **POST** `/api/v1/admin/events`
- **請求體**:
  ```json
  {
    "title": "活動標題",
    "description": "活動描述",
    "start_time": "2025-11-10T09:00:00Z",
    "end_time": "2025-11-10T18:00:00Z",
    "location": "活動地點",
    "cover_image_url": "https://...",
    "max_participants": 100,
    "admin_id": 1
  }
  ```

### 取得活動
- **GET** `/api/v1/admin/events/{event_id}`

### 更新活動
- **PUT** `/api/v1/admin/events/{event_id}`
- **請求體**: 部分更新（所有欄位可選）

### 刪除活動
- **DELETE** `/api/v1/admin/events/{event_id}?hard=false`
- **查詢參數**:
  - `hard`: `true` 硬刪除，`false` 軟刪除（預設）

## Mission (任務) CRUD

### 創建任務
- **POST** `/api/v1/admin/missions`
- **請求體**:
  ```json
  {
    "event_id": 1,
    "name": "任務名稱",
    "description": "任務描述",
    "order": 1,
    "is_active": true
  }
  ```

### 取得任務
- **GET** `/api/v1/admin/missions/{mission_id}`

### 取得活動的所有任務
- **GET** `/api/v1/admin/missions/event/{event_id}?skip=0&limit=100`

### 更新任務
- **PUT** `/api/v1/admin/missions/{mission_id}`

### 刪除任務
- **DELETE** `/api/v1/admin/missions/{mission_id}?hard=false`

## NFC Tag CRUD

### 創建 NFC 標籤
- **POST** `/api/v1/admin/nfc-tags`
- **請求體**:
  ```json
  {
    "tag_uid": "ABC123XYZ789",
    "mission_id": 1,
    "reward_points": 10,
    "is_active": true
  }
  ```
- **注意**: `tag_uid` 必須唯一

### 取得 NFC 標籤
- **GET** `/api/v1/admin/nfc-tags/{nfc_tag_id}`

### 取得任務的所有 NFC 標籤
- **GET** `/api/v1/admin/nfc-tags/mission/{mission_id}?skip=0&limit=100`

### 更新 NFC 標籤
- **PUT** `/api/v1/admin/nfc-tags/{nfc_tag_id}`
- **注意**: 更新 `tag_uid` 時會檢查是否重複

### 刪除 NFC 標籤
- **DELETE** `/api/v1/admin/nfc-tags/{nfc_tag_id}?hard=false`

## Badge (徽章) CRUD

### 創建徽章
- **POST** `/api/v1/admin/badges`
- **請求體**:
  ```json
  {
    "name": "早鳥報到",
    "description": "在活動開始前 30 分鐘完成報到",
    "image_url": "https://.../badge.png",
    "badge_type": "event",
    "is_active": true
  }
  ```
- **badge_type**: `event`, `global`, `special`

### 取得徽章列表
- **GET** `/api/v1/admin/badges?badge_type=event&is_active=true`

### 取得徽章
- **GET** `/api/v1/admin/badges/{badge_id}`

### 更新徽章
- **PUT** `/api/v1/admin/badges/{badge_id}`

### 刪除徽章
- **DELETE** `/api/v1/admin/badges/{badge_id}?hard=false`

## User Badge (使用者徽章) CRUD

### 授予使用者徽章
- **POST** `/api/v1/admin/user-badges`
- **請求體**:
  ```json
  {
    "user_id": 1,
    "badge_id": 1,
    "event_id": 1
  }
  ```
- **注意**: 如果使用者已擁有該徽章，會返回現有記錄

### 取得使用者徽章列表
- **GET** `/api/v1/admin/user-badges?user_id=1&event_id=1&badge_id=1&skip=0&limit=100`
- **查詢參數**:
  - `user_id`: 使用者 ID（可選，預設為當前使用者）
  - `event_id`: 活動 ID（可選）
  - `badge_id`: 徽章 ID（可選）

### 取得使用者徽章
- **GET** `/api/v1/admin/user-badges/{user_badge_id}`

### 移除使用者徽章
- **DELETE** `/api/v1/admin/user-badges/{user_badge_id}`

### 根據使用者和徽章 ID 移除
- **DELETE** `/api/v1/admin/user-badges/user/{user_id}/badge/{badge_id}`

## 使用範例

### Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
TOKEN = "your_token_here"
headers = {"Authorization": f"Bearer {TOKEN}"}

# 創建活動
event = requests.post(
    f"{BASE_URL}/admin/events",
    headers=headers,
    json={
        "title": "開發者大會",
        "start_time": "2025-11-10T09:00:00Z",
        "end_time": "2025-11-10T18:00:00Z"
    }
)

# 創建任務
mission = requests.post(
    f"{BASE_URL}/admin/missions",
    headers=headers,
    json={
        "event_id": event.json()["id"],
        "name": "入口報到",
        "order": 1
    }
)

# 創建 NFC 標籤
nfc_tag = requests.post(
    f"{BASE_URL}/admin/nfc-tags",
    headers=headers,
    json={
        "tag_uid": "ABC123",
        "mission_id": mission.json()["id"],
        "reward_points": 10
    }
)

# 創建徽章
badge = requests.post(
    f"{BASE_URL}/admin/badges",
    headers=headers,
    json={
        "name": "早鳥報到",
        "image_url": "https://.../badge.png",
        "badge_type": "event"
    }
)

# 授予使用者徽章
user_badge = requests.post(
    f"{BASE_URL}/admin/user-badges",
    headers=headers,
    json={
        "user_id": 1,
        "badge_id": badge.json()["id"],
        "event_id": event.json()["id"]
    }
)
```

### curl

```bash
# 創建活動
curl -X POST http://localhost:8000/api/v1/admin/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "開發者大會",
    "start_time": "2025-11-10T09:00:00Z",
    "end_time": "2025-11-10T18:00:00Z"
  }'

# 更新活動
curl -X PUT http://localhost:8000/api/v1/admin/events/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新的標題"
  }'

# 刪除活動（軟刪除）
curl -X DELETE http://localhost:8000/api/v1/admin/events/1?hard=false \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 錯誤處理

所有 API 遵循標準 HTTP 狀態碼：

- `200 OK`: 成功
- `201 Created`: 創建成功
- `204 No Content`: 刪除成功
- `400 Bad Request`: 請求參數錯誤（如重複的 tag_uid）
- `401 Unauthorized`: 未認證
- `404 Not Found`: 資源不存在
- `422 Unprocessable Entity`: 驗證失敗

