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
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"
    
    # Data paths (relative to backend directory)
    data_path_x: str = "../data/x"
    data_path_reddit: str = "../data/reddit"
    data_path_telegram: str = "../data/telegram"
    
    # Pipeline
    pipeline_refresh_interval: int = 900  # seconds
    batch_size: int = 1000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()
