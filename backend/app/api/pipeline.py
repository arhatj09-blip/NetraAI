"""
Pipeline Status and Scheduler Control Endpoints
"""

from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter

from app.config import settings
from app.models.responses import PipelineStatusResponse
from app.services.ingestion_service import (
    acknowledge_dashboard_refresh,
    get_ingestion_state,
    refresh_now,
)

router = APIRouter()


@router.get("/status", response_model=PipelineStatusResponse)
async def get_pipeline_status():
    """
    Get current authoritative pipeline status.
    Exposes whether a new analysis is ready for dashboard consumption.
    """
    state = get_ingestion_state()
    current_time = datetime.now(timezone.utc)
    last_ingestion = state["last_ingestion"] or current_time
    next_refresh = state["next_refresh"] or current_time
    analytics_updated = state["analytics_updated"] or last_ingestion
    platform_records = state.get("platform_records", {})
    status = state.get("status", "operational")

    return PipelineStatusResponse(
        status=status,
        message="Scheduled 15-minute dataset ingestion active" if not state["error"] else state["error"],
        last_ingestion=last_ingestion,
        next_refresh=next_refresh,
        records_processed=state.get("total_records_processed", sum(platform_records.values())),
        analytics_updated=analytics_updated,
        new_analysis_ready=bool(state.get("new_analysis_ready", False)),
        current_cycle_id=state.get("current_cycle_id"),
        last_completed_cycle=state.get("last_completed_cycle"),
        new_records_processed=int(state.get("new_records_processed", 0)),
        logical_window_index=int(state.get("logical_window_index", 0)),
        demo_mode=settings.demo_mode,
        health_index=100.0 if not state["error"] else 0.0,
        active_platforms=[platform.upper() for platform in platform_records] if platform_records else ["X"],
        platform_records={platform.upper(): count for platform, count in platform_records.items()} if platform_records else {"X": 0},
    )


@router.post("/ack-refresh")
async def acknowledge_refresh():
    """
    Called when the user clicks 'Refresh Dashboard' in the frontend.
    Resets the new_analysis_ready flag to indicate analysis was consumed.
    """
    acknowledge_dashboard_refresh()
    return {"status": "ok", "message": "Dashboard refresh acknowledged"}


@router.post("/trigger")
async def trigger_ingestion_cycle():
    """
    Trigger an immediate incremental ingestion cycle without waiting for the timer.
    """
    import asyncio
    await asyncio.to_thread(refresh_now)
    state = get_ingestion_state()
    return {
        "status": "triggered",
        "last_completed_cycle": state.get("last_completed_cycle"),
        "new_records_processed": state.get("new_records_processed", 0),
        "new_analysis_ready": state.get("new_analysis_ready", False),
    }
