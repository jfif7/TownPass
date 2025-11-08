# API Endpoints 總覽

## 基礎資訊

- **Base URL**: `http://localhost:8000/api/v1`
- **認證方式**: Bearer Token (JWT)
- **API 文件**: `http://localhost:8000/docs` (Swagger UI)

## 認證 API

### 註冊
- **POST** `/api/v1/auth/register`
- **認證**: 不需要
- **請求體**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "使用者名稱"
  }
  ```

### 登入
- **POST** `/api/v1/auth/login`
- **認證**: 不需要
- **請求體**: Form Data
  - `username`: email
  - `password`: 密碼
- **回應**: 
  ```json
  {
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
  ```

### 取得當前使用者
- **GET** `/api/v1/auth/me`
- **認證**: 需要

## 報到 API

### NFC 報到
- **POST** `/api/v1/check-in`
- **認證**: 需要
- **請求體**:
  ```json
  {
    "nfc_tag_uid": "ABC123XYZ789"
  }
  ```
- **回應**:
  ```json
  {
    "status": "success",
    "event_id": 1,
    "event_title": "年度開發者大會",
    "mission_name": "入口報到",
    "mission_id": 1,
    "reward_points": 10,
    "message": "報到成功！",
    "timestamp": "2025-11-10T09:01:15Z",
    "total_missions_in_event": 5,
    "user_missions_completed": 3
  }
  ```

## 活動 API

### 取得活動列表
- **GET** `/api/v1/events`
- **認證**: 需要
- **查詢參數**:
  - `status`: `upcoming` | `ongoing` | `past` (可選)
  - `page`: 頁碼 (預設: 1)
  - `limit`: 每頁數量 (預設: 20, 最大: 100)
  - `search`: 搜尋關鍵字 (可選)

### 取得活動詳情
- **GET** `/api/v1/events/{event_id}`
- **認證**: 需要

### 取得我的報到記錄
- **GET** `/api/v1/users/me/attendance`
- **認證**: 需要
- **查詢參數**:
  - `event_id`: 活動 ID (可選)
  - `page`: 頁碼 (預設: 1)
  - `limit`: 每頁數量 (預設: 50)

## 徽章 API

### 取得我的徽章
- **GET** `/api/v1/badges/me/badges`
- **認證**: 需要
- **查詢參數**:
  - `event_id`: 活動 ID (可選)
  - `badge_type`: 徽章類型 (可選)

### 取得所有徽章
- **GET** `/api/v1/badges/all`
- **認證**: 需要
- **說明**: 顯示所有徽章（包含已獲得和未獲得的）

## 成果 API

### 取得活動成果
- **GET** `/api/v1/events/{event_id}/my-results`
- **認證**: 需要
- **回應**: 包含完成進度、排名、徽章等資訊

## 使用範例

### 使用 curl

```bash
# 1. 註冊
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "測試使用者"
  }'

# 2. 登入
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"

# 3. 使用 Token 取得活動列表
curl -X GET http://localhost:8000/api/v1/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. NFC 報到
curl -X POST http://localhost:8000/api/v1/check-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_tag_uid": "ABC123XYZ789"
  }'
```

### 使用 Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 登入
response = requests.post(
    f"{BASE_URL}/auth/login",
    data={"username": "test@example.com", "password": "password123"}
)
token = response.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# 取得活動列表
events = requests.get(f"{BASE_URL}/events", headers=headers)

# NFC 報到
check_in = requests.post(
    f"{BASE_URL}/check-in",
    headers=headers,
    json={"nfc_tag_uid": "ABC123XYZ789"}
)
```

## 錯誤處理

所有 API 都遵循標準的 HTTP 狀態碼：

- `200 OK`: 成功
- `201 Created`: 創建成功
- `400 Bad Request`: 請求參數錯誤
- `401 Unauthorized`: 未提供或無效的 Token
- `403 Forbidden`: 無權限或帳號已停用
- `404 Not Found`: 資源不存在
- `409 Conflict`: 資源衝突（如重複報到）
- `422 Unprocessable Entity`: 驗證失敗
- `500 Internal Server Error`: 伺服器錯誤

錯誤回應格式：
```json
{
  "detail": "錯誤訊息"
}
```

