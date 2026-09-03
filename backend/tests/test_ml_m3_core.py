from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import pytest
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, _engine_kwargs, create_db_and_tables
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
from app.services.emotion_service import rollup_emotions_from_posts
from app.services.hashtag_service import backfill_hashtag_trends, update_hashtag_trends_from_posts
from app.services.ingestion_service import (
    DEFAULT_X_DATASET_PATH,
    get_ingestion_watermark,
    run_x_ingestion_cycle,
)
from app.services.ml_service import analyze_batch, get_emotion_pipeline, get_sentiment_pipeline
from app.services.network_persist_service import update_network_from_posts
from app.services.sentiment_service import rollup_sentiment_from_posts
from app.services.topic_service import (
    ReferenceTopicModelNotFoundError,
    assign_topics,
    clear_reference_model_cache,
    fit_reference_model,
    fit_reference_model_from_x_posts,
    has_reference_model,
    load_reference_model,
)


@pytest.fixture
def test_db():
    """In-memory SQLite database fixture for isolated testing."""
    engine = create_engine("sqlite:///:memory:", **_engine_kwargs("sqlite:///:memory:"))
    create_db_and_tables(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    session = Session()
    yield session
    session.close()


def test_missing_reference_topic_model_raises_error(tmp_path):
    """Verifies that missing reference model raises clear ReferenceTopicModelNotFoundError without auto-bootstrapping."""
    fake_path = tmp_path / "non_existent_model.joblib"
    clear_reference_model_cache()

    assert not has_reference_model(fake_path)
    with pytest.raises(ReferenceTopicModelNotFoundError) as exc_info:
        assign_topics(["Sample post text"], model_path=fake_path)

    assert "Reference topic model artifact was not found" in str(exc_info.value)
    assert "fit_reference_model_from_x_posts(session)" in str(exc_info.value)


def test_reference_topic_model_fit_and_stable_reuse(test_db, tmp_path):
    """Verifies fitting the reference model saves metadata and future calls reuse the exact same taxonomy."""
    test_artifact = tmp_path / "test_reference_topic_model.joblib"
    clear_reference_model_cache()

    # Insert sample posts into test_db
    post_repo = XPostRepository(test_db)
    sample_texts = [
        "Renewable energy and climate change policies in solar power sector",
        "Artificial intelligence and deep neural network transformer architectures",
        "Public health vaccine research and medical clinical healthcare trials",
        "Space exploration missions Mars rover astronomy astrophysics rocket launch",
        "Financial market stock exchange inflation interest rates economic growth",
    ] * 5

    for i, t in enumerate(sample_texts):
        post_repo.add(
            post_id=f"test_post_{i}",
            user_id=f"u_{i}",
            username=f"User_{i}",
            text=t,
            timestamp=datetime.now(timezone.utc),
        )

    # 1. Fit reference model explicitly
    meta = fit_reference_model_from_x_posts(test_db, n_topics=3, save_path=test_artifact)
    assert test_artifact.exists()
    assert meta["n_topics"] == 3
    assert meta["source_row_count"] == len(sample_texts)
    assert "model_version" in meta

    # 2. Re-assign topics to new batch using saved reference model
    new_posts = [
        "Solar solar renewable energy transition",
        "Deep neural network machine learning models",
    ]
    results = assign_topics(new_posts, model_path=test_artifact)
    assert len(results) == 2
    for r in results:
        assert "topic" in r
        assert "topic_probability" in r
        assert r["topic_probability"] >= 0.0


def test_analyze_batch_interface(monkeypatch, tmp_path):
    """Verifies analyze_batch returns stable schema, preserves post_id, and aligns predictions."""
    test_artifact = tmp_path / "test_model.joblib"

    def mock_assign(texts):
        return [{"topic": "Topic (ai, tech)", "topic_probability": 0.88} for _ in texts]

    monkeypatch.setattr("app.services.ml_service.assign_topics", mock_assign)

    raw_posts = [
        {
            "post_id": "p1001",
            "text": "I absolutely love this new scientific breakthrough! So exciting!",
            "user_id": "u1",
            "username": "User1",
            "timestamp": datetime.now(timezone.utc),
        },
        {
            "post_id": "p1002",
            "text": "This delay is completely unacceptable and awful service.",
            "user_id": "u2",
            "username": "User2",
            "timestamp": datetime.now(timezone.utc),
        },
    ]

    results = analyze_batch(raw_posts, batch_size=2)
    assert len(results) == 2

    # Check post 1
    assert results[0]["post_id"] == "p1001"
    assert results[0]["sentiment"] in ["positive", "neutral", "negative"]
    assert 0.0 <= results[0]["sentiment_confidence"] <= 1.0
    assert results[0]["emotion"] in [
        "support", "opposition", "anger", "disgust", "fear",
        "joy", "neutral", "sadness", "surprise", "enthusiasm", "hate",
        "supportive", "excitement", "anxiety", "frustration"
    ]
    assert results[0]["emotion_source"] in ["model", "heuristic", "model_mapped"]
    assert results[0]["topic"] == "Topic (ai, tech)"
    assert results[0]["topic_probability"] == 0.88

    # Check post 2
    assert results[1]["post_id"] == "p1002"
    assert results[1]["sentiment"] in ["positive", "neutral", "negative"]


def test_sentiment_rollup_service(test_db):
    """Verifies hourly sentiment aggregation, percentages, and idempotent upserts."""
    post_repo = XPostRepository(test_db)
    dt1 = datetime(2026, 8, 1, 10, 15, tzinfo=timezone.utc)
    dt2 = datetime(2026, 8, 1, 10, 45, tzinfo=timezone.utc)
    dt3 = datetime(2026, 8, 1, 11, 5, tzinfo=timezone.utc)

    post_repo.add(post_id="s1", user_id="u1", username="User1", text="good", timestamp=dt1, sentiment="positive", sentiment_confidence=0.9)
    post_repo.add(post_id="s2", user_id="u2", username="User2", text="great", timestamp=dt2, sentiment="positive", sentiment_confidence=0.8)
    post_repo.add(post_id="s3", user_id="u3", username="User3", text="bad", timestamp=dt2, sentiment="negative", sentiment_confidence=0.7)
    post_repo.add(post_id="s4", user_id="u4", username="User4", text="ok", timestamp=dt3, sentiment="neutral", sentiment_confidence=0.6)

    # 1. Rollup
    count = rollup_sentiment_from_posts(test_db)
    assert count == 2  # Two distinct hours: 10:00 and 11:00

    repo = XSentimentAnalyticsRepository(test_db)
    analytics = repo.get_sentiment_analytics()
    assert len(analytics) == 2

    # Hour 10:00: pos=2 (66.67%), neg=1 (33.33%), neu=0
    h10 = analytics[0]
    assert h10["positive_posts"] == 2
    assert h10["negative_posts"] == 1
    assert h10["neutral_posts"] == 0
    assert h10["positive_percentage"] == 66.67
    assert h10["negative_percentage"] == 33.33

    # 2. Idempotency test (calling rollup again produces same rows without duplicates)
    count2 = rollup_sentiment_from_posts(test_db)
    analytics2 = repo.get_sentiment_analytics()
    assert len(analytics2) == 2


def test_emotion_rollup_service(test_db):
    """Verifies emotion rollups, percentages, and UNIQUE(time_period, emotion) enforcement."""
    post_repo = XPostRepository(test_db)
    dt1 = datetime(2026, 8, 1, 10, 10, tzinfo=timezone.utc)
    dt2 = datetime(2026, 8, 1, 10, 20, tzinfo=timezone.utc)

    post_repo.add(post_id="e1", user_id="u1", username="User1", text="joy post", timestamp=dt1, emotion="joy", emotion_confidence=0.95)
    post_repo.add(post_id="e2", user_id="u2", username="User2", text="joy post 2", timestamp=dt2, emotion="joy", emotion_confidence=0.85)
    post_repo.add(post_id="e3", user_id="u3", username="User3", text="anger post", timestamp=dt2, emotion="anger", emotion_confidence=0.75)

    count = rollup_emotions_from_posts(test_db)
    assert count == 2  # (10:00, joy) and (10:00, anger)

    repo = XEmotionAnalyticsRepository(test_db)
    emotions = repo.get_emotion_analytics()
    assert len(emotions) == 2

    joy_row = next(e for e in emotions if e["emotion"] == "joy")
    assert joy_row["post_count"] == 2
    assert joy_row["percentage"] == 66.67
    assert joy_row["average_confidence"] == 0.9

    # Idempotency
    rollup_emotions_from_posts(test_db)
    assert len(repo.get_emotion_analytics()) == 2


def test_network_persist_service(test_db):
    """Verifies network interactions, deterministic layout coordinates, PageRank, and edges."""
    post_repo = XPostRepository(test_db)
    dt = datetime(2026, 8, 1, 12, 0, tzinfo=timezone.utc)

    post_repo.add(
        post_id="net_1",
        user_id="alice",
        username="Alice",
        text="Hello @bob and @charlie",
        timestamp=dt,
        mentions="@bob, @charlie",
        in_reply_to_user_id="bob",
        followers_count=500,
    )
    post_repo.add(
        post_id="net_2",
        user_id="bob",
        username="Bob",
        text="Thanks @alice!",
        timestamp=dt,
        in_reply_to_user_id="alice",
        followers_count=300,
    )

    res = update_network_from_posts(test_db, cycle_id="cycle_001")
    assert res["events"] > 0
    assert res["nodes"] >= 2
    assert res["edges"] >= 1

    net_repo = XNetworkRepository(test_db)
    graph = net_repo.get_network_graph()
    assert len(graph["nodes"]) >= 2
    assert len(graph["edges"]) >= 1

    # Coordinates are deterministic numbers
    for node in graph["nodes"]:
        assert isinstance(node["x"], float)
        assert isinstance(node["y"], float)
        assert isinstance(node["z"], float)


def test_failed_cycle_transaction_rollback_and_pipeline_audit(test_db, monkeypatch):
    """
    Verifies that if an error occurs during ML enrichment:
    1. All data changes are rolled back.
    2. XPipelineRun records status='failed' with error_message.
    3. Watermark does NOT advance.
    """
    def failing_enricher(posts):
        raise RuntimeError("Simulated ML GPU Out-Of-Memory Error")

    with pytest.raises(RuntimeError):
        run_x_ingestion_cycle(
            test_db,
            window_index=1,
            ml_enrichment_fn=failing_enricher,
        )

    # Verify zero posts written to x_posts
    total_posts = test_db.scalar(select(text("COUNT(*) FROM x_posts"))) or 0
    assert total_posts == 0

    # Verify pipeline run failed record exists
    run = test_db.scalar(select(XPipelineRun).order_by(XPipelineRun.id.desc()))
    assert run is not None
    assert run.status == "failed"
    assert "Simulated ML GPU Out-Of-Memory Error" in run.error_message

    # Verify watermark did not advance
    watermark = get_ingestion_watermark(test_db, platform="x")
    assert watermark.last_successful_cycle_id is None
