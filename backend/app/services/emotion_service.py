from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import XPost
from app.db.repository import XEmotionAnalyticsRepository

logger = logging.getLogger(__name__)


def truncate_to_hour(dt: datetime) -> datetime:
    """Truncates timestamp to start of hour in UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.replace(minute=0, second=0, microsecond=0)


def rollup_emotions_from_posts(
    session: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> int:
    """
    Derives emotion analytics rollups directly from enriched x_posts.
    Aggregates emotion counts per hourly time period.
    Enforces UNIQUE(time_period, emotion) integrity and upserts idempotently.
    """
    logger.info("Computing emotion rollups from x_posts...")
    stmt = select(
        XPost.timestamp,
        XPost.emotion,
        XPost.emotion_confidence,
    ).where(
        XPost.emotion.is_not(None),
        XPost.timestamp.is_not(None),
    )

    if start_date:
        stmt = stmt.where(XPost.timestamp >= start_date)
    if end_date:
        stmt = stmt.where(XPost.timestamp <= end_date)

    rows = session.execute(stmt).all()
    if not rows:
        logger.info("No enriched posts found for emotion rollup.")
        return 0

    # Period totals and per-emotion counts
    period_totals: dict[datetime, int] = {}
    period_emotions: dict[tuple[datetime, str], dict[str, Any]] = {}

    for ts, emotion_raw, conf in rows:
        period = truncate_to_hour(ts)
        emotion = str(emotion_raw).lower()
        key = (period, emotion)

        period_totals[period] = period_totals.get(period, 0) + 1

        if key not in period_emotions:
            period_emotions[key] = {
                "count": 0,
                "conf_sum": 0.0,
                "conf_count": 0,
            }

        period_emotions[key]["count"] += 1
        if conf is not None:
            period_emotions[key]["conf_sum"] += float(conf)
            period_emotions[key]["conf_count"] += 1

    records: list[dict[str, Any]] = []
    for (period, emotion), stats in period_emotions.items():
        total_in_period = period_totals[period]
        count = stats["count"]
        pct = round((count / total_in_period) * 100.0, 2) if total_in_period > 0 else 0.0
        avg_conf = (
            round(stats["conf_sum"] / stats["conf_count"], 4)
            if stats["conf_count"] > 0
            else None
        )

        records.append({
            "time_period": period,
            "emotion": emotion,
            "post_count": count,
            "percentage": pct,
            "average_confidence": avg_conf,
        })

    repo = XEmotionAnalyticsRepository(session)
    count = repo.upsert_emotions(records)
    logger.info("Upserted %d emotion analytics rows.", count)
    return count
