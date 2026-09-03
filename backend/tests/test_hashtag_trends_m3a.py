import sys
from pathlib import Path
from datetime import datetime, timezone
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import Base, _engine_kwargs, create_db_and_tables
from app.db.models import XHashtagTrend, XPost
from app.db.repository import XHashtagTrendRepository, XPostRepository
from app.main import app
from app.services.hashtag_service import (
    backfill_hashtag_trends,
    compute_growth_rate,
    compute_trend_score,
    compute_trend_status,
    compute_trend_velocity,
    extract_and_calculate_trends,
    get_hashtag_intelligence,
    get_rising_hashtags,
    normalize_hashtag,
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


@pytest.fixture
def client():
    return TestClient(app)


def test_1_hashtag_normalization():
    """1. Normalization handles # prefixes, whitespace, casing consistently."""
    key1, disp1 = normalize_hashtag(" #AgentDev ")
    key2, disp2 = normalize_hashtag("agentdev")
    key3, disp3 = normalize_hashtag("AGENTDEV")

    assert key1 == "agentdev"
    assert key2 == "agentdev"
    assert key3 == "agentdev"
    assert disp1 == "#AgentDev"
    assert disp2 == "#agentdev"


def test_2_to_5_extraction_and_counts_manual_dataset():
    """2-5. Manual dataset verification for extraction, post count, unique users, previous period."""
    t0 = datetime(2026, 8, 1, 10, 15, 0, tzinfo=timezone.utc)
    t1 = datetime(2026, 8, 1, 11, 20, 0, tzinfo=timezone.utc)

    # Known test data:
    # Period 10:00: #AI posted by user1, user2
    # Period 11:00: #AI posted by user1, user2, user3, user4
    raw_posts = [
        (t0, "user1", ["#AI", "Tech"]),
        (t0, "user2", ["ai"]),
        (t1, "user1", ["#AI"]),
        (t1, "user2", ["#ai"]),
        (t1, "user3", ["AI"]),
        (t1, "user4", ["#AI"]),
    ]

    trends = extract_and_calculate_trends(raw_posts, period_hours=1)
    ai_trends = [r for r in trends if r["hashtag"] in ("#AI", "#ai")]
    assert len(ai_trends) == 2

    period_10 = next(r for r in ai_trends if r["time_period"].hour == 10)
    period_11 = next(r for r in ai_trends if r["time_period"].hour == 11)

    # Period 10 checks
    assert period_10["post_count"] == 2
    assert period_10["unique_users"] == 2
    assert period_10["previous_period_count"] == 0

    # Period 11 checks
    assert period_11["post_count"] == 4
    assert period_11["unique_users"] == 4
    assert period_11["previous_period_count"] == 2


def test_6_and_7_growth_rate_formulas():
    """6 & 7. Growth rate math and zero-baseline behavior."""
    # Previous count 10, current 15 -> (15 - 10) / 10 = +0.50 (+50%)
    assert compute_growth_rate(15, 10) == 0.5

    # Previous count 10, current 5 -> (5 - 10) / 10 = -0.50 (-50%)
    assert compute_growth_rate(5, 10) == -0.5

    # Zero previous count with positive current -> 1.0 (100% initial emergence)
    assert compute_growth_rate(5, 0) == 1.0

    # Zero both -> 0.0
    assert compute_growth_rate(0, 0) == 0.0


def test_8_to_10_trend_status_thresholds():
    """8, 9, 10. Status classification thresholds: Spiking, Rising, Stable, Declining."""
    # Growth >= 1.0 and count >= 5 -> Spiking
    assert compute_trend_status(1.5, 10) == "Spiking"

    # Growth 0.40 (> 0.20) -> Rising
    assert compute_trend_status(0.4, 4) == "Rising"

    # Growth 0.05 (between -0.2 and 0.2) -> Stable
    assert compute_trend_status(0.05, 10) == "Stable"

    # Growth -0.30 (< -0.20) -> Declining
    assert compute_trend_status(-0.3, 10) == "Declining"


def test_11_and_12_persistence_and_duplicate_prevention(db_session):
    """11 & 12. Upsert persists records and does not create duplicate (hashtag, time_period) rows."""
    repo = XHashtagTrendRepository(db_session)
    t = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)

    item1 = [{
        "hashtag": "#AgentDev",
        "time_period": t,
        "post_count": 10,
        "unique_users": 8,
        "previous_period_count": 5,
        "growth_rate": 1.0,
        "trend_velocity": 5.0,
        "trend_score": 15.2,
        "trend_status": "Spiking",
    }]

    repo.upsert_trends(item1)
    assert db_session.scalar(select(text("count(*) from x_hashtag_trends"))) == 1

    # Rerun upsert with updated count
    item2 = [{
        "hashtag": "#AgentDev",
        "time_period": t,
        "post_count": 15,
        "unique_users": 12,
        "previous_period_count": 5,
        "growth_rate": 2.0,
        "trend_velocity": 10.0,
        "trend_score": 22.5,
        "trend_status": "Spiking",
    }]
    repo.upsert_trends(item2)

    # Must still be exactly 1 row with updated values
    rows = db_session.scalars(select(XHashtagTrend)).all()
    assert len(rows) == 1
    assert rows[0].post_count == 15
    assert rows[0].unique_users == 12


def test_13_backfill_from_x_posts(db_session):
    """13. Backfill accurately extracts posts and generates trend records."""
    post_repo = XPostRepository(db_session)
    ts = datetime(2026, 8, 15, 14, 30, 0, tzinfo=timezone.utc)

    # Insert 5 test posts
    for i in range(5):
        post_repo.add(
            post_id=f"post_backfill_{i}",
            user_id=f"user_{i}",
            username=f"user_{i}",
            text=f"Testing hashtag trends #{i}",
            timestamp=ts,
            hashtags=["#LLMOps", "AI"],
            is_synthetic=True,
        )

    res = backfill_hashtag_trends(db_session, period_hours=1)
    assert res["status"] == "completed"
    assert res["posts_scanned"] == 5
    assert res["trend_records_upserted"] >= 2

    # Verify rows in DB
    trends = db_session.scalars(select(XHashtagTrend)).all()
    assert len(trends) >= 2


def test_14_date_filtering(db_session):
    """14. Date range filter retrieves only trends within the window."""
    repo = XHashtagTrendRepository(db_session)
    t_aug = datetime(2026, 8, 10, 12, 0, 0, tzinfo=timezone.utc)
    t_sep = datetime(2026, 9, 10, 12, 0, 0, tzinfo=timezone.utc)

    repo.upsert_trends([
        {
            "hashtag": "#AugTrend",
            "time_period": t_aug,
            "post_count": 100,
            "unique_users": 80,
            "previous_period_count": 20,
            "growth_rate": 4.0,
            "trend_velocity": 80.0,
            "trend_score": 95.0,
            "trend_status": "Spiking",
        },
        {
            "hashtag": "#SepTrend",
            "time_period": t_sep,
            "post_count": 200,
            "unique_users": 150,
            "previous_period_count": 50,
            "growth_rate": 3.0,
            "trend_velocity": 150.0,
            "trend_score": 120.0,
            "trend_status": "Spiking",
        },
    ])

    # Filter for August only
    aug_only = get_rising_hashtags(db_session, start_date="2026-08-01", end_date="2026-08-31")
    tags = [r["hashtag"] for r in aug_only]
    assert "#AugTrend" in tags
    assert "#SepTrend" not in tags


def test_15_api_x_hashtags_endpoint(db_session, client):
    """15. GET /api/x/hashtags returns valid JSON list matching frontend contracts."""
    repo = XHashtagTrendRepository(db_session)
    t = datetime(2026, 8, 20, 12, 0, 0, tzinfo=timezone.utc)

    repo.upsert_trends([{
        "hashtag": "#AgentDev",
        "time_period": t,
        "post_count": 50,
        "unique_users": 40,
        "previous_period_count": 10,
        "growth_rate": 4.0,
        "trend_velocity": 40.0,
        "trend_score": 65.0,
        "trend_status": "Spiking",
    }])

    response = client.get("/api/x/hashtags?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    item = data[0]
    assert item["tag"] == "#AgentDev"
    assert "growth" in item
    assert "velocity" in item
    assert "mentions" in item
    assert item["status"] in ("Rising", "Spiking", "Stable", "Declining")


def test_16_api_x_hashtag_detail_endpoint(db_session, client):
    """16. GET /api/x/hashtags/{hashtag} returns detailed metrics and time-series."""
    repo = XHashtagTrendRepository(db_session)
    t1 = datetime(2026, 8, 20, 12, 0, 0, tzinfo=timezone.utc)
    t2 = datetime(2026, 8, 20, 13, 0, 0, tzinfo=timezone.utc)

    repo.upsert_trends([
        {
            "hashtag": "#GPTNext",
            "time_period": t1,
            "post_count": 25,
            "unique_users": 20,
            "previous_period_count": 10,
            "growth_rate": 1.5,
            "trend_velocity": 15.0,
            "trend_score": 40.0,
            "trend_status": "Spiking",
        },
        {
            "hashtag": "#GPTNext",
            "time_period": t2,
            "post_count": 40,
            "unique_users": 35,
            "previous_period_count": 25,
            "growth_rate": 0.6,
            "trend_velocity": 15.0,
            "trend_score": 55.0,
            "trend_status": "Rising",
        },
    ])

    response = client.get("/api/x/hashtags/GPTNext")
    assert response.status_code == 200
    detail = response.json()

    assert detail["hashtag"] in ("#GPTNext", "GPTNext")
    assert detail["post_count"] == 65
    assert len(detail["time_series"]) == 2
    assert detail["time_series"][0]["post_count"] == 25
    assert detail["time_series"][1]["post_count"] == 40
