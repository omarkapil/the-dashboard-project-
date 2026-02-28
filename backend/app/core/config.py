from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SME Cyber Exposure Dashboard"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security Tools
    NMAP_PATH: str = "nmap"
    OPENVAS_HOST: str = "localhost"
    OPENVAS_PORT: int = 9390
    OPENVAS_USER: str = "admin"
    OPENVAS_PASSWORD: str = "admin"
    
    # AI
    GEMINI_API_KEY: str = ""
    
    # SIEM and SOAR
    ELASTICSEARCH_URL: str = "http://localhost:9200"
    WAZUH_API_URL: str = "https://localhost:55000"
    WAZUH_API_USER: str = "wazuh"
    WAZUH_API_PASSWORD: str = "wazuh"
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook/"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
