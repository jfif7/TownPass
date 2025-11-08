from functools import lru_cache
from typing import List

try:
	from pydantic_settings import BaseSettings, SettingsConfigDict
except Exception:  # Fallback for older environments
	from pydantic import BaseSettings  # type: ignore
	SettingsConfigDict = dict  # type: ignore


class Settings(BaseSettings):
	app_name: str = "TownPass API"
	debug: bool = True
	api_v1_prefix: str = "/api"
	allowed_origins: List[str] = ["*"]
	env: str = "development"
	
	# Database
	database_url: str = "postgresql://townpass:townpass@localhost:5432/townpass"
	
	# JWT (for future use)
	secret_key: str = "your-secret-key-change-in-production"
	algorithm: str = "HS256"
	access_token_expire_minutes: int = 1440

	model_config = SettingsConfigDict(
		env_file=".env",
		extra="ignore",
	)


@lru_cache

def get_settings() -> Settings:
	return Settings()  # type: ignore[arg-type]
