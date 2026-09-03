from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import logging
from pathlib import Path
from typing import Any, Callable, Sequence
import uuid

import pandas as pd
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import SessionLocal
from app.db.repository import XPipelineRunRepository, XPostRepository
from app.preprocessing.common import (
    clean_text_series,
    ensure_required_columns,
    normalize_columns,
    normalize_timestamp_series,
)
from app.preprocessing.x import REQUIRED_COLUMNS
from app.services.emotion_service import rollup_emotions_from_posts
from app.services.hashtag_service import update_hashtag_trends_from_posts
from app.services.ml_service import analyze_batch
from app.services.network_persist_service import update_network_from_posts
from app.services.sentiment_service import rollup_sentiment_from_posts

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_X_DATASET_PATH = PROJECT_ROOT / "data" / "x" / "x_dataset_synthetic_15000.csv"

# Global in-process lock to prevent overlapping ingestion cycles
_cycle_lock = asyncio.Lock()
_is_cycle_running = False

# Authoritative in-memory state tracking for API & notification delivery
_state: dict[str, Any] = {
    "status": "operational",
    "last_ingestion": None,
    "next_refresh": None,
    "analytics_updated": None,
    "new_analysis_ready": False,
    "current_cycle_id": None,
    "last_completed_cycle": None,
    "new_records_processed": 0,
    "total_records_processed": 0,
    "logical_window_index": 0,
    "platform_records": {},
    "error": None,
}


@dataclass
class IngestionWatermark:
    """Explicit state tracking for incremental ingestion cycles."""
    last_ingested_timestamp: datetime | None
    last_ingested_post_id: str | None
    current_cycle_id: str
    last_successful_cycle_id: str | None = None


class TimeReplayMapper:
    """
    Deterministic time-compression mapper for demo replay.
    Maps the source dataset's timestamp span onto a configurable logical timeline.
    """

    def __init__(
        self,
        min_timestamp: datetime,
        max_timestamp: datetime,
        total_duration_minutes: float = 45.0,
        interval_minutes: float = 15.0,
    ):
        self.min_timestamp = (
            min_timestamp if min_timestamp.tzinfo is not None else min_timestamp.replace(tzinfo=timezone.utc)
        )
        self.max_timestamp = (
            max_timestamp if max_timestamp.tzinfo is not None else max_timestamp.replace(tzinfo=timezone.utc)
        )
        self.total_duration_minutes = max(float(total_duration_minutes), 1.0)
        self.interval_minutes = max(float(interval_minutes), 1.0)
        self.total_source_seconds = max((self.max_timestamp - self.min_timestamp).total_seconds(), 1.0)

    @classmethod
    def from_dataframe(
        cls,
        df: pd.DataFrame,
        total_duration_minutes: float = 45.0,
        interval_minutes: float = 15.0,
    ) -> TimeReplayMapper:
        """Construct mapper by finding min and max timestamps in the dataset."""
        valid_ts = df["timestamp"].dropna()
        if valid_ts.empty:
            now = datetime.now(timezone.utc)
            return cls(now, now + timedelta(days=365), total_duration_minutes, interval_minutes)
        min_ts = valid_ts.min().to_pydatetime()
        max_ts = valid_ts.max().to_pydatetime()
        return cls(min_ts, max_ts, total_duration_minutes, interval_minutes)

    def get_source_cutoff_for_window(self, window_index: int) -> datetime:
        """Returns the source timestamp cutoff corresponding to logical window index N (1-based)."""
        fraction = min((window_index * self.interval_minutes) / self.total_duration_minutes, 1.0)
        cutoff_seconds = fraction * self.total_source_seconds
        return self.min_timestamp + timedelta(seconds=cutoff_seconds)

    def get_logical_minute_for_timestamp(self, ts: datetime) -> float:
        """Maps any source timestamp to its logical elapsed minute in demo replay."""
        ts_utc = ts if ts.tzinfo is not None else ts.replace(tzinfo=timezone.utc)
        elapsed_sec = (ts_utc - self.min_timestamp).total_seconds()
        fraction = min(max(elapsed_sec / self.total_source_seconds, 0.0), 1.0)
        return fraction * self.total_duration_minutes


def default_ml_enrichment_interface(posts_batch: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Explicit integration interface for backend-callable ML/NLP models (Sentiment, Emotion, Topics).
    In M2/M3, the ML models enrich these dicts with NLP inferences before MySQL persistence.
    """
    return posts_batch


def get_ingestion_watermark(session: Session, platform: str = "x") -> IngestionWatermark:
    """
    Determines the current ingestion watermark.
    Only the LAST SUCCESSFUL ingestion cycle advances the watermark.
    Failed or incomplete pipeline runs do not advance the watermark.
    """
    pipeline_repo = XPipelineRunRepository(session)
    post_repo = XPostRepository(session)

    last_run = pipeline_repo.get_last_successful_run(platform=platform)
    current_cycle_id = (
        f"cycle-{platform}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    )

    if last_run is None:
        return IngestionWatermark(
            last_ingested_timestamp=None,
            last_ingested_post_id=None,
            current_cycle_id=current_cycle_id,
            last_successful_cycle_id=None,
        )

    latest_post = post_repo.get_latest_post()
    last_ts = latest_post.timestamp if latest_post else None
    last_post_id = latest_post.post_id if latest_post else None

    return IngestionWatermark(
        last_ingested_timestamp=last_ts,
        last_ingested_post_id=last_post_id,
        current_cycle_id=current_cycle_id,
        last_successful_cycle_id=last_run.ingestion_cycle_id,
    )


def select_new_x_records(
    file_path: str | Path | None = None,
    session: Session | None = None,
    window_index: int | None = None,
    current_cycle_id: str | None = None,
    demo_mode: bool | None = None,
    batch_size: int | None = None,  # Kept for backward-compatibility if caller provides limit
) -> tuple[pd.DataFrame, IngestionWatermark, int]:
    """
    Reads the Phase 1 dataset, checks the database watermark, and selects newly available records
    belonging to the current logical 15-minute window.
    """
    target_path = Path(file_path) if file_path else DEFAULT_X_DATASET_PATH
    if not target_path.exists():
        raise FileNotFoundError(f"X dataset not found at {target_path}")

    is_demo = demo_mode if demo_mode is not None else settings.demo_mode
    close_session = False
    if session is None:
        session = SessionLocal()
        close_session = True

    try:
        pipeline_repo = XPipelineRunRepository(session)
        watermark = get_ingestion_watermark(session, platform="x")
        if current_cycle_id:
            watermark.current_cycle_id = current_cycle_id

        # Determine logical window index if not explicitly supplied
        effective_window_index = window_index
        if effective_window_index is None:
            completed_count = pipeline_repo.count_completed_runs(platform="x")
            effective_window_index = completed_count + 1

        # 1. Load and normalize dataset
        raw_df = pd.read_csv(target_path, dtype=str, keep_default_na=True)
        df = normalize_columns(raw_df)
        ensure_required_columns(df, REQUIRED_COLUMNS)

        # 2. Clean text, identifiers, and timestamps
        df["text"] = clean_text_series(df["text"])
        df["post_id"] = clean_text_series(df["post_id"])
        df["username"] = clean_text_series(df["username"])
        df["user_id"] = clean_text_series(df["user_id"])
        df["timestamp"] = normalize_timestamp_series(df["timestamp"])

        # Drop invalid rows and deduplicate within source batch
        df = df.dropna(subset=["post_id", "text", "timestamp"]).copy()
        df = df.drop_duplicates(subset=["post_id"]).copy()

        # Sort chronologically: timestamp ASC, post_id ASC
        df = df.sort_values(
            by=["timestamp", "post_id"], ascending=[True, True], kind="mergesort"
        ).reset_index(drop=True)

        # 3. Apply Demo Logical Window Cutoff if in demo mode
        if is_demo and not df.empty:
            mapper = TimeReplayMapper.from_dataframe(
                df,
                total_duration_minutes=settings.demo_total_duration_minutes,
                interval_minutes=settings.ingestion_interval_minutes,
            )
            cutoff_ts = mapper.get_source_cutoff_for_window(effective_window_index)
            cutoff_ts_pd = pd.to_datetime(cutoff_ts, utc=True)
            df = df[df["timestamp"] <= cutoff_ts_pd].copy().reset_index(drop=True)

        # 4. Watermark filtering (strictly after last ingested timestamp & post_id)
        if watermark.last_ingested_timestamp is not None:
            last_ts = watermark.last_ingested_timestamp
            if last_ts.tzinfo is None:
                last_ts = last_ts.replace(tzinfo=timezone.utc)
            last_ts_pd = pd.to_datetime(last_ts, utc=True)
            last_pid = watermark.last_ingested_post_id or ""

            mask = (df["timestamp"] > last_ts_pd) | (
                (df["timestamp"] == last_ts_pd) & (df["post_id"] > last_pid)
            )
            df = df[mask].copy().reset_index(drop=True)

        # 5. Anti-duplicate verification against MySQL existing posts
        if not df.empty:
            candidate_ids: Sequence[str] = df["post_id"].tolist()
            post_repo = XPostRepository(session)
            existing_ids: set[str] = set()
            chunk_size = 1000
            for i in range(0, len(candidate_ids), chunk_size):
                chunk = candidate_ids[i:i + chunk_size]
                existing_ids.update(post_repo.get_existing_post_ids(chunk))

            if existing_ids:
                df = df[~df["post_id"].isin(existing_ids)].copy().reset_index(drop=True)

        # Optional legacy batch_size windowing if explicitly requested
        if batch_size is not None and batch_size > 0:
            df = df.iloc[:batch_size].copy().reset_index(drop=True)

        return df, watermark, effective_window_index
    finally:
        if close_session:
            session.close()


def _row_to_x_post_dict(row: pd.Series, dataset_source: str = "x_dataset_synthetic_15000.csv") -> dict[str, Any]:
    """Helper to convert a preprocessed DataFrame row into an XPost model dictionary."""
    def _parse_list(val: Any) -> list[str] | None:
        if pd.isna(val) or val is None or val == "":
            return None
        if isinstance(val, list):
            return val
        s = str(val).strip()
        if not s:
            return None
        sep = ";" if ";" in s else ("," if "," in s else None)
        if sep:
            return [x.strip() for x in s.split(sep) if x.strip()]
        return [s]

    def _parse_int(val: Any, default: int = 0) -> int:
        if pd.isna(val) or val is None or val == "":
            return default
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return default

    def _parse_bool(val: Any) -> bool | None:
        if pd.isna(val) or val is None or val == "":
            return None
        if isinstance(val, bool):
            return val
        s = str(val).strip().lower()
        if s in ("true", "1", "yes", "t"):
            return True
        if s in ("false", "0", "no", "f"):
            return False
        return None

    def _parse_str(val: Any) -> str | None:
        if pd.isna(val) or val is None:
            return None
        s = str(val).strip()
        return s if s and s.lower() != "nan" else None

    ts = row.get("timestamp")
    if isinstance(ts, str):
        ts = pd.to_datetime(ts, utc=True).to_pydatetime()
    elif hasattr(ts, "to_pydatetime"):
        ts = ts.to_pydatetime()

    return {
        "post_id": str(row["post_id"]).strip(),
        "user_id": str(row.get("user_id", "")).strip() or "unknown",
        "username": str(row.get("username", "")).strip() or "unknown",
        "text": str(row["text"]).strip(),
        "timestamp": ts,
        "hashtags": _parse_list(row.get("hashtags")),
        "mentions": _parse_list(row.get("mentions")),
        "like_count": _parse_int(row.get("like_count", row.get("likes"))),
        "reply_count": _parse_int(row.get("reply_count", row.get("replies"))),
        "retweet_count": _parse_int(row.get("retweet_count", row.get("retweets"))),
        "quote_count": _parse_int(row.get("quote_count")),
        "bookmark_count": _parse_int(row.get("bookmark_count")),
        "impressions": _parse_int(row.get("impressions")),
        "followers_count": _parse_int(row.get("followers_count")),
        "following_count": _parse_int(row.get("following_count")),
        "verified": _parse_bool(row.get("verified")),
        "bio": _parse_str(row.get("bio")),
        "location": _parse_str(row.get("location")),
        "language": _parse_str(row.get("language")),
        "is_reply": bool(_parse_bool(row.get("is_reply")) or False),
        "in_reply_to_user_id": _parse_str(row.get("in_reply_to_user_id")),
        "referenced_tweet_id": _parse_str(row.get("referenced_tweet_id")),
        "referenced_tweet_type": _parse_str(row.get("referenced_tweet_type")),
        "gender": _parse_str(row.get("gender")),
        "age_group": _parse_str(row.get("age_group")),
        "region": _parse_str(row.get("region")),
        "demographic_source": _parse_str(row.get("demographic_source")),
        "dataset_source": dataset_source,
        "is_synthetic": True,
        "sentiment": _parse_str(row.get("sentiment")),
        "sentiment_confidence": float(row["sentiment_confidence"]) if pd.notna(row.get("sentiment_confidence")) else None,
        "emotion": _parse_str(row.get("emotion")),
        "emotion_confidence": float(row["emotion_confidence"]) if pd.notna(row.get("emotion_confidence")) else None,
        "emotion_source": _parse_str(row.get("emotion_source")),
        "topic": _parse_str(row.get("topic")),
        "topic_probability": float(row["topic_probability"]) if pd.notna(row.get("topic_probability")) else None,
    }


def run_x_ingestion_cycle(
    session: Session,
    file_path: str | Path | None = None,
    window_index: int | None = None,
    processing_batch_size: int | None = None,
    ml_enrichment_fn: Callable[[list[dict[str, Any]]], list[dict[str, Any]]] | None = None,
) -> dict[str, Any]:
    """
    Executes a single transactional logical 15-minute ingestion cycle.
    If the logical window contains more records than processing_batch_size (e.g. 5,000),
    it is processed internally across multiple sub-batches under the SAME single XPipelineRun.
    """
    global _is_cycle_running
    if _is_cycle_running:
        logger.warning("An ingestion cycle is already currently running. Skipping overlapping trigger.")
        return {
            "status": "skipped",
            "message": "Ingestion cycle already in progress",
            "records_ingested": 0,
        }

    _is_cycle_running = True
    pipeline_repo = XPipelineRunRepository(session)
    post_repo = XPostRepository(session)

    target_path = Path(file_path) if file_path else DEFAULT_X_DATASET_PATH
    source_name = target_path.name
    now_utc = datetime.now(timezone.utc)
    effective_sub_batch_size = processing_batch_size or settings.processing_batch_size
    enricher = ml_enrichment_fn or analyze_batch

    try:
        # 1. Select all newly available records for this logical window
        new_df, watermark, win_idx = select_new_x_records(
            file_path=target_path,
            session=session,
            window_index=window_index,
        )
        cycle_id = watermark.current_cycle_id
        records_count = len(new_df)

        # 2. Record run start in XPipelineRun (one cycle per logical window)
        pipeline_repo.create_run(
            ingestion_cycle_id=cycle_id,
            platform="x",
            source=source_name,
            scheduled_time=now_utc,
            records_available=records_count,
            status="started",
        )

        _state.update(
            status="processing",
            current_cycle_id=cycle_id,
            logical_window_index=win_idx,
            error=None,
        )

        # 3. Handle empty logical window cleanly
        if records_count == 0:
            pipeline_repo.complete_run(
                ingestion_cycle_id=cycle_id,
                records_ingested=0,
                records_processed=0,
                records_failed=0,
            )
            _state.update(
                status="completed",
                last_ingestion=now_utc,
                last_completed_cycle=cycle_id,
                new_records_processed=0,
                # Do not trigger a new notification if zero new records were analyzed
                new_analysis_ready=False,
            )
            return {
                "cycle_id": cycle_id,
                "window_index": win_idx,
                "status": "completed",
                "records_ingested": 0,
                "sub_batches_count": 0,
                "message": "Empty logical window completed with 0 records.",
            }

        # 4. ML/NLP Enrichment across the complete logical cycle corpus
        posts_data = [_row_to_x_post_dict(row, dataset_source=source_name) for _, row in new_df.iterrows()]
        logger.info("Running ML enrichment on %d records for cycle %s...", len(posts_data), cycle_id)
        enriched_posts = enricher(posts_data)

        # 5. Internal Sub-Batching Persistence into x_posts
        sub_batches_count = 0
        for start_idx in range(0, records_count, effective_sub_batch_size):
            sub_batch = enriched_posts[start_idx : start_idx + effective_sub_batch_size]
            post_repo.add_all(sub_batch)
            sub_batches_count += 1
            logger.debug(
                "Persisted sub-batch %d (%d records) for cycle %s",
                sub_batches_count,
                len(sub_batch),
                cycle_id,
            )

        # 6. Post-ingestion Analytics Updates (derived strictly from data, zero ML rerun)
        logger.info("Updating hashtag trends, sentiment rollups, emotion rollups, and network topology...")
        update_hashtag_trends_from_posts(session, enriched_posts)
        rollup_sentiment_from_posts(session)
        rollup_emotions_from_posts(session)
        update_network_from_posts(session, cycle_id=cycle_id)

        # 7. Finalize and mark single cycle as completed
        pipeline_repo.complete_run(
            ingestion_cycle_id=cycle_id,
            records_ingested=records_count,
            records_processed=records_count,
            records_failed=0,
        )

        completed_at = datetime.now(timezone.utc)
        current_total = _state.get("total_records_processed", 0) + records_count

        _state.update(
            status="completed",
            last_ingestion=completed_at,
            analytics_updated=completed_at,
            new_analysis_ready=True,  # Signals frontend that NEW analysis is ready to view
            last_completed_cycle=cycle_id,
            new_records_processed=records_count,
            total_records_processed=current_total,
            logical_window_index=win_idx,
            platform_records={"X": current_total},
            error=None,
        )

        logger.info(
            "Ingestion cycle %s (Window %d) completed: %d records across %d sub-batches",
            cycle_id,
            win_idx,
            records_count,
            sub_batches_count,
        )

        return {
            "cycle_id": cycle_id,
            "window_index": win_idx,
            "status": "completed",
            "records_ingested": records_count,
            "sub_batches_count": sub_batches_count,
            "watermark_timestamp": posts_data[-1]["timestamp"].isoformat() if posts_data[-1]["timestamp"] else None,
            "watermark_post_id": posts_data[-1]["post_id"],
        }
    except Exception as exc:
        logger.exception("Ingestion cycle failed")
        session.rollback()
        if "cycle_id" in locals():
            try:
                pipeline_repo.fail_run(
                    ingestion_cycle_id=cycle_id,
                    error_message=str(exc),
                    records_failed=records_count if "records_count" in locals() else 0,
                )
            except Exception as fail_err:
                logger.exception("Failed to record failure in XPipelineRun: %s", fail_err)

        _state.update(
            status="error",
            error=str(exc),
            new_analysis_ready=False,
        )
        raise
    finally:
        _is_cycle_running = False


def get_ingestion_state() -> dict[str, Any]:
    """Return a copy of the latest scheduler & notification state for API responses."""
    return {**_state, "platform_records": dict(_state.get("platform_records", {}))}


def acknowledge_dashboard_refresh() -> None:
    """Invoked when user clicks 'Refresh Dashboard' to consume the new analysis state."""
    _state["new_analysis_ready"] = False


def refresh_now() -> None:
    """Execute a scheduled ingestion cycle and update scheduler state."""
    session = SessionLocal()
    try:
        result = run_x_ingestion_cycle(session)
        completed_at = datetime.now(timezone.utc)
        tick_interval = settings.effective_tick_interval_seconds
        _state.update(
            next_refresh=completed_at + timedelta(seconds=tick_interval),
        )
    except Exception as exc:
        _state["error"] = str(exc)
        logger.exception("Scheduled ingestion cycle failed")
    finally:
        session.close()


async def run_ingestion_worker(stop_event: asyncio.Event) -> None:
    """
    Background continuous scheduler loop running on the configured tick interval.
    Stops cleanly when FastAPI lifespan triggers stop_event.
    """
    logger.info(
        "Ingestion worker scheduler started (Demo Mode=%s, Tick Interval=%ds, Logical Window=%dm)",
        settings.demo_mode,
        settings.effective_tick_interval_seconds,
        settings.ingestion_interval_minutes,
    )
    while not stop_event.is_set():
        try:
            tick_interval = settings.effective_tick_interval_seconds
            await asyncio.wait_for(stop_event.wait(), timeout=tick_interval)
        except asyncio.TimeoutError:
            try:
                await asyncio.to_thread(refresh_now)
            except Exception as e:
                logger.exception("Error during scheduled worker tick: %s", e)
                continue
    logger.info("Ingestion worker scheduler stopped cleanly.")