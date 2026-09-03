from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import XPost
from app.db.repository import XSentimentAnalyticsRepository

logger = logging.getLogger(__name__)


def truncate_to_hour(dt: datetime) -> datetime:
    """Truncates timestamp to start of hour in UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.replace(minute=0, second=0, microsecond=0)


def rollup_sentiment_from_posts(
    session: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> int:
    """
    Derives sentiment analytics rollups directly from enriched x_posts.
    Aggregates sentiment distribution grouped by 1-hour time buckets.
    Upserts into x_sentiment_analytics table idempotently.
    """
    logger.info("Computing sentiment rollups from x_posts...")
    stmt = select(
        XPost.timestamp,
        XPost.sentiment,
        XPost.sentiment_confidence,
    ).where(
        XPost.sentiment.is_not(None),
        XPost.timestamp.is_not(None),
    )

    if start_date:
        stmt = stmt.where(XPost.timestamp >= start_date)
    if end_date:
        stmt = stmt.where(XPost.timestamp <= end_date)

    rows = session.execute(stmt).all()
    if not rows:
        logger.info("No enriched posts found for sentiment rollup.")
        return 0

    # Group by hourly period
    periods: dict[datetime, dict[str, Any]] = {}
    for ts, sentiment_raw, conf in rows:
        period = truncate_to_hour(ts)
        if period not in periods:
            periods[period] = {
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "total": 0,
                "conf_sum": 0.0,
                "conf_count": 0,
            }

        sent = str(sentiment_raw).lower()
        if sent in periods[period]:
            periods[period][sent] += 1
        periods[period]["total"] += 1

        if conf is not None:
            periods[period]["conf_sum"] += float(conf)
            periods[period]["conf_count"] += 1

    records: list[dict[str, Any]] = []
    for period, stats in periods.items():
        total = stats["total"]
        pos = stats["positive"]
        neg = stats["negative"]
        neu = stats["neutral"]

        pos_pct = round((pos / total) * 100.0, 2) if total > 0 else 0.0
        neg_pct = round((neg / total) * 100.0, 2) if total > 0 else 0.0
        neu_pct = round((neu / total) * 100.0, 2) if total > 0 else 0.0
        avg_conf = (
            round(stats["conf_sum"] / stats["conf_count"], 4)
            if stats["conf_count"] > 0
            else None
        )

        records.append({
            "time_period": period,
            "positive_posts": pos,
            "negative_posts": neg,
            "neutral_posts": neu,
            "positive_percentage": pos_pct,
            "negative_percentage": neg_pct,
            "neutral_percentage": neu_pct,
            "average_confidence": avg_conf,
        })

    repo = XSentimentAnalyticsRepository(session)
    count = repo.upsert_sentiment(records)
    logger.info("Upserted %d sentiment analytics periods.", count)
    return count
