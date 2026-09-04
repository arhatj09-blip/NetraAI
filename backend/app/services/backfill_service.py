from __future__ import annotations

from datetime import datetime, timezone
import logging
from pathlib import Path
import sys
from typing import Any

import pandas as pd
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import _engine_kwargs, create_db_and_tables
from app.db.models import XPost
from app.db.repository import (
    XEmotionAnalyticsRepository,
    XHashtagTrendRepository,
    XNetworkRepository,
    XPostRepository,
    XSentimentAnalyticsRepository,
)
from app.preprocessing.x import REQUIRED_COLUMNS, preprocess_x_dataset
from app.services.emotion_service import rollup_emotions_from_posts
from app.services.hashtag_service import backfill_hashtag_trends
from app.services.ingestion_service import (
    DEFAULT_X_DATASET_PATH,
    _row_to_x_post_dict,
)
from app.services.ml_service import analyze_batch
from app.services.network_persist_service import update_network_from_posts
from app.services.sentiment_service import rollup_sentiment_from_posts
from app.services.topic_service import (
    REFERENCE_MODEL_PATH,
    fit_reference_model_from_x_posts,
    has_reference_model,
)

logger = logging.getLogger(__name__)


def run_15k_ml_backfill(
    dataset_path: Path | str | None = None,
    batch_size: int = 1000,
) -> dict[str, Any]:
    """
    Executes the authoritative Phase 1 ML enrichment and analytical backfill on the 15,000 X dataset.
    
    Workflow:
    1. Checks x_posts in MySQL. If empty, loads raw posts from CSV.
    2. Fits reference topic model ONCE on the full 15,000 post corpus if not already fitted.
    3. Executes batched transformer ML enrichment (sentiment, Option-A emotion, reference topic).
    4. Updates x_posts with ML predictions in safe database chunks.
    5. Runs all analytical rollups:
       - Hashtag trends (M3A)
       - Sentiment rollups (x_sentiment_analytics)
       - Emotion rollups (x_emotion_analytics)
       - Network topology (x_network_events, x_network_nodes, x_network_edges)
    """
    target_path = Path(dataset_path) if dataset_path else DEFAULT_X_DATASET_PATH
    if not target_path.exists():
        raise FileNotFoundError(f"Source dataset not found at: {target_path}")

    engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))
    create_db_and_tables(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    session = Session()

    try:
        post_repo = XPostRepository(session)
        total_in_db = session.scalar(select(text("COUNT(*) FROM x_posts"))) or 0
        logger.info("Current total rows in x_posts: %d", total_in_db)

        # 1. Ensure 15,000 raw posts exist in x_posts
        if total_in_db < 15000:
            logger.info("Populating base 15,000 posts from %s into MySQL...", target_path.name)
            prep_res = preprocess_x_dataset(target_path)
            clean_df = pd.DataFrame(prep_res["data"])
            posts_data = [_row_to_x_post_dict(row, dataset_source=target_path.name) for _, row in clean_df.iterrows()]
            
            existing_ids = post_repo.get_existing_post_ids([p["post_id"] for p in posts_data])
            new_posts = [p for p in posts_data if p["post_id"] not in existing_ids]
            
            for i in range(0, len(new_posts), batch_size):
                chunk = new_posts[i : i + batch_size]
                post_repo.add_all(chunk)
                logger.info("Inserted %d base posts...", len(chunk))
            
            total_in_db = session.scalar(select(text("COUNT(*) FROM x_posts"))) or 0
            logger.info("x_posts now contains %d total rows.", total_in_db)

        # 2. Fit Reference Topic Model on the complete 15,000 corpus if missing
        if not has_reference_model():
            logger.info("Fitting authoritative 15K reference topic model...")
            model_meta = fit_reference_model_from_x_posts(session)
            logger.info("Reference topic model created: %s", model_meta["model_version"])
        else:
            logger.info("Reference topic model already exists at %s", REFERENCE_MODEL_PATH)

        # 3. Check for posts needing ML enrichment
        missing_posts = post_repo.get_posts_missing_ml()
        logger.info("Found %d posts missing ML enrichment in x_posts.", len(missing_posts))

        if missing_posts:
            # Convert DB posts to dicts for ML pipeline
            posts_for_ml = [
                {
                    "post_id": p.post_id,
                    "text": p.text or "",
                    "user_id": p.user_id,
                    "username": p.username,
                    "timestamp": p.timestamp,
                }
                for p in missing_posts
            ]

            logger.info("Running batched ML enrichment (sentiment, emotion, topic)...")
            start_ml_time = datetime.now(timezone.utc)
            enriched_records = analyze_batch(posts_for_ml, batch_size=64)
            ml_duration = (datetime.now(timezone.utc) - start_ml_time).total_seconds()
            logger.info("ML inference complete in %.2f seconds.", ml_duration)

            logger.info("Updating ML fields in x_posts table in batches...")
            updated_count = post_repo.update_ml_fields_batch(enriched_records)
            logger.info("Updated %d posts in MySQL.", updated_count)

        # 4. Run Analytical Rollups
        logger.info("Executing analytical rollups...")
        trends_res = backfill_hashtag_trends(session)
        sent_count = rollup_sentiment_from_posts(session)
        emot_count = rollup_emotions_from_posts(session)
        net_res = update_network_from_posts(session)

        final_post_count = session.scalar(select(text("COUNT(*) FROM x_posts"))) or 0
        distinct_post_count = session.scalar(select(text("COUNT(DISTINCT post_id) FROM x_posts"))) or 0

        logger.info("=== 15K ML BACKFILL COMPLETED SUCCESSFULLY ===")
        logger.info("Total x_posts: %d (Distinct: %d)", final_post_count, distinct_post_count)

        return {
            "status": "completed",
            "total_posts": final_post_count,
            "distinct_posts": distinct_post_count,
            "hashtag_trends": trends_res,
            "sentiment_periods": sent_count,
            "emotion_rows": emot_count,
            "network": net_res,
        }
    finally:
        session.close()
