from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1 import auth, check_in, events, users, badges, results
from app.api.v1.admin import events as admin_events, missions, nfc_tags, badges as admin_badges, user_badges

settings = get_settings()

app = FastAPI(
	title=settings.app_name,
	debug=settings.debug,
	version="1.0.0",
	description="TownPass API - NFC 活動報到系統"
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.allowed_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# 註冊 API 路由
api_v1_prefix = settings.api_v1_prefix + "/v1"

app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["認證"])
app.include_router(check_in.router, prefix=f"{api_v1_prefix}/check-in", tags=["報到"])
app.include_router(events.router, prefix=f"{api_v1_prefix}/events", tags=["活動"])
app.include_router(users.router, prefix=f"{api_v1_prefix}/users", tags=["使用者"])
app.include_router(badges.router, prefix=f"{api_v1_prefix}/badges", tags=["徽章"])
app.include_router(results.router, prefix=f"{api_v1_prefix}", tags=["成果"])

# 管理員 CRUD API
app.include_router(admin_events.router, prefix=f"{api_v1_prefix}/admin/events", tags=["管理員-活動"])
app.include_router(missions.router, prefix=f"{api_v1_prefix}/admin/missions", tags=["管理員-任務"])
app.include_router(nfc_tags.router, prefix=f"{api_v1_prefix}/admin/nfc-tags", tags=["管理員-NFC標籤"])
app.include_router(admin_badges.router, prefix=f"{api_v1_prefix}/admin/badges", tags=["管理員-徽章"])
app.include_router(user_badges.router, prefix=f"{api_v1_prefix}/admin/user-badges", tags=["管理員-使用者徽章"])


@app.get("/")
async def root():
	return {
		"message": "Welcome to TownPass API",
		"version": "1.0.0",
		"docs": "/docs",
		"health": "/health"
	}


@app.get("/health")
async def health():
	return {"status": "ok"}
