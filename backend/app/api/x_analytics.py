from __future__ import annotations

from datetime import datetime, timezone
import math
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.database import get_session
from app.db.models import (
    XEmotionAnalytics,
    XHashtagTrend,
    XPipelineRun,
    XPost,
    XSentimentAnalytics,
)

router = APIRouter()


def _parse_datetime_filter(dt_val: Optional[str]) -> Optional[datetime]:
    if not dt_val:
        return None
    try:
        import pandas as pd
        return pd.to_datetime(dt_val, utc=True).to_pydatetime()
    except Exception:
        return None


def _clean_str(val: Any) -> Optional[str]:
    if isinstance(val, str) and val.strip():
        return val.strip()
    return None


def _apply_common_filters(
    query,
    keyword: Optional[str] = None,
    hashtag: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sentiment: Optional[str] = None,
    emotion: Optional[str] = None,
    topic: Optional[str] = None,
    gender: Optional[str] = None,
    age_group: Optional[str] = None,
    region: Optional[str] = None,
):
    kw_str = _clean_str(keyword)
    if kw_str:
        k = f"%{kw_str}%"
        query = query.where(or_(XPost.text.ilike(k), XPost.username.ilike(k)))

    tag_str = _clean_str(hashtag)
    if tag_str:
        tag = tag_str.lstrip("#")
        from sqlalchemy import cast, String
        query = query.where(
            or_(
                cast(XPost.hashtags, String).ilike(f"%{tag}%"),
                XPost.text.ilike(f"%#{tag}%"),
                XPost.text.ilike(f"%{tag}%"),
            )
        )

    df_str = _clean_str(date_from)
    dt_start = _parse_datetime_filter(df_str)
    if dt_start:
        query = query.where(XPost.timestamp >= dt_start)

    dt_str = _clean_str(date_to)
    dt_end = _parse_datetime_filter(dt_str)
    if dt_end:
        query = query.where(XPost.timestamp <= dt_end)

    sent_str = _clean_str(sentiment)
    if sent_str:
        query = query.where(XPost.sentiment.ilike(sent_str))

    emo_str = _clean_str(emotion)
    if emo_str:
        query = query.where(XPost.emotion.ilike(emo_str))

    top_str = _clean_str(topic)
    if top_str:
        query = query.where(XPost.topic.ilike(f"%{top_str}%"))

    gen_str = _clean_str(gender)
    if gen_str:
        query = query.where(XPost.gender.ilike(gen_str))

    age_str = _clean_str(age_group)
    if age_str:
        query = query.where(XPost.age_group.ilike(age_str))

    reg_str = _clean_str(region)
    if reg_str:
        query = query.where(XPost.region.ilike(reg_str))

    return query


@router.get("/analytics")
async def get_x_analytics_overview(
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    topic: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Main overview dashboard endpoint for X platform.
    Aggregates metrics directly from MySQL without rerunning NLP inference or reading CSVs.
    """
    # 1. Total posts and unique users
    tot_stmt = _apply_common_filters(select(func.count(XPost.id)), date_from=date_from, date_to=date_to, topic=topic)
    total_posts = session.scalar(tot_stmt) or 0

    usr_stmt = _apply_common_filters(select(func.count(func.distinct(XPost.user_id))), date_from=date_from, date_to=date_to, topic=topic)
    unique_users = session.scalar(usr_stmt) or 0

    # 2. Sentiment distribution
    sent_stmt = _apply_common_filters(
        select(XPost.sentiment, func.count(XPost.id)).where(XPost.sentiment.is_not(None)).group_by(XPost.sentiment),
        date_from=date_from, date_to=date_to, topic=topic
    )
    sent_rows = session.execute(sent_stmt).all()
    sent_counts = {r[0].lower(): r[1] for r in sent_rows if r[0]}
    pos = sent_counts.get("positive", 0)
    neg = sent_counts.get("negative", 0)
    neu = sent_counts.get("neutral", 0)
    sent_total = max(pos + neg + neu, 1)

    # 3. Emotion distribution
    emot_stmt = _apply_common_filters(
        select(XPost.emotion, func.count(XPost.id)).where(XPost.emotion.is_not(None)).group_by(XPost.emotion).order_by(func.count(XPost.id).desc()),
        date_from=date_from, date_to=date_to, topic=topic
    )
    emot_rows = session.execute(emot_stmt).all()
    emot_total = sum(r[1] for r in emot_rows) or 1
    emotion_distribution = [
        {
            "emotion": r[0],
            "count": r[1],
            "percentage": round((r[1] / emot_total) * 100.0, 2),
        }
        for r in emot_rows if r[0]
    ]

    # 4. Top topics
    topic_stmt = _apply_common_filters(
        select(XPost.topic, func.count(XPost.id), func.avg(XPost.topic_probability)).where(XPost.topic.is_not(None)).group_by(XPost.topic).order_by(func.count(XPost.id).desc()).limit(10),
        date_from=date_from, date_to=date_to, topic=topic
    )
    topic_rows = session.execute(topic_stmt).all()
    top_topics = [
        {
            "topic": r[0],
            "count": r[1],
            "percentage": round((r[1] / max(total_posts, 1)) * 100.0, 2),
            "avg_probability": round(float(r[2] or 0.0), 4),
        }
        for r in topic_rows if r[0]
    ]

    # 5. Top hashtags
    tag_stmt = (
        select(
            XHashtagTrend.hashtag,
            func.sum(XHashtagTrend.post_count).label("cnt"),
            func.avg(XHashtagTrend.growth_rate).label("growth"),
            func.max(XHashtagTrend.trend_score).label("score"),
        )
        .group_by(XHashtagTrend.hashtag)
        .order_by(func.max(XHashtagTrend.trend_score).desc())
        .limit(10)
    )
    tag_rows = session.execute(tag_stmt).all()
    top_hashtags = [
        {
            "hashtag": r[0],
            "count": int(r[1] or 0),
            "growth_rate": round(float(r[2] or 0.0), 4),
            "score": round(float(r[3] or 0.0), 2),
        }
        for r in tag_rows
    ]

    # 6. Demographics
    gender_stmt = _apply_common_filters(
        select(XPost.gender, func.count(XPost.id)).where(XPost.gender.is_not(None)).group_by(XPost.gender),
        date_from=date_from, date_to=date_to, topic=topic
    )
    gender_rows = session.execute(gender_stmt).all()
    g_total = sum(r[1] for r in gender_rows) or 1
    genders = [{"label": r[0], "count": r[1], "percentage": round((r[1] / g_total) * 100.0, 1)} for r in gender_rows if r[0]]

    age_stmt = _apply_common_filters(
        select(XPost.age_group, func.count(XPost.id)).where(XPost.age_group.is_not(None)).group_by(XPost.age_group).order_by(XPost.age_group.asc()),
        date_from=date_from, date_to=date_to, topic=topic
    )
    age_rows = session.execute(age_stmt).all()
    a_total = sum(r[1] for r in age_rows) or 1
    age_groups = [{"label": r[0], "count": r[1], "percentage": round((r[1] / a_total) * 100.0, 1)} for r in age_rows if r[0]]

    region_stmt = _apply_common_filters(
        select(XPost.region, func.count(XPost.id)).where(XPost.region.is_not(None)).group_by(XPost.region).order_by(func.count(XPost.id).desc()),
        date_from=date_from, date_to=date_to, topic=topic
    )
    region_rows = session.execute(region_stmt).all()
    r_total = sum(r[1] for r in region_rows) or 1
    regions = [{"label": r[0], "count": r[1], "percentage": round((r[1] / r_total) * 100.0, 1)} for r in region_rows if r[0]]

    # 7. Latest run & pipeline status
    last_run = session.scalar(
        select(XPipelineRun)
        .where(XPipelineRun.platform == "x", XPipelineRun.status == "completed")
        .order_by(XPipelineRun.id.desc())
    )

    return {
        "total_posts": total_posts,
        "unique_users": unique_users,
        "sentiment_distribution": {
            "positive": pos,
            "negative": neg,
            "neutral": neu,
            "positive_pct": round((pos / sent_total) * 100.0, 2),
            "negative_pct": round((neg / sent_total) * 100.0, 2),
            "neutral_pct": round((neu / sent_total) * 100.0, 2),
        },
        "emotion_distribution": emotion_distribution,
        "top_topics": top_topics,
        "top_hashtags": top_hashtags,
        "demographics": {
            "gender": genders,
            "age_groups": age_groups,
            "regions": regions,
        },
        "latest_analysis_timestamp": last_run.actual_end_time.isoformat() if last_run and last_run.actual_end_time else datetime.now(timezone.utc).isoformat(),
        "pipeline_status": {
            "status": "operational",
            "last_cycle_id": last_run.ingestion_cycle_id if last_run else None,
            "records_processed": last_run.records_processed if last_run else total_posts,
        },
    }


@router.get("/sentiment")
async def get_x_sentiment_analytics(
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Returns sentiment summary breakdown and chronological timeline series.
    """
    start_dt = _parse_datetime_filter(_clean_str(date_from))
    end_dt = _parse_datetime_filter(_clean_str(date_to))

    stmt = select(XSentimentAnalytics).order_by(XSentimentAnalytics.time_period.asc())
    if start_dt:
        stmt = stmt.where(XSentimentAnalytics.time_period >= start_dt)
    if end_dt:
        stmt = stmt.where(XSentimentAnalytics.time_period <= end_dt)

    rows = session.scalars(stmt).all()

    total_pos = sum(r.positive_posts for r in rows)
    total_neg = sum(r.negative_posts for r in rows)
    total_neu = sum(r.neutral_posts for r in rows)
    grand_total = max(total_pos + total_neg + total_neu, 1)

    timeline = [
        {
            "time_period": r.time_period.isoformat(),
            "time": r.time_period.isoformat(),
            "positive_posts": r.positive_posts,
            "negative_posts": r.negative_posts,
            "neutral_posts": r.neutral_posts,
            "positive_percentage": r.positive_percentage,
            "negative_percentage": r.negative_percentage,
            "neutral_percentage": r.neutral_percentage,
            "average_confidence": r.average_confidence,
        }
        for r in rows
    ]

    return {
        "summary": {
            "positive": total_pos,
            "negative": total_neg,
            "neutral": total_neu,
            "total": grand_total,
            "positive_percentage": round((total_pos / grand_total) * 100.0, 2),
            "negative_percentage": round((total_neg / grand_total) * 100.0, 2),
            "neutral_percentage": round((total_neu / grand_total) * 100.0, 2),
        },
        "timeline": timeline,
    }


@router.get("/emotions")
async def get_x_emotions_analytics(
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    emotion: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Returns emotion distribution breakdown and chronological timeline series.
    """
    start_dt = _parse_datetime_filter(_clean_str(date_from))
    end_dt = _parse_datetime_filter(_clean_str(date_to))
    emo_clean = _clean_str(emotion)

    stmt = select(XEmotionAnalytics).order_by(XEmotionAnalytics.time_period.asc())
    if start_dt:
        stmt = stmt.where(XEmotionAnalytics.time_period >= start_dt)
    if end_dt:
        stmt = stmt.where(XEmotionAnalytics.time_period <= end_dt)
    if emo_clean:
        stmt = stmt.where(XEmotionAnalytics.emotion.ilike(emo_clean))

    rows = session.scalars(stmt).all()

    # Aggregate counts by emotion
    totals_map: dict[str, int] = {}
    for r in rows:
        totals_map[r.emotion] = totals_map.get(r.emotion, 0) + r.post_count

    all_total = sum(totals_map.values()) or 1
    summary = [
        {
            "emotion": em,
            "value": round((cnt / all_total) * 100.0, 1),
            "count": cnt,
            "percentage": round((cnt / all_total) * 100.0, 1),
        }
        for em, cnt in sorted(totals_map.items(), key=lambda x: x[1], reverse=True)
    ]

    timeline = [
        {
            "time_period": r.time_period.isoformat(),
            "emotion": r.emotion,
            "post_count": r.post_count,
            "percentage": r.percentage,
            "average_confidence": r.average_confidence,
        }
        for r in rows
    ]

    return {
        "summary": summary,
        "timeline": timeline,
    }


@router.get("/demographics")
async def get_x_demographics(
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    topic: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Returns observed and inferred demographic breakdowns for X posts.
    """
    # Gender
    gender_stmt = _apply_common_filters(
        select(XPost.gender, func.count(XPost.id)).where(XPost.gender.is_not(None)).group_by(XPost.gender),
        date_from=date_from, date_to=date_to, topic=topic
    )
    gender_rows = session.execute(gender_stmt).all()
    g_total = sum(r[1] for r in gender_rows) or 1
    gender = [{"label": r[0], "count": r[1], "value": round((r[1] / g_total) * 100.0, 1), "percentage": round((r[1] / g_total) * 100.0, 1)} for r in gender_rows if r[0]]

    # Age Groups
    age_stmt = _apply_common_filters(
        select(XPost.age_group, func.count(XPost.id)).where(XPost.age_group.is_not(None)).group_by(XPost.age_group).order_by(XPost.age_group.asc()),
        date_from=date_from, date_to=date_to, topic=topic
    )
    age_rows = session.execute(age_stmt).all()
    a_total = sum(r[1] for r in age_rows) or 1
    age_groups = [{"label": r[0], "range": r[0], "count": r[1], "value": round((r[1] / a_total) * 100.0, 1), "percentage": round((r[1] / a_total) * 100.0, 1)} for r in age_rows if r[0]]

    # Regions
    region_stmt = _apply_common_filters(
        select(XPost.region, func.count(XPost.id)).where(XPost.region.is_not(None)).group_by(XPost.region).order_by(func.count(XPost.id).desc()),
        date_from=date_from, date_to=date_to, topic=topic
    )
    region_rows = session.execute(region_stmt).all()
    r_total = sum(r[1] for r in region_rows) or 1
    regions = [{"label": r[0], "count": r[1], "value": round((r[1] / r_total) * 100.0, 1), "percentage": round((r[1] / r_total) * 100.0, 1)} for r in region_rows if r[0]]

    tot_stmt = _apply_common_filters(select(func.count(XPost.id)), date_from=date_from, date_to=date_to, topic=topic)
    total_records = session.scalar(tot_stmt) or 0

    return {
        "gender": gender,
        "age_groups": age_groups,
        "regions": regions,
        "total_records": total_records,
    }


@router.get("/posts")
async def get_x_posts_search(
    keyword: Optional[str] = Query(default=None),
    hashtag: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    sentiment: Optional[str] = Query(default=None),
    emotion: Optional[str] = Query(default=None),
    topic: Optional[str] = Query(default=None),
    gender: Optional[str] = Query(default=None),
    age_group: Optional[str] = Query(default=None),
    region: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Paginated search and filter endpoint for X posts.
    Never returns unbounded 15K posts in one request.
    """
    base_q = select(XPost)
    base_q = _apply_common_filters(
        base_q,
        keyword=keyword,
        hashtag=hashtag,
        date_from=date_from,
        date_to=date_to,
        sentiment=sentiment,
        emotion=emotion,
        topic=topic,
        gender=gender,
        age_group=age_group,
        region=region,
    )

    count_q = _apply_common_filters(
        select(func.count(XPost.id)),
        keyword=keyword,
        hashtag=hashtag,
        date_from=date_from,
        date_to=date_to,
        sentiment=sentiment,
        emotion=emotion,
        topic=topic,
        gender=gender,
        age_group=age_group,
        region=region,
    )
    total = session.scalar(count_q) or 0
    total_pages = max(math.ceil(total / page_size), 1)

    offset = (page - 1) * page_size
    paged_q = base_q.order_by(XPost.timestamp.desc(), XPost.id.desc()).offset(offset).limit(page_size)
    posts = list(session.scalars(paged_q).all())

    items = [
        {
            "id": p.id,
            "post_id": p.post_id,
            "user_id": p.user_id,
            "username": p.username,
            "text": p.text,
            "timestamp": p.timestamp.isoformat(),
            "hashtags": p.hashtags,
            "mentions": p.mentions,
            "like_count": p.like_count,
            "reply_count": p.reply_count,
            "retweet_count": p.retweet_count,
            "quote_count": p.quote_count,
            "bookmark_count": p.bookmark_count,
            "impressions": p.impressions,
            "followers_count": p.followers_count,
            "following_count": p.following_count,
            "verified": p.verified,
            "bio": p.bio,
            "location": p.location,
            "language": p.language,
            "sentiment": p.sentiment,
            "sentiment_confidence": p.sentiment_confidence,
            "emotion": p.emotion,
            "emotion_confidence": p.emotion_confidence,
            "emotion_source": p.emotion_source,
            "topic": p.topic,
            "topic_probability": p.topic_probability,
            "gender": p.gender,
            "age_group": p.age_group,
            "region": p.region,
        }
        for p in posts
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
