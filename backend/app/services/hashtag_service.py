from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Sequence

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import XPost
from app.db.repository import XHashtagTrendRepository

logger = logging.getLogger(__name__)


def normalize_hashtag(raw_tag: str) -> tuple[str, str]:
    """
    Normalizes a hashtag string into:
    1. canonical lookup key (lowercase, stripped of '#')
    2. standard display tag (prefixed with '#', preserving casing)
    """
    clean = raw_tag.strip().lstrip("#").strip()
    if not clean:
        return "", ""
    lookup_key = clean.lower()
    display_tag = f"#{clean}"
    return lookup_key, display_tag


def compute_growth_rate(current_count: int, previous_count: int) -> float:
    """
    Calculates percentage growth from previous period.
    Zero-baseline rule:
      - If previous_count > 0: (current - previous) / previous
      - If previous_count == 0 and current > 0: 1.0 (+100% initial emergence)
      - If both are 0: 0.0
    """
    if previous_count > 0:
        return float((current_count - previous_count) / previous_count)
    if current_count > 0:
        return 1.0
    return 0.0


def compute_trend_velocity(current_count: int, previous_count: int, period_hours: float = 1.0) -> float:
    """
    Calculates the rate of change in post volume per hour.
    Formula: (current_count - previous_count) / period_hours
    """
    effective_hours = max(float(period_hours), 0.1)
    return float((current_count - previous_count) / effective_hours)


def compute_trend_score(
    post_count: int,
    unique_users: int,
    growth_rate: float,
    trend_velocity: float,
) -> float:
    """
    Computes a composite, deterministic trend score out of volume, user diversity, growth, and velocity.
    Formula:
      score = (post_count * 0.4) + (unique_users * 0.3) + (max(growth_rate, 0) * 20.0 * 0.2) + (max(trend_velocity, 0) * 0.1)
    """
    pos_growth = max(growth_rate, 0.0)
    pos_vel = max(trend_velocity, 0.0)
    score = (post_count * 0.4) + (unique_users * 0.3) + (pos_growth * 20.0 * 0.2) + (pos_vel * 0.1)
    return round(float(score), 2)


def compute_trend_status(growth_rate: float, post_count: int) -> str:
    """
    Determines categorical status:
      - 'Spiking': growth_rate >= 1.0 (+100% or more) and post_count >= 5
      - 'Rising': growth_rate > 0.2 (+20% or more)
      - 'Declining': growth_rate < -0.2 (-20% or less)
      - 'Stable': between -20% and +20%
    """
    if growth_rate >= 1.0 and post_count >= 5:
        return "Spiking"
    if growth_rate > 0.2:
        return "Rising"
    if growth_rate < -0.2:
        return "Declining"
    return "Stable"


def _truncate_timestamp_to_period(ts: datetime, period_hours: int = 1) -> datetime:
    """Truncate timestamp to the beginning of its period_hours bin."""
    ts_utc = ts if ts.tzinfo is not None else ts.replace(tzinfo=timezone.utc)
    hour = (ts_utc.hour // period_hours) * period_hours
    return ts_utc.replace(hour=hour, minute=0, second=0, microsecond=0)


def extract_and_calculate_trends(
    posts_data: list[tuple[datetime, str, Any]],  # [(timestamp, user_id, hashtags)]
    period_hours: int = 1,
) -> list[dict[str, Any]]:
    """
    Given a list of (timestamp, user_id, hashtags), aggregates occurrences into
    discrete time bins, computes growth rate, velocity, score, and status, and
    returns a list of dictionaries for x_hashtag_trends.
    """
    if not posts_data:
        return []

    # 1. Bucket posts by (lookup_key, period_bin)
    # Structure: buckets[lookup_key][period_bin] = {"users": set(), "count": int, "display": str}
    buckets: dict[str, dict[datetime, dict[str, Any]]] = defaultdict(lambda: defaultdict(lambda: {"users": set(), "count": 0, "display": ""}))
    display_names: dict[str, str] = {}

    for ts, user_id, raw_hashtags in posts_data:
        if not raw_hashtags:
            continue

        period_bin = _truncate_timestamp_to_period(ts, period_hours)
        tags_list: list[str] = []

        if isinstance(raw_hashtags, list):
            tags_list = [str(t) for t in raw_hashtags if t]
        elif isinstance(raw_hashtags, str):
            sep = ";" if ";" in raw_hashtags else ("," if "," in raw_hashtags else None)
            tags_list = [t.strip() for t in raw_hashtags.split(sep) if t.strip()] if sep else [raw_hashtags.strip()]

        for raw_tag in tags_list:
            lookup_key, display_tag = normalize_hashtag(raw_tag)
            if not lookup_key:
                continue

            if lookup_key not in display_names:
                display_names[lookup_key] = display_tag

            entry = buckets[lookup_key][period_bin]
            entry["count"] += 1
            entry["users"].add(str(user_id))
            entry["display"] = display_names[lookup_key]

    # 2. Compute chronological trend metrics per hashtag
    trend_records: list[dict[str, Any]] = []

    for lookup_key, periods_map in buckets.items():
        sorted_periods = sorted(periods_map.keys())
        tag_display = display_names.get(lookup_key, f"#{lookup_key}")

        for i, current_period in enumerate(sorted_periods):
            curr_data = periods_map[current_period]
            curr_count = curr_data["count"]
            unique_users = len(curr_data["users"])

            # Check if immediate previous period exists
            prev_period = current_period - timedelta(hours=period_hours)
            prev_count = periods_map[prev_period]["count"] if prev_period in periods_map else 0

            growth = compute_growth_rate(curr_count, prev_count)
            vel = compute_trend_velocity(curr_count, prev_count, float(period_hours))
            score = compute_trend_score(curr_count, unique_users, growth, vel)
            status = compute_trend_status(growth, curr_count)

            trend_records.append({
                "hashtag": tag_display,
                "time_period": current_period,
                "post_count": curr_count,
                "unique_users": unique_users,
                "previous_period_count": prev_count,
                "growth_rate": round(growth, 4),
                "trend_velocity": round(vel, 2),
                "trend_score": score,
                "trend_status": status,
            })

    return trend_records


def backfill_hashtag_trends(session: Session, period_hours: int = 1) -> dict[str, Any]:
    """
    Calculates and persists hashtag trends across all existing records in x_posts.
    """
    repo = XHashtagTrendRepository(session)
    logger.info("Starting hashtag trends backfill from x_posts...")

    # Query all posts with hashtags
    stmt = select(XPost.timestamp, XPost.user_id, XPost.hashtags).where(XPost.hashtags.is_not(None))
    results = session.execute(stmt).all()
    logger.info("Found %d total posts with hashtags in x_posts", len(results))

    posts_data = [(row[0], row[1], row[2]) for row in results]
    trend_records = extract_and_calculate_trends(posts_data, period_hours=period_hours)

    upserted_count = repo.upsert_trends(trend_records)
    logger.info("Successfully upserted %d trend records into x_hashtag_trends", upserted_count)

    return {
        "status": "completed",
        "posts_scanned": len(posts_data),
        "trend_records_upserted": upserted_count,
        "unique_hashtags_analyzed": len(set(r["hashtag"] for r in trend_records)),
    }


def parse_filter_datetime(dt_val: str | datetime | None) -> datetime | None:
    """Parses date string (e.g. '2026-08-01') or datetime to timezone-aware datetime."""
    if dt_val is None:
        return None
    if isinstance(dt_val, datetime):
        return dt_val if dt_val.tzinfo is not None else dt_val.replace(tzinfo=timezone.utc)
    try:
        parsed = pd.to_datetime(dt_val, utc=True)
        return parsed.to_pydatetime()
    except Exception:
        return None


def get_rising_hashtags(
    session: Session,
    start_date: str | datetime | None = None,
    end_date: str | datetime | None = None,
    limit: int = 20,
    status: str | None = None,
) -> list[dict[str, Any]]:
    """
    Retrieves top rising hashtags in the specified date range.
    """
    repo = XHashtagTrendRepository(session)
    start_dt = parse_filter_datetime(start_date)
    end_dt = parse_filter_datetime(end_date)
    if end_dt and len(str(end_date or "")) == 10:  # If YYYY-MM-DD passed, include entire day
        end_dt = end_dt + timedelta(days=1) - timedelta(microseconds=1)

    return repo.get_top_hashtags(
        start_date=start_dt,
        end_date=end_dt,
        limit=limit,
        status=status,
    )


def get_hashtag_intelligence(
    session: Session,
    hashtag: str,
    start_date: str | datetime | None = None,
    end_date: str | datetime | None = None,
) -> dict[str, Any] | None:
    """
    Retrieves deep pre-computed metrics and time-series for a specific hashtag.
    """
    repo = XHashtagTrendRepository(session)
    start_dt = parse_filter_datetime(start_date)
    end_dt = parse_filter_datetime(end_date)
    if end_dt and len(str(end_date or "")) == 10:
        end_dt = end_dt + timedelta(days=1) - timedelta(microseconds=1)

    return repo.get_hashtag_detail(
        hashtag=hashtag,
        start_date=start_dt,
        end_date=end_dt,
    )
