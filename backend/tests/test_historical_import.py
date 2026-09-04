from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import pytest
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import _engine_kwargs, create_db_and_tables
from app.db.models import (
    XEmotionAnalytics,
    XHashtagTrend,
    XNetworkEdge,
    XNetworkEvent,
    XNetworkNode,
    XPipelineRun,
    XPost,
    XSentimentAnalytics,
)
from app.db.repository import (
    XEmotionAnalyticsRepository,
    XHashtagTrendRepository,
    XNetworkRepository,
    XPipelineRunRepository,
    XPostRepository,
    XSentimentAnalyticsRepository,
)
from app.services.historical_import_service import execute_historical_import


@pytest.fixture
def memory_db():
    """In-memory SQLite fixture for isolated unit testing."""
    test_db_url = "sqlite:///:memory:"
    engine = create_engine(test_db_url, **_engine_kwargs(test_db_url))
    with engine.connect() as conn:
        conn.execute(text("PRAGMA foreign_keys = ON;"))
    create_db_and_tables(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    session = Session()
    db_session = session
    db_session.execute(text("PRAGMA foreign_keys = ON;"))
    try:
        yield db_session
    finally:
        db_session.close()


def test_1_post_id_matching_and_duplicate_prevention(memory_db):
    post_repo = XPostRepository(memory_db)
    post_repo.add(
        post_id="post_test_1",
        user_id="user_test_1",
        username="user1",
        text="Sample post",
        timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),
        sentiment="neutral",
        sentiment_confidence=0.95,
        emotion="neutral",
        emotion_confidence=0.88,
        emotion_source="model",
        topic="Technology & Science",
        topic_probability=0.99,
    )
    assert memory_db.scalar(select(func.count(XPost.id))) == 1

    # Check duplicate prevention
    existing_ids = post_repo.get_existing_post_ids(["post_test_1", "post_test_2"])
    assert existing_ids == {"post_test_1"}


def test_2_ml_field_updates(memory_db):
    post_repo = XPostRepository(memory_db)
    post = post_repo.add(
        post_id="post_test_2",
        user_id="user_test_2",
        username="user2",
        text="Sample post 2",
        timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )
    assert post.sentiment is None

    updated = post_repo.update_ml_fields_batch([
        {
            "post_id": "post_test_2",
            "sentiment": "positive",
            "sentiment_confidence": 0.92,
            "emotion": "joy",
            "emotion_confidence": 0.85,
            "emotion_source": "model",
            "topic": "Team & Small Local",
            "topic_probability": 0.98,
        }
    ])
    assert updated == 1

    refreshed = post_repo.get_by_post_id("post_test_2")
    assert refreshed.sentiment == "positive"
    assert refreshed.emotion == "joy"
    assert refreshed.topic == "Team & Small Local"


def test_3_network_topology_persistence(memory_db):
    net_repo = XNetworkRepository(memory_db)
    # Insert node
    n_cnt = net_repo.upsert_nodes([
        {
            "user_id": "u_test_1",
            "username": "User One",
            "activity": 5,
            "degree": 3,
            "followers_count": 100,
            "verified": True,
            "pagerank": 0.05,
            "betweenness": 0.02,
            "layout_x": 0.1,
            "layout_y": 0.2,
            "layout_z": 0.3,
        }
    ])
    assert n_cnt == 1

    # Insert edge
    e_cnt = net_repo.upsert_edges([
        {
            "source_user_id": "u_test_1",
            "target_user_id": "u_test_2",
            "interaction_type": "mention",
            "weight": 2,
            "first_seen_at": datetime(2026, 1, 1, tzinfo=timezone.utc),
            "last_seen_at": datetime(2026, 1, 2, tzinfo=timezone.utc),
        }
    ])
    assert e_cnt == 1

    node = memory_db.scalar(select(XNetworkNode).where(XNetworkNode.user_id == "u_test_1"))
    assert node.pagerank == 0.05
    assert node.degree == 3


def test_4_mysql_production_state_verification():
    """Verify live MySQL database has exact required 15,000 counts and zero mismatches."""
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        total_posts = conn.execute(text("SELECT COUNT(*) FROM x_posts")).scalar()
        distinct_posts = conn.execute(text("SELECT COUNT(DISTINCT post_id) FROM x_posts")).scalar()
        assert total_posts == 15000
        assert distinct_posts == 15000

        sent_null = conn.execute(text("SELECT COUNT(*) FROM x_posts WHERE sentiment IS NULL")).scalar()
        emot_null = conn.execute(text("SELECT COUNT(*) FROM x_posts WHERE emotion IS NULL")).scalar()
        topic_null = conn.execute(text("SELECT COUNT(*) FROM x_posts WHERE topic IS NULL")).scalar()
        assert sent_null == 0
        assert emot_null == 0
        assert topic_null == 0

        # Verify network counts
        nodes_cnt = conn.execute(text("SELECT COUNT(*) FROM x_network_nodes")).scalar()
        edges_cnt = conn.execute(text("SELECT COUNT(*) FROM x_network_edges")).scalar()
        assert nodes_cnt == 3996
        assert edges_cnt == 7225

        # Verify pipeline run status
        backfill_run = conn.execute(
            text("SELECT status, records_ingested, records_processed FROM x_pipeline_runs WHERE ingestion_cycle_id = 'cycle-x-historical-backfill-15k'")
        ).fetchone()
        assert backfill_run is not None
        assert backfill_run[0] == "completed"
        assert backfill_run[1] == 15000
        assert backfill_run[2] == 15000
