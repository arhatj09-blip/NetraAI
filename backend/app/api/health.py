"""
Health Check Endpoint
"""

from fastapi import APIRouter
from datetime import datetime
from app.models.responses import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify backend is running
    
    Returns:
        HealthResponse: Backend status and timestamp
    """
    return HealthResponse(
        status="healthy",
        message="NetraAI backend is running",
        timestamp=datetime.utcnow()
    )
