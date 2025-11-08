# TownPass Backend (FastAPI)

這是 TownPass 的 FastAPI 後端專案骨架。包含基本設定、健康檢查，以及 CORS 設定。

## 📚 文件

- **[使用流程指南](./USER_GUIDE.md)** - 完整的使用流程，包含使用者註冊、管理員建立活動系統等
- **[API 詳細規格與實作注意事項](./API_SPEC.md)** - 完整的 API 規格、資料庫設計、安全考量等詳細文件
- **[資料庫設置指南](./DATABASE_SETUP.md)** - 如何使用 Docker 啟動 PostgreSQL 並設置資料庫
- **[CRUD API 文檔](./CRUD_API.md)** - 管理員 CRUD API 完整文檔
- **[API Endpoints 總覽](./API_ENDPOINTS.md)** - 所有 API 端點的快速參考

## 需求
- Python 3.10 或以上（建議 3.11+）

## 使用 pyenv 管理 Python 版本（建議）
1) 安裝 pyenv（WSL/Ubuntu）：
```bash
curl https://pyenv.run | bash
# 依照安裝提示把初始化腳本加入殼層設定（~/.bashrc 或 ~/.zshrc）
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

2) 安裝並啟用專案 Python 版本：
```bash
cd backend
pyenv install 3.12.9
pyenv local 3.12.9   # 會建立 .python-version
python -V            # 應為 Python 3.12.9
```

> 若你使用 WSL2，請確保已安裝系統需求（如 build-essential、zlib、openssl 等）；常見：
```bash
sudo apt update && sudo apt install -y build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev curl llvm libncursesw5-dev xz-utils \
libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev tk-dev ca-certificates
```

### 故障排除（pyenv 編譯錯誤）
若看到 `_bz2`, `readline`, `_ssl` 等模組缺失：
```bash
# 安裝缺少的系統套件（見上方 apt 指令），完成後：
rm -rf ~/.pyenv/versions/3.12.9
pyenv install 3.12.9 -s
pyenv local 3.12.9
python -V
```
若出現 PATH 警告（pip3 不在 PATH）：請確認 shell 啟動檔已有：
```bash
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```
並重新開啟終端或 `exec $SHELL`。

## 安裝步驟
1) 建立與啟用虛擬環境（任選其一）：

```bash
# 方案 A：pyenv-virtualenv（建議）
pyenv virtualenv 3.12.9 townpass-3.12
pyenv local townpass-3.12
pyenv activate townpass-3.12  # 若有啟用 pyenv-virtualenv，亦可自動切換
python -V
which python

# 方案 B：內建 venv（替代）
python3 -m venv .venv
source .venv/bin/activate

# Windows PowerShell (venv)
python -m venv .venv
.venv\\Scripts\\Activate.ps1
```

2) 安裝套件：
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

3) 啟動開發伺服器：
```bash
# 確保在 backend 目錄下執行
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

或者從專案根目錄執行：
```bash
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

啟動後可測試：
- 健康檢查：`http://localhost:8000/health`
- Swagger 文件：`http://localhost:8000/docs`

## 專案結構
```
backend/
  ├─ app/
  │  ├─ core/
  │  │  ├─ __init__.py
  │  │  └─ config.py          # Pydantic 設定檔（支援 .env）
  │  ├─ __init__.py
  │  └─ main.py               # FastAPI 入口
  ├─ requirements.txt         # 相依套件
  └─ README.md                # 本說明文件
```

## 設定（環境變數）
預設使用 `pydantic-settings` 載入 `.env`，若需要可在 `backend` 目錄下新增 `.env`：

```env
APP_NAME=TownPass API
DEBUG=true
API_V1_PREFIX=/api
# 多個來源可用逗號分隔，例如：http://localhost:3000,https://example.com
ALLOWED_ORIGINS=*
ENV=development
```

> 若未提供 `.env`，程式會使用預設值。
