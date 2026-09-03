from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.services.data_service import refresh_processed_datasets

logger = logging.getLogger(__name__)

_state = {
    "last_ingestion": None,
    "next_refresh": None,
    "analytics_updated": None,
    "platform_records": {},
    "error": None,
}


def get_ingestion_state() -> dict:
    """Return a copy of the latest scheduler state for API responses."""
    return {**_state, "platform_records": dict(_state["platform_records"])}


def refresh_now() -> None:
    """Refresh processed datasets and update scheduler state."""
    try:
        records = refresh_processed_datasets()
        completed_at = datetime.now(timezone.utc)
        _state.update(
            last_ingestion=completed_at,
            next_refresh=completed_at + timedelta(seconds=settings.pipeline_refresh_interval),
            analytics_updated=completed_at,
            platform_records=records,
            error=None,
        )
        logger.info("Dataset refresh completed: %s", records)
    except Exception as exc:
        _state["error"] = str(exc)
        logger.exception("Dataset refresh failed")
        raise


async def run_ingestion_worker(stop_event: asyncio.Event) -> None:
    """Refresh datasets on the configured interval until shutdown."""
    while not stop_event.is_set():
        try:
            await asyncio.wait_for(
                stop_event.wait(), timeout=settings.pipeline_refresh_interval
            )
        except asyncio.TimeoutError:
            try:
                await asyncio.to_thread(refresh_now)
            except Exception:
                continue