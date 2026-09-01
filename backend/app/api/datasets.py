from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.responses import DatasetProcessingResponse
from app.services.data_service import get_processed_dataset

router = APIRouter()


@router.get("/data/{platform}", response_model=DatasetProcessingResponse)
async def get_processed_platform_data(platform: str):
    """Return cleaned and validated demo data for a supported platform."""
    platform_key = platform.lower().strip()
    if platform_key not in {"telegram", "x"}:
        raise HTTPException(status_code=404, detail=f"Unsupported platform '{platform}'. Supported: telegram, x")

    try:
        dataset = get_processed_dataset(platform_key)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return dataset


@router.get("/data/{platform}/stats")
async def get_platform_stats(platform: str):
    """Return the validation summary without the full raw dataset."""
    platform_key = platform.lower().strip()
    if platform_key not in {"telegram", "x"}:
        raise HTTPException(status_code=404, detail=f"Unsupported platform '{platform}'. Supported: telegram, x")

    dataset = get_processed_dataset(platform_key)
    return {"platform": platform_key, "validation": dataset["validation"]}
