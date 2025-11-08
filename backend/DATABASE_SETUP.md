# 資料庫設置指南

## 快速開始

### 1. 啟動 PostgreSQL 資料庫

使用 Docker Compose 啟動 PostgreSQL：

```bash
cd backend
docker-compose up -d
```

這會啟動一個 PostgreSQL 15 容器，預設設定：
- 主機：`localhost:5432`
- 資料庫名稱：`townpass`
- 使用者名稱：`townpass`
- 密碼：`townpass`

### 2. 檢查資料庫狀態

```bash
# 檢查容器是否運行
docker ps

# 查看資料庫日誌
docker-compose logs db

# 進入資料庫容器（可選）
docker exec -it townpass-db psql -U townpass -d townpass
```

### 3. 安裝依賴套件

```bash
# 確保虛擬環境已啟動
pip install -r requirements.txt
```

### 4. 設置環境變數（可選）

複製 `.env.example` 到 `.env` 並根據需要修改：

```bash
cp .env.example .env
```

預設的 `DATABASE_URL` 已經設定為 Docker Compose 的預設值，通常不需要修改。

### 5. 執行資料庫遷移

使用 Alembic 創建資料庫表：

```bash
# 初始化 Alembic（如果還沒初始化）
# 注意：已經預先設置好了，通常不需要執行

# 創建初始遷移
alembic revision --autogenerate -m "Initial migration"

# 執行遷移
alembic upgrade head
```

### 6. 驗證資料庫

檢查表是否已創建：

```bash
# 使用 psql
docker exec -it townpass-db psql -U townpass -d townpass -c "\dt"

# 或使用 Python
python -c "from app.core.database import engine; from sqlalchemy import inspect; inspector = inspect(engine); print(inspector.get_table_names())"
```

## 資料庫模型

已建立的資料庫模型：

1. **users** - 使用者表
2. **events** - 活動表
3. **nfc_tags** - NFC 標籤表
4. **attendance** - 報到記錄表
5. **badges** - 徽章表
6. **user_badges** - 使用者徽章關聯表

詳細的資料庫設計請參考 [API_SPEC.md](./API_SPEC.md)。

## 常用命令

### Docker Compose

```bash
# 啟動資料庫
docker-compose up -d

# 停止資料庫
docker-compose down

# 停止並刪除資料（⚠️ 警告：會刪除所有資料）
docker-compose down -v

# 查看日誌
docker-compose logs -f db

# 重啟資料庫
docker-compose restart db
```

### Alembic 遷移

```bash
# 創建新的遷移
alembic revision --autogenerate -m "描述訊息"

# 執行遷移
alembic upgrade head

# 回退一個版本
alembic downgrade -1

# 查看當前版本
alembic current

# 查看遷移歷史
alembic history
```

## 故障排除

### 問題：無法連接到資料庫

**檢查項目：**
1. Docker 容器是否運行：`docker ps`
2. 資料庫是否健康：`docker-compose ps`
3. 連接字串是否正確：檢查 `.env` 中的 `DATABASE_URL`

**解決方法：**
```bash
# 重啟資料庫
docker-compose restart db

# 檢查日誌
docker-compose logs db
```

### 問題：遷移失敗

**檢查項目：**
1. 資料庫是否已啟動
2. 連接字串是否正確
3. 是否有未解決的遷移衝突

**解決方法：**
```bash
# 查看當前狀態
alembic current

# 查看遷移歷史
alembic history

# 如果需要，可以手動標記版本
alembic stamp head
```

### 問題：端口已被占用

如果 5432 端口已被占用，可以修改 `docker-compose.yml`：

```yaml
ports:
  - "5433:5432"  # 改為其他端口
```

然後更新 `.env` 中的 `DATABASE_URL`：
```
DATABASE_URL=postgresql://townpass:townpass@localhost:5433/townpass
```

## 開發建議

1. **使用遷移**：永遠使用 Alembic 遷移來修改資料庫結構，不要手動修改
2. **備份資料**：在生產環境前，確保有備份策略
3. **測試環境**：使用獨立的測試資料庫進行測試
4. **版本控制**：將遷移文件提交到版本控制系統

## 下一步

資料庫設置完成後，可以開始：
1. 實作認證系統（JWT）
2. 建立 API 端點
3. 設置 Celery 任務處理
4. 編寫測試

參考 [API_SPEC.md](./API_SPEC.md) 了解完整的 API 規格。

