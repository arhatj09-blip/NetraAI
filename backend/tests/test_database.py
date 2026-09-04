from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import Base, _engine_kwargs, create_db_and_tables
from app.db.models import XNetworkEvent, XPost
from app.db.repository import XPostRepository


@pytest.fixture
def session():
    test_db_url = "sqlite:///:memory:"
    test_engine = create_engine(test_db_url, **_engine_kwargs(test_db_url))
    with test_engine.connect() as conn:
        conn.execute(text("PRAGMA foreign_keys = ON;"))
    create_db_and_tables(test_engine)
    session_factory = sessionmaker(bind=test_engine, expire_on_commit=False)
    db_session = session_factory()
    db_session.execute(text("PRAGMA foreign_keys = ON;"))
    try:
        yield db_session
    finally:
        db_session.close()


def test_database_tables_and_indexes_exist(session):
    table_names = set(inspect(session.bind).get_table_names())
    assert {
        "x_posts",
        "x_hashtag_trends",
        "x_sentiment_analytics",
        "x_emotion_analytics",
        "x_network_nodes",
        "x_network_edges",
        "x_network_events",
        "x_pipeline_runs",
    }.issubset(table_names)
    assert "ix_x_posts_timestamp" in {index["name"] for index in inspect(session.bind).get_indexes("x_posts")}


def test_x_post_insert_read_update_and_duplicate_prevention(session):
    repository = XPostRepository(session)
    values = {
        "post_id": "post-1",
        "user_id": "user-1",
        "username": "analyst",
        "text": "Synthetic post",
        "timestamp": datetime(2026, 1, 1, tzinfo=timezone.utc),
        "hashtags": ["#AI"],
        "mentions": [],
        "dataset_source": "test",
        "is_synthetic": True,
    }

    post = repository.add(**values)
    assert repository.get_by_post_id("post-1").text == "Synthetic post"

    updated = repository.update("post-1", text="Updated post")
    assert updated is not None
    assert repository.get_by_post_id("post-1").text == "Updated post"

    with pytest.raises(IntegrityError):
        repository.add(**values)


def test_network_event_requires_existing_post(session):
    event_table = XPost.__table__.metadata.tables["x_network_events"]
    assert any(foreign_key.target_fullname == "x_posts.post_id" for foreign_key in event_table.foreign_keys)


def test_database_connection_and_dialect(session):
    result = session.execute(text("SELECT 1")).scalar()
    assert result == 1
    assert session.bind.dialect.name in ("mysql", "sqlite")


def test_foreign_key_runtime_enforcement(session):
    event = XNetworkEvent(
        event_id="evt-orphan-test",
        post_id="non-existent-post-id",
        source_user_id="user-orphan",
        target_user_id="user-target",
        interaction_type="retweet",
        timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )
    session.add(event)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()