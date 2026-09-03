from __future__ import annotations

from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .models import XHashtagTrend, XPipelineRun, XPost


class XPostRepository:
    """Small persistence boundary for X posts used by ingestion work."""

    def __init__(self, session: Session):
        self.session = session

    def get_by_post_id(self, post_id: str) -> XPost | None:
        return self.session.scalar(select(XPost).where(XPost.post_id == post_id))

    def get_latest_post(self) -> XPost | None:
        """Returns the most recent post ordered chronologically by timestamp and post_id."""
        return self.session.scalars(
            select(XPost).order_by(XPost.timestamp.desc(), XPost.post_id.desc())
        ).first()

    def get_existing_post_ids(self, post_ids: Sequence[str]) -> set[str]:
        """Find which post_ids from the given sequence already exist in the database."""
        if not post_ids:
            return set()
        return set(
            self.session.scalars(
                select(XPost.post_id).where(XPost.post_id.in_(list(post_ids)))
            ).all()
        )

    def add(self, **values: object) -> XPost:
        post = XPost(**values)
        self.session.add(post)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise
        self.session.refresh(post)
        return post

    def add_all(self, posts_data: list[dict[str, object]]) -> list[XPost]:
        """Insert a batch of posts in a single transaction."""
        posts = [XPost(**values) for values in posts_data]
        self.session.add_all(posts)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise
        return posts

    def update(self, post_id: str, **values: object) -> XPost | None:
        post = self.get_by_post_id(post_id)
        if post is None:
            return None
        for key, value in values.items():
            setattr(post, key, value)
        post.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(post)
        return post


class XPipelineRunRepository:
    """Persistence boundary for ingestion runs and pipeline watermark tracking."""

    def __init__(self, session: Session):
        self.session = session

    def get_last_successful_run(self, platform: str = "x") -> XPipelineRun | None:
        """Retrieve the last completed/successful ingestion run for watermark tracking."""
        return self.session.scalars(
            select(XPipelineRun)
            .where(XPipelineRun.platform == platform, XPipelineRun.status == "completed")
            .order_by(XPipelineRun.scheduled_time.desc(), XPipelineRun.id.desc())
        ).first()

    def get_by_cycle_id(self, ingestion_cycle_id: str) -> XPipelineRun | None:
        return self.session.scalar(
            select(XPipelineRun).where(XPipelineRun.ingestion_cycle_id == ingestion_cycle_id)
        )

    def create_run(
        self,
        ingestion_cycle_id: str,
        platform: str,
        source: str,
        scheduled_time: datetime,
        records_available: int = 0,
        status: str = "started",
    ) -> XPipelineRun:
        run = XPipelineRun(
            ingestion_cycle_id=ingestion_cycle_id,
            platform=platform,
            source=source,
            scheduled_time=scheduled_time,
            actual_start_time=datetime.now(timezone.utc),
            records_available=records_available,
            status=status,
        )
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def complete_run(
        self,
        ingestion_cycle_id: str,
        records_ingested: int,
        records_processed: int,
        records_failed: int = 0,
    ) -> XPipelineRun | None:
        run = self.get_by_cycle_id(ingestion_cycle_id)
        if run is None:
            return None
        run.records_ingested = records_ingested
        run.records_processed = records_processed
        run.records_failed = records_failed
        run.status = "completed"
        run.actual_end_time = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(run)
        return run

    def fail_run(
        self,
        ingestion_cycle_id: str,
        error_message: str,
        records_failed: int = 0,
    ) -> XPipelineRun | None:
        run = self.get_by_cycle_id(ingestion_cycle_id)
        if run is None:
            return None
        run.status = "failed"
        run.error_message = error_message
        run.records_failed = records_failed
        run.actual_end_time = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(run)
        return run

    def count_completed_runs(self, platform: str = "x") -> int:
        """Count total completed ingestion runs for the given platform."""
        from sqlalchemy import func
        return self.session.scalar(
            select(func.count(XPipelineRun.id))
            .where(XPipelineRun.platform == platform, XPipelineRun.status == "completed")
        ) or 0

    def get_recent_runs(self, platform: str = "x", limit: int = 10) -> list[XPipelineRun]:
        """Fetch most recent pipeline runs for audit and status inspection."""
        return list(
            self.session.scalars(
                select(XPipelineRun)
                .where(XPipelineRun.platform == platform)
                .order_by(XPipelineRun.scheduled_time.desc(), XPipelineRun.id.desc())
                .limit(limit)
            ).all()
        )


class XHashtagTrendRepository:
    """Persistence and query boundary for hashtag trend analytics."""

    def __init__(self, session: Session):
        self.session = session

    def upsert_trends(self, trends_data: list[dict[str, Any]]) -> int:
        """
        Upsert trend records matching on (hashtag, time_period) without causing unique constraint errors.
        """
        if not trends_data:
            return 0

        dialect_name = self.session.bind.dialect.name if self.session.bind else "mysql"
        chunk_size = 1000
        total_upserted = 0

        for i in range(0, len(trends_data), chunk_size):
            chunk = trends_data[i : i + chunk_size]
            if dialect_name == "mysql":
                from sqlalchemy.dialects.mysql import insert as mysql_insert
                stmt = mysql_insert(XHashtagTrend).values(chunk)
                update_cols = {
                    "post_count": stmt.inserted.post_count,
                    "unique_users": stmt.inserted.unique_users,
                    "previous_period_count": stmt.inserted.previous_period_count,
                    "growth_rate": stmt.inserted.growth_rate,
                    "trend_velocity": stmt.inserted.trend_velocity,
                    "trend_score": stmt.inserted.trend_score,
                    "trend_status": stmt.inserted.trend_status,
                }
                upsert_stmt = stmt.on_duplicate_key_update(update_cols)
                self.session.execute(upsert_stmt)
            elif dialect_name == "sqlite":
                from sqlalchemy.dialects.sqlite import insert as sqlite_insert
                stmt = sqlite_insert(XHashtagTrend).values(chunk)
                update_cols = {
                    "post_count": stmt.excluded.post_count,
                    "unique_users": stmt.excluded.unique_users,
                    "previous_period_count": stmt.excluded.previous_period_count,
                    "growth_rate": stmt.excluded.growth_rate,
                    "trend_velocity": stmt.excluded.trend_velocity,
                    "trend_score": stmt.excluded.trend_score,
                    "trend_status": stmt.excluded.trend_status,
                }
                upsert_stmt = stmt.on_conflict_do_update(
                    index_elements=["hashtag", "time_period"],
                    set_=update_cols,
                )
                self.session.execute(upsert_stmt)
            else:
                for item in chunk:
                    existing = self.session.scalar(
                        select(XHashtagTrend).where(
                            XHashtagTrend.hashtag == item["hashtag"],
                            XHashtagTrend.time_period == item["time_period"],
                        )
                    )
                    if existing:
                        for k, v in item.items():
                            setattr(existing, k, v)
                    else:
                        self.session.add(XHashtagTrend(**item))

            total_upserted += len(chunk)

        self.session.commit()
        return total_upserted

    def get_top_hashtags(
        self,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        limit: int = 20,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Query top hashtags in the given observation window, aggregated across time periods.
        """
        from sqlalchemy import func

        stmt = select(
            XHashtagTrend.hashtag,
            func.sum(XHashtagTrend.post_count).label("total_posts"),
            func.max(XHashtagTrend.unique_users).label("max_unique_users"),
            func.avg(XHashtagTrend.growth_rate).label("avg_growth"),
            func.max(XHashtagTrend.trend_velocity).label("max_velocity"),
            func.max(XHashtagTrend.trend_score).label("peak_score"),
        )

        if start_date:
            stmt = stmt.where(XHashtagTrend.time_period >= start_date)
        if end_date:
            stmt = stmt.where(XHashtagTrend.time_period <= end_date)
        if status:
            stmt = stmt.where(XHashtagTrend.trend_status.ilike(status))

        stmt = stmt.group_by(XHashtagTrend.hashtag).order_by(
            func.max(XHashtagTrend.trend_score).desc(),
            func.sum(XHashtagTrend.post_count).desc(),
        ).limit(limit)

        results = self.session.execute(stmt).all()
        items: list[dict[str, Any]] = []

        for row in results:
            tag, total_posts, max_users, avg_growth, max_vel, peak_score = row
            # Fetch most recent status for this hashtag
            latest_status_stmt = (
                select(XHashtagTrend.trend_status)
                .where(XHashtagTrend.hashtag == tag)
                .order_by(XHashtagTrend.time_period.desc())
                .limit(1)
            )
            latest_status = self.session.scalar(latest_status_stmt) or "Stable"

            growth_pct = round(float(avg_growth or 0.0) * 100, 1)
            growth_str = f"+{growth_pct}%" if growth_pct >= 0 else f"{growth_pct}%"
            vel_val = round(float(max_vel or 0.0), 1)
            vel_str = f"+{int(vel_val):,}/hr" if vel_val >= 0 else f"{int(vel_val):,}/hr"

            items.append({
                "tag": tag if tag.startswith("#") else f"#{tag}",
                "hashtag": tag,
                "growth": growth_str,
                "growth_rate": round(float(avg_growth or 0.0), 4),
                "mentions": f"{int(total_posts or 0):,}",
                "post_count": int(total_posts or 0),
                "unique_users": int(max_users or 0),
                "status": latest_status,
                "velocity": vel_str,
                "trend_velocity": vel_val,
                "score": round(float(peak_score or 0.0), 1),
                "trend_score": round(float(peak_score or 0.0), 2),
            })

        return items

    def get_hashtag_detail(
        self,
        hashtag: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict[str, Any] | None:
        """
        Query detailed metrics and time-series for a specific hashtag.
        """
        from sqlalchemy import func

        # Normalize lookup (strip leading # for query if needed)
        norm_tag = hashtag.strip()
        tags_to_query = [norm_tag, norm_tag.lstrip("#"), f"#{norm_tag.lstrip('#')}"]

        base_filter = [XHashtagTrend.hashtag.in_(tags_to_query)]
        if start_date:
            base_filter.append(XHashtagTrend.time_period >= start_date)
        if end_date:
            base_filter.append(XHashtagTrend.time_period <= end_date)

        summary_stmt = select(
            func.sum(XHashtagTrend.post_count).label("total_posts"),
            func.max(XHashtagTrend.unique_users).label("max_unique_users"),
            func.avg(XHashtagTrend.growth_rate).label("avg_growth"),
            func.max(XHashtagTrend.trend_velocity).label("max_velocity"),
            func.max(XHashtagTrend.trend_score).label("peak_score"),
        ).where(*base_filter)

        summary_row = self.session.execute(summary_stmt).one_or_none()
        if not summary_row or summary_row[0] is None:
            return None

        total_posts, max_users, avg_growth, max_vel, peak_score = summary_row

        # Time series points
        ts_stmt = select(
            XHashtagTrend.time_period,
            XHashtagTrend.post_count,
            XHashtagTrend.growth_rate,
            XHashtagTrend.trend_velocity,
            XHashtagTrend.trend_score,
            XHashtagTrend.trend_status,
        ).where(*base_filter).order_by(XHashtagTrend.time_period.asc())

        ts_rows = self.session.execute(ts_stmt).all()
        time_series: list[dict[str, Any]] = []
        latest_status = "Stable"

        for r in ts_rows:
            period_dt, cnt, growth, vel, score, status = r
            latest_status = status or latest_status
            time_series.append({
                "time": period_dt.isoformat() if hasattr(period_dt, "isoformat") else str(period_dt),
                "time_period": period_dt.isoformat() if hasattr(period_dt, "isoformat") else str(period_dt),
                "post_count": int(cnt or 0),
                "growth_rate": round(float(growth or 0.0), 4),
                "trend_velocity": round(float(vel or 0.0), 2),
                "trend_score": round(float(score or 0.0), 2),
                "trend_status": status,
            })

        display_tag = hashtag if hashtag.startswith("#") else f"#{hashtag}"
        return {
            "hashtag": display_tag,
            "tag": display_tag,
            "post_count": int(total_posts or 0),
            "unique_users": int(max_users or 0),
            "growth_rate": round(float(avg_growth or 0.0), 4),
            "trend_velocity": round(float(max_vel or 0.0), 2),
            "trend_score": round(float(peak_score or 0.0), 2),
            "trend_status": latest_status,
            "time_series": time_series,
        }