# TownPass API 詳細規格與實作注意事項

## 📋 目錄
1. [資料庫設計細節](#資料庫設計細節)
2. [認證與授權](#認證與授權)
3. [API 端點詳細規格](#api-端點詳細規格)
4. [非同步任務處理](#非同步任務處理)
5. [錯誤處理與狀態碼](#錯誤處理與狀態碼)
6. [效能與安全考量](#效能與安全考量)
7. [測試策略](#測試策略)
8. [部署與環境設定](#部署與環境設定)

---

## 資料庫設計細節

### 1. User 表
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);
```

**注意事項：**
- `email` 必須有唯一索引
- `hashed_password` 使用 bcrypt 或 argon2
- 考慮加入 `phone`、`avatar_url` 等欄位（未來擴充）
- `is_active` 用於軟刪除或停用帳號

### 2. Event 表
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    max_participants INTEGER,
    CHECK (end_time > start_time)
);
```

**注意事項：**
- `admin_id` 可為 NULL（活動可能由系統建立）
- 加入 `CHECK` 約束確保時間邏輯正確
- `cover_image_url` 考慮使用 CDN URL
- 考慮加入 `status` 欄位（draft, published, cancelled）

### 3. NFC_Tag 表
```sql
CREATE TABLE nfc_tags (
    id SERIAL PRIMARY KEY,
    tag_uid VARCHAR(255) UNIQUE NOT NULL,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    checkpoint_name VARCHAR(255) NOT NULL,
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    scan_order INTEGER DEFAULT 0,  -- 用於排序檢查點順序
    UNIQUE(event_id, checkpoint_name)  -- 同一活動內檢查點名稱唯一
);
```

**注意事項：**
- `tag_uid` 必須唯一（跨活動）
- `event_id` 使用 CASCADE 刪除（活動刪除時標籤也刪除）
- `scan_order` 用於判斷是否按順序掃描（可選功能）
- 考慮加入 `latitude`, `longitude` 用於地圖顯示

### 4. Attendance 表
```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    nfc_tag_id INTEGER REFERENCES nfc_tags(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reward_points_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, nfc_tag_id)  -- 防止重複掃描
);
```

**注意事項：**
- `UNIQUE(user_id, nfc_tag_id)` 是關鍵約束，防止重複掃描
- `timestamp` 使用資料庫預設值，確保時區一致
- `reward_points_earned` 記錄本次獲得的點數
- 考慮加入索引：`CREATE INDEX idx_attendance_user_event ON attendance(user_id, event_id);`

### 5. Badge 表
```sql
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    badge_type VARCHAR(50) DEFAULT 'event',  -- event, global, special
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

**注意事項：**
- `badge_type` 用於分類（活動專屬、全域、特殊成就）
- 考慮加入 `rarity` 欄位（common, rare, epic, legendary）
- `image_url` 建議使用不同尺寸（thumbnail, full）

### 6. UserBadge 表
```sql
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,  -- 可選，記錄在哪個活動獲得
    timestamp_earned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)  -- 同一徽章只能獲得一次
);
```

**注意事項：**
- `UNIQUE(user_id, badge_id)` 防止重複獲得
- `event_id` 可選，用於追蹤徽章來源
- 考慮加入 `notification_sent` 欄位（是否已發送通知）

---

## 認證與授權

### JWT Token 實作

**需要的套件：**
```txt
python-jose[cryptography]>=0.5.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
```

**Token 結構：**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**環境變數：**
```env
SECRET_KEY=your-secret-key-here  # 使用 openssl rand -hex 32 生成
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 小時
```

**API 端點：**
- `POST /api/v1/auth/register` - 註冊
- `POST /api/v1/auth/login` - 登入
- `POST /api/v1/auth/refresh` - 刷新 Token
- `GET /api/v1/auth/me` - 取得當前使用者資訊

**依賴注入範例：**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 驗證 token 並返回 user
    pass
```

---

## API 端點詳細規格

### 1. NFC 報到 API

#### `POST /api/v1/check-in`

**Request:**
```json
{
  "nfc_tag_uid": "ABC123XYZ789"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "event_id": 1,
  "event_title": "年度開發者大會",
  "checkpoint_name": "入口報到處",
  "checkpoint_id": 5,
  "reward_points": 10,
  "message": "報到成功！",
  "timestamp": "2025-11-10T09:01:15Z",
  "total_checkpoints_in_event": 5,
  "user_checkpoints_completed": 3
}
```

**Response (404 Not Found):**
```json
{
  "detail": "NFC 標籤無效或未綁定活動"
}
```

**Response (409 Conflict):**
```json
{
  "detail": "你已經在這個報到點報到過了"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "活動尚未開始或已結束"
}
```

**業務邏輯：**
1. 驗證 JWT Token，取得 `user_id`
2. 查詢 `nfc_tags` 表，用 `tag_uid` 找到對應的 `event_id` 和 `nfc_tag_id`
3. 檢查活動狀態（`start_time <= NOW() <= end_time`）
4. 檢查 `attendance` 表，確認是否已報到（`SELECT * FROM attendance WHERE user_id = ? AND nfc_tag_id = ?`）
5. 如果通過，插入 `attendance` 記錄
6. 觸發 Celery 任務檢查徽章條件
7. 返回成功響應

**效能優化：**
- 使用資料庫事務確保原子性
- 考慮使用 Redis 快取活動狀態
- 對 `nfc_tags.tag_uid` 建立唯一索引

---

### 2. 活動列表 API

#### `GET /api/v1/events`

**Query Parameters:**
- `status`: `upcoming` | `ongoing` | `past` | `all` (預設: `all`)
- `page`: `int` (預設: 1)
- `limit`: `int` (預設: 20, 最大: 100)
- `search`: `string` (可選，搜尋標題或描述)

**Response (200 OK):**
```json
{
  "events": [
    {
      "id": 1,
      "title": "年度開發者大會",
      "description": "年度最大開發者聚會...",
      "start_time": "2025-11-10T09:00:00Z",
      "end_time": "2025-11-10T18:00:00Z",
      "location": "台北國際會議中心",
      "cover_image_url": "https://cdn.example.com/event1.jpg",
      "status": "ongoing",
      "total_checkpoints": 5,
      "my_checkpoints_completed": 3,
      "is_registered": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

**業務邏輯：**
1. 根據 `status` 過濾活動：
   - `upcoming`: `start_time > NOW()`
   - `ongoing`: `start_time <= NOW() AND end_time >= NOW()`
   - `past`: `end_time < NOW()`
2. 計算使用者在每個活動的完成進度（JOIN `attendance` 表）
3. 實作分頁
4. 支援全文搜尋（使用 PostgreSQL `ILIKE` 或全文搜尋）

---

#### `GET /api/v1/events/{event_id}`

**Response (200 OK):**
```json
{
  "id": 1,
  "admin_id": 10,
  "admin_name": "活動主辦方",
  "title": "年度開發者大會",
  "description": "完整的活動描述...",
  "start_time": "2025-11-10T09:00:00Z",
  "end_time": "2025-11-10T18:00:00Z",
  "location": "台北國際會議中心",
  "cover_image_url": "https://cdn.example.com/event1.jpg",
  "status": "ongoing",
  "total_checkpoints": 5,
  "checkpoints": [
    {
      "id": 1,
      "checkpoint_name": "入口報到處",
      "scan_order": 1,
      "is_completed": true,
      "completed_at": "2025-11-10T09:01:15Z"
    }
  ],
  "my_progress": {
    "checkpoints_completed": 3,
    "total_checkpoints": 5,
    "completion_percentage": 60
  },
  "badges_available": [
    {
      "id": 1,
      "name": "早鳥報到",
      "description": "在活動開始前 30 分鐘完成報到",
      "image_url": "https://...",
      "is_earned": true
    }
  ]
}
```

---

#### `GET /api/v1/users/me/attendance`

**Query Parameters:**
- `event_id`: `int` (可選，過濾特定活動)
- `page`: `int` (預設: 1)
- `limit`: `int` (預設: 50)

**Response (200 OK):**
```json
{
  "attendance_history": [
    {
      "id": 123,
      "event_id": 1,
      "event_title": "年度開發者大會",
      "checkpoint_name": "入口報到處",
      "checkpoint_id": 5,
      "timestamp": "2025-11-10T09:01:15Z",
      "reward_points": 10
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15
  },
  "summary": {
    "total_events_attended": 3,
    "total_checkpoints": 15,
    "total_points": 150
  }
}
```

---

### 3. 徽章 API

#### `GET /api/v1/users/me/badges`

**Query Parameters:**
- `event_id`: `int` (可選，過濾特定活動的徽章)
- `badge_type`: `string` (可選，過濾類型)

**Response (200 OK):**
```json
{
  "badges": [
    {
      "id": 1,
      "name": "早鳥報到",
      "description": "在活動開始前 30 分鐘完成報到",
      "image_url": "https://cdn.example.com/badges/early_bird.png",
      "badge_type": "event",
      "timestamp_earned": "2025-11-10T09:01:15Z",
      "event_id": 1,
      "event_title": "年度開發者大會"
    }
  ],
  "summary": {
    "total_badges": 5,
    "by_type": {
      "event": 3,
      "global": 2
    }
  }
}
```

---

#### `GET /api/v1/badges/all`

**Response (200 OK):**
```json
{
  "badges": [
    {
      "id": 1,
      "name": "早鳥報到",
      "description": "在活動開始前 30 分鐘完成報到",
      "image_url": "https://cdn.example.com/badges/early_bird.png",
      "badge_type": "event",
      "rarity": "common",
      "is_earned": true,
      "timestamp_earned": "2025-11-10T09:01:15Z"
    },
    {
      "id": 2,
      "name": "完美通關",
      "description": "完成活動所有檢查點",
      "image_url": "https://cdn.example.com/badges/perfect.png",
      "badge_type": "event",
      "rarity": "rare",
      "is_earned": false,
      "timestamp_earned": null
    }
  ],
  "statistics": {
    "total_badges": 20,
    "earned_count": 5,
    "completion_percentage": 25
  }
}
```

---

### 4. 活動成果 API

#### `GET /api/v1/events/{event_id}/my-results`

**Response (200 OK):**
```json
{
  "event_id": 1,
  "event_title": "年度開發者大會",
  "event_status": "completed",
  "total_checkpoints": 5,
  "my_checkpoints_hit": 3,
  "completion_percentage": 60,
  "my_rank": 42,
  "total_participants": 150,
  "my_rank_percentile": 72,  // 贏過 72% 的參加者
  "total_points_earned": 30,
  "badges_earned_in_this_event": [
    {
      "id": 1,
      "name": "早鳥報到",
      "description": "在活動開始前 30 分鐘完成報到",
      "image_url": "https://cdn.example.com/badges/early_bird.png",
      "timestamp_earned": "2025-11-10T09:01:15Z"
    }
  ],
  "checkpoints_details": [
    {
      "checkpoint_name": "入口報到處",
      "is_completed": true,
      "completed_at": "2025-11-10T09:01:15Z",
      "points_earned": 10
    },
    {
      "checkpoint_name": "主會場",
      "is_completed": true,
      "completed_at": "2025-11-10T10:30:00Z",
      "points_earned": 10
    },
    {
      "checkpoint_name": "工作坊 A",
      "is_completed": false,
      "completed_at": null,
      "points_earned": 0
    }
  ],
  "leaderboard_position": {
    "rank": 42,
    "users_above": 41,
    "users_below": 108
  }
}
```

**業務邏輯：**
1. 計算使用者在該活動的完成進度
2. 計算排名（基於完成的檢查點數量）
3. 計算百分位數
4. 列出所有獲得的徽章
5. 提供詳細的檢查點完成狀態

**效能考量：**
- 排名計算可能很慢，考慮使用 Redis 快取
- 或使用資料庫視圖（VIEW）預先計算

---

## 非同步任務處理

### Celery 設定

**需要的套件：**
```txt
celery>=5.3.0
redis>=5.0.0  # 作為 Celery broker
```

**環境變數：**
```env
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

**任務範例：**
```python
from celery import Celery

celery_app = Celery(
    "townpass",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

@celery_app.task
def check_badge_conditions(user_id: int, event_id: int, nfc_tag_id: int):
    """
    檢查使用者是否滿足獲得徽章的條件
    """
    # 1. 檢查「早鳥報到」徽章
    # 2. 檢查「完美通關」徽章
    # 3. 檢查「連續報到」徽章
    # 4. 檢查其他自訂徽章條件
    pass
```

**徽章條件範例：**
1. **早鳥報到**：在活動開始前 30 分鐘完成第一個檢查點
2. **完美通關**：完成活動所有檢查點
3. **速度之王**：在活動開始後 1 小時內完成所有檢查點
4. **社交達人**：在同一個活動中掃描超過 5 個不同檢查點
5. **忠實參與者**：參加超過 3 個活動

---

## 錯誤處理與狀態碼

### 標準錯誤響應格式

```json
{
  "detail": "錯誤訊息",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-11-10T09:01:15Z"
}
```

### 狀態碼對照表

| 狀態碼 | 使用情境 |
|--------|---------|
| 200 OK | 成功 |
| 201 Created | 建立資源成功（如註冊、報到） |
| 400 Bad Request | 請求參數錯誤 |
| 401 Unauthorized | 未提供 Token 或 Token 無效 |
| 403 Forbidden | Token 有效但無權限 |
| 404 Not Found | 資源不存在 |
| 409 Conflict | 資源衝突（如重複報到） |
| 422 Unprocessable Entity | 驗證失敗（Pydantic） |
| 500 Internal Server Error | 伺服器錯誤 |

### 自訂異常類別

```python
from fastapi import HTTPException

class NFCNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="NFC 標籤無效或未綁定活動"
        )

class DuplicateCheckInError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="你已經在這個報到點報到過了"
        )

class EventNotActiveError(HTTPException):
    def __init__(self, message: str = "活動尚未開始或已結束"):
        super().__init__(
            status_code=400,
            detail=message
        )
```

---

## 效能與安全考量

### 1. 資料庫優化

**索引建議：**
```sql
-- User 表
CREATE INDEX idx_users_email ON users(email);

-- Event 表
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);
CREATE INDEX idx_events_admin_id ON events(admin_id);

-- NFC_Tag 表
CREATE UNIQUE INDEX idx_nfc_tags_tag_uid ON nfc_tags(tag_uid);
CREATE INDEX idx_nfc_tags_event_id ON nfc_tags(event_id);

-- Attendance 表
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_attendance_nfc_tag_id ON attendance(nfc_tag_id);
CREATE INDEX idx_attendance_user_event ON attendance(user_id, event_id);
CREATE UNIQUE INDEX idx_attendance_user_nfc_tag ON attendance(user_id, nfc_tag_id);

-- UserBadge 表
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE UNIQUE INDEX idx_user_badges_user_badge ON user_badges(user_id, badge_id);
```

### 2. 快取策略

**使用 Redis 快取：**
- 活動列表（TTL: 5 分鐘）
- 活動詳情（TTL: 1 分鐘）
- 使用者徽章列表（TTL: 10 分鐘）
- 排行榜（TTL: 1 分鐘）

**需要的套件：**
```txt
redis>=5.0.0
hiredis>=2.2.0  # 可選，提升效能
```

### 3. 安全考量

**密碼處理：**
- 使用 `passlib` 的 `bcrypt` 或 `argon2`
- 最小長度 8 字元
- 不返回原始密碼或雜湊值

**JWT Token：**
- 使用強隨機 SECRET_KEY
- 設定合理的過期時間
- 考慮實作 refresh token

**輸入驗證：**
- 使用 Pydantic 驗證所有輸入
- 防止 SQL Injection（使用 ORM 或參數化查詢）
- 防止 XSS（對輸出進行轉義）

**Rate Limiting：**
- 使用 `slowapi` 或 `fastapi-limiter`
- 報到 API：每分鐘最多 10 次
- 登入 API：每分鐘最多 5 次

**CORS：**
- 僅允許信任的來源
- 生產環境不要使用 `allow_origins=["*"]`

### 4. 檔案上傳

**活動封面圖片：**
- 使用 `python-multipart`
- 限制檔案大小（如 5MB）
- 驗證檔案類型（僅允許 jpg, png, webp）
- 使用 CDN 或物件儲存（如 AWS S3, Cloudinary）

---

## 測試策略

### 1. 單元測試

**使用套件：**
```txt
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.27.0  # 用於測試 FastAPI
faker>=20.0.0  # 生成測試資料
```

**測試覆蓋範圍：**
- API 端點（成功與失敗案例）
- 業務邏輯函數
- 資料庫模型驗證
- 認證與授權

### 2. 整合測試

- 測試完整的 API 流程
- 測試資料庫操作
- 測試 Celery 任務

### 3. 測試資料庫

- 使用獨立的測試資料庫
- 使用 `pytest.fixture` 管理測試資料
- 每個測試後清理資料

---

## 部署與環境設定

### 1. 環境變數清單

```env
# 應用程式設定
APP_NAME=TownPass API
DEBUG=false
ENV=production
API_V1_PREFIX=/api
ALLOWED_ORIGINS=https://app.townpass.com,https://admin.townpass.com

# 資料庫
DATABASE_URL=postgresql://user:password@localhost:5432/townpass
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Redis
REDIS_URL=redis://localhost:6379/1

# 檔案儲存
STORAGE_TYPE=s3  # local, s3, cloudinary
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=townpass-uploads
AWS_REGION=ap-northeast-1

# 日誌
LOG_LEVEL=INFO
LOG_FILE=/var/log/townpass/api.log
```

### 2. Docker 設定

**docker-compose.yml 範例：**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: townpass
      POSTGRES_PASSWORD: townpass
      POSTGRES_DB: townpass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://townpass:townpass@db:5432/townpass
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A app.celery worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://townpass:townpass@db:5432/townpass
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

### 3. 資料庫遷移

**使用 Alembic：**
```txt
alembic>=1.12.0
sqlalchemy>=2.0.0
```

**初始化：**
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

## 專案結構建議

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 應用程式入口
│   ├── celery_app.py           # Celery 設定
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # 設定檔
│   │   ├── security.py         # JWT、密碼雜湊
│   │   └── database.py         # 資料庫連線
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── nfc_tag.py
│   │   ├── attendance.py
│   │   └── badge.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── attendance.py
│   │   └── badge.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # 依賴注入（認證等）
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── events.py
│   │       ├── check_in.py
│   │       ├── badges.py
│   │       └── users.py
│   ├── crud/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── nfc_tag.py
│   │   ├── attendance.py
│   │   └── badge.py
│   ├── tasks/
│   │   ├── __init__.py
│   │   └── badge_check.py     # Celery 任務
│   └── utils/
│       ├── __init__.py
│       └── exceptions.py       # 自訂異常
├── alembic/                    # 資料庫遷移
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_events.py
│   ├── test_check_in.py
│   └── test_badges.py
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 額外建議

### 1. API 版本控制
- 使用 URL 路徑版本控制：`/api/v1/`
- 未來擴充時使用 `/api/v2/`

### 2. 日誌記錄
- 使用 `structlog` 或 `loguru`
- 記錄所有 API 請求與回應
- 記錄錯誤堆疊追蹤

### 3. 監控與追蹤
- 使用 Prometheus + Grafana
- 或使用 Sentry 追蹤錯誤
- 監控 API 回應時間、錯誤率

### 4. 文件
- 使用 FastAPI 自動生成的 Swagger UI
- 補充 API 使用範例
- 撰寫開發者指南

### 5. 效能測試
- 使用 `locust` 或 `k6` 進行負載測試
- 測試並發報到場景
- 優化慢查詢

---

## 總結

這個規格文件涵蓋了實作 TownPass 後端微服務所需的主要細節。建議按照以下順序實作：

1. **階段一**：資料庫模型與遷移
2. **階段二**：認證系統（註冊、登入、JWT）
3. **階段三**：核心 API（活動列表、報到）
4. **階段四**：徽章系統與 Celery 任務
5. **階段五**：成果 API 與排行榜
6. **階段六**：測試與優化

祝開發順利！🚀

