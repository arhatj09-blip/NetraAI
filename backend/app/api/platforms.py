"""
Platforms Endpoint
"""

from fastapi import APIRouter
from typing import List
from app.models.responses import PlatformResponse

router = APIRouter()


@router.get("/platforms", response_model=List[PlatformResponse])
async def get_platforms():
    """
    Get list of supported platforms
    
    Returns list of social media platforms that NetraAI can analyze.
    In Phase 1, these are based on historical datasets.
    
    Returns:
        List[PlatformResponse]: List of supported platforms
    """
    platforms = [
        PlatformResponse(
            id="x",
            name="X (Twitter)",
            description="Real-time sentiment tracking and trending topic analysis",
            icon="twitter",
            color="#3b82f6",
            active=True,
            record_count=124392
        ),
        PlatformResponse(
            id="reddit",
            name="Reddit",
            description="Discussion vector analysis and subreddit sentiment monitoring",
            icon="reddit",
            color="#f97316",
            active=True,
            record_count=87201
        ),
        PlatformResponse(
            id="telegram",
            name="Telegram",
            description="Encrypted channel analysis and alpha signal detection",
            icon="telegram",
            color="#0ea5e9",
            active=True,
            record_count=62799
        )
    ]
    
    return platforms
