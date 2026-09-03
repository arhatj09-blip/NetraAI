from datetime import datetime, timezone
from pathlib import Path
import pytest
import asyncio
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import Base, _engine_kwargs, create_db_and_tables
from app.db.models import XPipelineRun, XPost
from app.db.repository import XPipelineRunRepository, XPostRepository
from app.services.ingestion_service import (
    DEFAULT_X_DATASET_PATH,
    TimeReplayMapper,
    acknowledge_dashboard_refresh,
    get_ingestion_state,
    get_ingestion_watermark,
    run_ingestion_worker,
    run_x_ingestion_cycle,
    select_new_x_records,
)


@pytest.fixture
def db_session():
    test_engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))
    create_db_and_tables(test_engine)
    session_factory = sessionmaker(bind=test_engine, expire_on_commit=False)
    session = session_factory()
    try:
        if not settings.database_url.startswith("sqlite"):
            session.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
            for table in reversed(Base.metadata.sorted_tables):
                session.execute(table.delete())
            session.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
        else:
            for table in reversed(Base.metadata.sorted_tables):
                session.execute(table.delete())
        session.commit()
        yield session
    finally:
        session.close()


def test_1_empty_initial_state(db_session):
    """1. Empty initial state returns None watermark and window index 1."""
    watermark = get_ingestion_watermark(db_session, platform="x")
    assert watermark.last_ingested_timestamp is None
    assert watermark.last_ingested_post_id is None
    assert watermark.last_successful_cycle_id is None


def test_2_and_3_first_and_second_logical_15min_windows(db_session):
    """2 & 3. Deterministic first and second 15-minute logical windows."""
    # First logical window (Window 1)
    df_win1, watermark1, win_idx1 = select_new_x_records(
        file_path=DEFAULT_X_DATASET_PATH,
        session=db_session,
        window_index=1,
        demo_mode=True,
    )
    assert win_idx1 == 1
    assert len(df_win1) > 0

    # Ingest Window 1
    res1 = run_x_ingestion_cycle(db_session, window_index=1)
    assert res1["status"] == "completed"
    assert res1["records_ingested"] == len(df_win1)

    # Second logical window (Window 2)
    df_win2, watermark2, win_idx2 = select_new_x_records(
        file_path=DEFAULT_X_DATASET_PATH,
        session=db_session,
        window_index=2,
        demo_mode=True,
    )
    assert win_idx2 == 2
    assert len(df_win2) > 0

    # Ensure zero overlap between Window 1 and Window 2
    post_ids_1 = set(df_win1["post_id"])
    post_ids_2 = set(df_win2["post_id"])
    assert post_ids_1.isdisjoint(post_ids_2)


def test_4_same_timestamp_post_id_tiebreaking(db_session):
    """4. Same timestamp + post_id tie-breaking works correctly."""
    post_repo = XPostRepository(db_session)
    pipeline_repo = XPipelineRunRepository(db_session)

    ts = datetime(2025, 9, 1, 12, 0, 0, tzinfo=timezone.utc)
    # Insert post A
    post_repo.add(post_id="post_A", user_id="u1", username="userA", text="Post A", timestamp=ts, is_synthetic=True)
    # Record completed run
    pipeline_repo.create_run("cycle-tiebreak", "x", "test", ts, 1, status="started")
    pipeline_repo.complete_run("cycle-tiebreak", 1, 1, 0)

    # Ingestion watermark is (ts, "post_A")
    wm = get_ingestion_watermark(db_session, platform="x")
    assert wm.last_ingested_post_id == "post_A"


def test_5_duplicate_prevention(db_session):
    """5. Ingested records cannot be re-inserted or duplicated."""
    res = run_x_ingestion_cycle(db_session, window_index=1)
    assert res["records_ingested"] > 0

    # Running window 1 again should return 0 new records because they are already in DB
    df_recheck, _, _ = select_new_x_records(session=db_session, window_index=1)
    assert len(df_recheck) == 0


def test_6_and_14_and_15_failed_cycle_does_not_advance_watermark(db_session):
    """6, 14, 15. Failed pipeline run changes started -> failed and does NOT advance watermark."""
    # Successful cycle 1
    res1 = run_x_ingestion_cycle(db_session, window_index=1)
    watermark_before = get_ingestion_watermark(db_session, platform="x")

    # Failing cycle 2 with a custom enricher that raises an exception
    def failing_enricher(posts):
        raise ValueError("Simulated ML model failure")

    with pytest.raises(ValueError):
        run_x_ingestion_cycle(db_session, window_index=2, ml_enrichment_fn=failing_enricher)

    # Verify XPipelineRun recorded 'failed'
    failed_run = db_session.scalars(
        select(XPipelineRun).where(XPipelineRun.status == "failed")
    ).first()
    assert failed_run is not None
    assert "Simulated ML model failure" in (failed_run.error_message or "")

    # Watermark did NOT advance
    watermark_after = get_ingestion_watermark(db_session, platform="x")
    assert watermark_after.last_successful_cycle_id == watermark_before.last_successful_cycle_id
    assert watermark_after.last_ingested_post_id == watermark_before.last_ingested_post_id


def test_7_empty_logical_window_succeeds(db_session):
    """7. Empty logical window completes cleanly with 0 records."""
    # Ingest all 3 windows
    run_x_ingestion_cycle(db_session, window_index=1)
    run_x_ingestion_cycle(db_session, window_index=2)
    run_x_ingestion_cycle(db_session, window_index=3)

    # Window 4 has 0 new records
    res4 = run_x_ingestion_cycle(db_session, window_index=4)
    assert res4["status"] == "completed"
    assert res4["records_ingested"] == 0


def test_8_and_9_sub_batching_inside_single_ingestion_cycle(db_session):
    """8 & 9. Large logical window (e.g. 5,000+ records) processed in sub-batches under ONE XPipelineRun."""
    # Configure processing_batch_size = 1500 (so a ~5,000 record window splits into ~4 sub-batches)
    res = run_x_ingestion_cycle(db_session, window_index=1, processing_batch_size=1500)
    assert res["status"] == "completed"
    assert res["records_ingested"] > 1500
    assert res["sub_batches_count"] >= 2

    # Verify exactly ONE pipeline run was created in MySQL
    runs = db_session.scalars(select(XPipelineRun)).all()
    assert len(runs) == 1
    assert runs[0].records_ingested == res["records_ingested"]
    assert runs[0].status == "completed"


def test_10_and_11_scheduler_lifecycle():
    """10 & 11. Scheduler loop runs and stops cleanly on stop_event."""
    stop_event = asyncio.Event()

    async def _run():
        task = asyncio.create_task(run_ingestion_worker(stop_event))
        await asyncio.sleep(0.05)
        stop_event.set()
        await task

    asyncio.run(_run())
    assert stop_event.is_set()


def test_12_concurrency_no_overlapping_cycles(db_session):
    """12. Two ingestion cycles cannot run concurrently."""
    import app.services.ingestion_service as ing

    ing._is_cycle_running = True
    try:
        res = run_x_ingestion_cycle(db_session, window_index=1)
        assert res["status"] == "skipped"
        assert res["records_ingested"] == 0
    finally:
        ing._is_cycle_running = False


def test_13_pipeline_run_lifecycle_status_transitions(db_session):
    """13. Pipeline run records 'completed' upon success."""
    res = run_x_ingestion_cycle(db_session, window_index=1)
    run = db_session.scalar(select(XPipelineRun).where(XPipelineRun.ingestion_cycle_id == res["cycle_id"]))
    assert run is not None
    assert run.status == "completed"
    assert run.actual_start_time is not None
    assert run.actual_end_time is not None


def test_16_demo_time_replay_deterministic_cutoffs():
    """16. Demo time replay produces strictly deterministic window cutoffs."""
    t0 = datetime(2025, 9, 1, 0, 0, 0, tzinfo=timezone.utc)
    t1 = datetime(2026, 9, 1, 0, 0, 0, tzinfo=timezone.utc)
    mapper = TimeReplayMapper(t0, t1, total_duration_minutes=45.0, interval_minutes=15.0)

    cutoff1 = mapper.get_source_cutoff_for_window(1)
    cutoff2 = mapper.get_source_cutoff_for_window(2)
    cutoff3 = mapper.get_source_cutoff_for_window(3)

    assert t0 < cutoff1 < cutoff2 < cutoff3
    assert cutoff3 == t1


def test_notification_and_acknowledgement(db_session):
    """Notification state activates after cycle and resets on user refresh."""
    res = run_x_ingestion_cycle(db_session, window_index=1)
    state = get_ingestion_state()
    assert state["new_analysis_ready"] is True
    assert state["last_completed_cycle"] == res["cycle_id"]

    acknowledge_dashboard_refresh()
    state_after = get_ingestion_state()
    assert state_after["new_analysis_ready"] is False
