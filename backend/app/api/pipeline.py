"""
Pipeline Status Endpoint
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
from app.models.responses import PipelineStatusResponse

router = APIRouter()


@router.get("/status", response_model=PipelineStatusResponse)
async def get_pipeline_status():
    """
    Get current pipeline status
    
    This endpoint returns the current state of the data processing pipeline.
    In Phase 1, this shows simulated batch processing status.
    
    Returns:
        PipelineStatusResponse: Current pipeline status and metrics
    """
    # Placeholder values for Phase 1
    # These will be replaced with actual pipeline metrics later
    current_time = datetime.utcnow()
    
    return PipelineStatusResponse(
        status="operational",
        message="Continuous Ingestion Engine v2.4",
        last_ingestion=current_time - timedelta(minutes=15),
        next_refresh=current_time + timedelta(minutes=8, seconds=42),
        records_processed=274392,
        analytics_updated=current_time - timedelta(minutes=5),
        health_index=99.8,
        active_platforms=["X", "Reddit", "Telegram"],
        platform_records={
            "X": 124392,
            "Reddit": 87201,
            "Telegram": 62799
        }
    )
