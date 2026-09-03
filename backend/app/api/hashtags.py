"""
X/Twitter Hashtag Trend Analytics Endpoints
"""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_session
from app.models.responses import HashtagDetailResponse, HashtagTrendItem
from app.services.hashtag_service import (
    backfill_hashtag_trends,
    get_hashtag_intelligence,
    get_rising_hashtags,
)

router = APIRouter()


@router.get("/hashtags", response_model=List[HashtagTrendItem])
async def get_x_hashtags(
    start_date: Optional[str] = Query(default=None, description="Start date filter (e.g. 2026-08-01)"),
    end_date: Optional[str] = Query(default=None, description="End date filter (e.g. 2026-08-27)"),
    limit: int = Query(default=20, ge=1, le=100, description="Max number of hashtags to return"),
    status: Optional[str] = Query(default=None, description="Optional status filter: Rising, Spiking, Stable, Declining"),
    session: Session = Depends(get_session),
):
    """
    Retrieve top rising and trending hashtags for the X platform.
    Queries pre-computed trends from the database without invoking ML or raw CSV re-scans.
    """
    return get_rising_hashtags(
        session=session,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        status=status,
    )


@router.get("/hashtags/{hashtag}", response_model=HashtagDetailResponse)
async def get_x_hashtag_detail(
    hashtag: str,
    start_date: Optional[str] = Query(default=None, description="Start date filter (e.g. 2026-08-01)"),
    end_date: Optional[str] = Query(default=None, description="End date filter (e.g. 2026-08-27)"),
    session: Session = Depends(get_session),
):
    """
    Retrieve detailed metrics and time-series timeline for a specific hashtag.
    Powers the detailed hashtag-analysis popup modal.
    """
    detail = get_hashtag_intelligence(
        session=session,
        hashtag=hashtag,
        start_date=start_date,
        end_date=end_date,
    )

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail=f"Hashtag '{hashtag}' not found or has no recorded activity in the selected window.",
        )

    return detail


@router.post("/hashtags/backfill")
async def backfill_trends_endpoint(
    period_hours: int = Query(default=1, ge=1, le=24),
    session: Session = Depends(get_session),
):
    """
    Admin/utility endpoint to backfill hashtag trends from all currently stored x_posts.
    """
    return backfill_hashtag_trends(session, period_hours=period_hours)
