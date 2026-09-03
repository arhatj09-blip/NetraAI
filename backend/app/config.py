"""
Configuration Management
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    environment: str = "development"
    
    # Server
    port: int = 8000
    api_base_url: str = "http://localhost:8000"

    # Database
    database_url: str = "mysql+pymysql://root:@localhost:3306/netraai"
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"
    
    # Data paths (relative to backend directory)
    data_path_x: str = "../data/x"
    data_path_reddit: str = "../data/reddit"
    data_path_telegram: str = "../data/telegram"
    
    # Pipeline & Demo Configuration
    ingestion_interval_minutes: int = 15  # logical 15-minute window
    demo_mode: bool = True
    demo_ingestion_interval_seconds: int = 15  # 15 real seconds = 15 logical minutes in demo
    demo_total_duration_minutes: int = 45  # total logical timeline for synthetic dataset replay
    processing_batch_size: int = 5000  # maximum internal processing sub-batch size
    pipeline_refresh_interval: int = 900  # seconds (default 15 mins for standard mode)
    batch_size: int = 5000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def effective_tick_interval_seconds(self) -> int:
        """Return tick sleep seconds depending on whether demo acceleration is active."""
        if self.demo_mode:
            return self.demo_ingestion_interval_seconds
        return self.ingestion_interval_minutes * 60

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()
