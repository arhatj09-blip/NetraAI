"""
Pipeline Status Endpoint
"""

from fastapi import APIRouter
from datetime import datetime
from app.models.responses import PipelineStatusResponse
from app.services.ingestion_service import get_ingestion_state

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
    state = get_ingestion_state()
    current_time = datetime.now().astimezone()
    last_ingestion = state["last_ingestion"] or current_time
    next_refresh = state["next_refresh"] or current_time
    platform_records = state["platform_records"]
    status = "error" if state["error"] else "operational"

    return PipelineStatusResponse(
        status=status,
        message="Scheduled dataset ingestion" if not state["error"] else state["error"],
        last_ingestion=last_ingestion,
        next_refresh=next_refresh,
        records_processed=sum(platform_records.values()),
        analytics_updated=state["analytics_updated"] or last_ingestion,
        health_index=100.0 if not state["error"] else 0.0,
        active_platforms=[platform.upper() for platform in platform_records],
        platform_records={platform.upper(): count for platform, count in platform_records.items()}
    )
