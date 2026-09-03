from datetime import datetime, timezone
from pathlib import Path
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import Base, _engine_kwargs, create_db_and_tables
from app.db.models import XPipelineRun, XPost
from app.db.repository import XPipelineRunRepository, XPostRepository
from app.services.ingestion_service import (
    DEFAULT_X_DATASET_PATH,
    get_ingestion_watermark,
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


def test_m1_case_a_empty_database_state(db_session):
    """Test A: Empty database/state returns the records available for the first window."""
    watermark = get_ingestion_watermark(db_session, platform="x")
    assert watermark.last_ingested_timestamp is None
    assert watermark.last_ingested_post_id is None
    assert watermark.last_successful_cycle_id is None

    batch_df, selected_watermark, win_idx = select_new_x_records(
        file_path=DEFAULT_X_DATASET_PATH,
        session=db_session,
        batch_size=100,
    )

    assert len(batch_df) == 100
    assert "post_id" in batch_df.columns
    assert "timestamp" in batch_df.columns
    assert selected_watermark.last_ingested_timestamp is None


def test_m1_case_b_existing_successful_ingestion_watermark(db_session):
    """Test B: Existing successful ingestion watermark returns only records strictly after that watermark."""
    # Run first cycle of 50 records
    result1 = run_x_ingestion_cycle(db_session, file_path=DEFAULT_X_DATASET_PATH, processing_batch_size=50)
    assert result1["status"] == "completed"

    watermark = get_ingestion_watermark(db_session, platform="x")
    assert watermark.last_ingested_timestamp is not None
    assert watermark.last_ingested_post_id is not None
    assert watermark.last_successful_cycle_id == result1["cycle_id"]

    # Select next 50 records
    batch2_df, watermark2, win_idx2 = select_new_x_records(
        file_path=DEFAULT_X_DATASET_PATH,
        session=db_session,
        batch_size=50,
    )

    assert len(batch2_df) == 50
    last_ts = watermark.last_ingested_timestamp
    if last_ts.tzinfo is None:
        last_ts = last_ts.replace(tzinfo=timezone.utc)

    # Every record in batch2 must be after the watermark
    for _, row in batch2_df.iterrows():
        row_ts = row["timestamp"]
        if row_ts.tzinfo is None:
            row_ts = row_ts.replace(tzinfo=timezone.utc)
        assert (row_ts > last_ts) or (
            row_ts == last_ts and row["post_id"] > watermark.last_ingested_post_id
        )


def test_m1_case_c_second_ingestion_cycle_no_duplicate_selection(db_session):
    """Test C: Second ingestion cycle ensures previously ingested records are never selected or returned again."""
    res1 = run_x_ingestion_cycle(db_session, file_path=DEFAULT_X_DATASET_PATH, window_index=1)
    assert res1["records_ingested"] > 0

    first_cycle_post_ids = set(p.post_id for p in db_session.query(XPost).all())
    count1 = len(first_cycle_post_ids)
    assert count1 == res1["records_ingested"]

    res2 = run_x_ingestion_cycle(db_session, file_path=DEFAULT_X_DATASET_PATH, window_index=2)
    assert res2["records_ingested"] > 0

    all_posts = db_session.query(XPost).all()
    assert len(all_posts) == count1 + res2["records_ingested"]
    all_post_ids = set(p.post_id for p in all_posts)
    assert len(all_post_ids) == len(all_posts)  # Zero overlap, distinct post IDs


def test_m1_case_d_failed_ingestion_cycle_does_not_advance_watermark(db_session):
    """Test D: Failed ingestion cycle does NOT advance the watermark."""
    # First successful run of Window 1
    res1 = run_x_ingestion_cycle(db_session, file_path=DEFAULT_X_DATASET_PATH, window_index=1)
    watermark_before = get_ingestion_watermark(db_session, platform="x")
    assert watermark_before.last_successful_cycle_id == res1["cycle_id"]

    # Record a failed pipeline run (e.g. simulated failure)
    pipeline_repo = XPipelineRunRepository(db_session)
    failed_cycle_id = "cycle-failed-test-123"
    pipeline_repo.create_run(
        ingestion_cycle_id=failed_cycle_id,
        platform="x",
        source="x_dataset_synthetic_15000.csv",
        scheduled_time=datetime.now(timezone.utc),
        records_available=30,
        status="started",
    )
    pipeline_repo.fail_run(
        ingestion_cycle_id=failed_cycle_id,
        error_message="Simulated connection timeout during batch processing",
        records_failed=30,
    )

    # Watermark must remain at the last successful cycle (res1)
    watermark_after = get_ingestion_watermark(db_session, platform="x")
    assert watermark_after.last_successful_cycle_id == res1["cycle_id"]
    assert watermark_after.last_ingested_timestamp == watermark_before.last_ingested_timestamp
    assert watermark_after.last_ingested_post_id == watermark_before.last_ingested_post_id

    # The selector will re-select the exact same batch that would follow res1
    next_batch_df, _, _ = select_new_x_records(
        file_path=DEFAULT_X_DATASET_PATH,
        session=db_session,
        window_index=2,
    )
    assert len(next_batch_df) > 0


def test_m1_case_e_duplicate_post_id_uniqueness_protection(db_session):
    """Test E: Duplicate post_id remains protected by the database uniqueness constraint."""
    post_repo = XPostRepository(db_session)
    initial_post = {
        "post_id": "test_unique_id_999",
        "user_id": "user1",
        "username": "tester",
        "text": "First post",
        "timestamp": datetime(2026, 1, 1, tzinfo=timezone.utc),
        "is_synthetic": True,
    }
    post_repo.add(**initial_post)

    duplicate_post = {
        "post_id": "test_unique_id_999",
        "user_id": "user2",
        "username": "tester2",
        "text": "Duplicate post payload",
        "timestamp": datetime(2026, 1, 2, tzinfo=timezone.utc),
        "is_synthetic": True,
    }
    with pytest.raises(IntegrityError):
        post_repo.add(**duplicate_post)
