from __future__ import annotations

from datetime import datetime, timezone
import logging
import os
from pathlib import Path
import time
from typing import Any

import networkx as nx
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.orm import Session, sessionmaker

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
from app.services.emotion_service import rollup_emotions_from_posts
from app.services.hashtag_service import backfill_hashtag_trends
from app.services.ingestion_service import _row_to_x_post_dict
from app.services.sentiment_service import rollup_sentiment_from_posts

logger = logging.getLogger(__name__)

DEFAULT_ANALYSIS_DIR = Path(r"C:\Users\Arhat\Downloads\social_media_analytics_full_output\social_media_analytics\output\final_x_15k")
DEFAULT_SOURCE_FILE = Path(r"D:\SIH26\NetraAI\data\x\x_dataset_synthetic_15000.csv")


def execute_historical_import(
    analysis_dir: Path | str | None = None,
    source_file: Path | str | None = None,
    batch_size: int = 1000,
) -> dict[str, Any]:
    """
    Idempotent, transaction-safe historical backfill from the validated 15K analysis output.
    Does NOT rerun any NLP inference or ML models.
    """
    start_time = time.time()
    a_dir = Path(analysis_dir) if analysis_dir else DEFAULT_ANALYSIS_DIR
    s_file = Path(source_file) if source_file else DEFAULT_SOURCE_FILE

    enriched_csv = a_dir / "enriched_posts.csv"
    nodes_csv = a_dir / "network_nodes.csv"
    edges_csv = a_dir / "network_edges.csv"

    if not enriched_csv.exists():
        raise FileNotFoundError(f"Validated enriched posts not found at {enriched_csv}")

    engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))
    create_db_and_tables(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    session: Session = SessionLocal()

    report: dict[str, Any] = {}

    try:
        # ----------------------------------------------------
        # 1. Inspect MySQL before import
        # ----------------------------------------------------
        before_counts = {
            "x_posts": session.scalar(select(func.count(XPost.id))) or 0,
            "x_hashtag_trends": session.scalar(select(func.count(XHashtagTrend.id))) or 0,
            "x_sentiment_analytics": session.scalar(select(func.count(XSentimentAnalytics.id))) or 0,
            "x_emotion_analytics": session.scalar(select(func.count(XEmotionAnalytics.id))) or 0,
            "x_network_nodes": session.scalar(select(func.count(XNetworkNode.id))) or 0,
            "x_network_edges": session.scalar(select(func.count(XNetworkEdge.id))) or 0,
            "x_network_events": session.scalar(select(func.count(XNetworkEvent.id))) or 0,
            "x_pipeline_runs": session.scalar(select(func.count(XPipelineRun.id))) or 0,
        }
        report["before_counts"] = before_counts

        # ----------------------------------------------------
        # 2. Handle the old interrupted STARTED run
        # ----------------------------------------------------
        interrupted_runs = list(
            session.scalars(
                select(XPipelineRun).where(XPipelineRun.status == "started")
            ).all()
        )
        handled_interrupted = []
        for irun in interrupted_runs:
            irun.status = "failed"
            irun.error_message = (
                "Interrupted M3 Core ML backfill. Replaced by validated historical analysis import."
            )
            irun.actual_end_time = datetime.now(timezone.utc)
            handled_interrupted.append({
                "id": irun.id,
                "ingestion_cycle_id": irun.ingestion_cycle_id,
                "status": "failed",
                "reason": irun.error_message,
            })
        session.commit()
        report["interrupted_runs_handled"] = handled_interrupted

        # ----------------------------------------------------
        # 3. Create NEW Historical Backfill Pipeline Run (started)
        # ----------------------------------------------------
        cycle_id = "cycle-x-historical-backfill-15k"
        backfill_run = session.scalar(
            select(XPipelineRun).where(XPipelineRun.ingestion_cycle_id == cycle_id)
        )
        now_utc = datetime.now(timezone.utc)
        if backfill_run is None:
            backfill_run = XPipelineRun(
                ingestion_cycle_id=cycle_id,
                platform="x",
                source=s_file.name,
                scheduled_time=now_utc,
                actual_start_time=now_utc,
                records_available=15000,
                status="started",
            )
            session.add(backfill_run)
            session.commit()
            session.refresh(backfill_run)
        else:
            backfill_run.status = "started"
            backfill_run.actual_start_time = now_utc
            backfill_run.error_message = None
            session.commit()

        # ----------------------------------------------------
        # 4. Load validated enriched posts & populate x_posts
        # ----------------------------------------------------
        df_enriched = pd.read_csv(enriched_csv)
        total_enriched = len(df_enriched)
        logger.info("Loaded %d validated enriched posts from CSV.", total_enriched)

        posts_data = [
            _row_to_x_post_dict(row, dataset_source=s_file.name)
            for _, row in df_enriched.iterrows()
        ]

        dialect_name = session.bind.dialect.name if session.bind else "mysql"
        chunk_size = 1000

        if dialect_name == "mysql":
            from sqlalchemy.dialects.mysql import insert as mysql_insert
            now_utc_ts = datetime.now(timezone.utc)
            for i in range(0, len(posts_data), chunk_size):
                chunk = posts_data[i : i + chunk_size]
                stmt = mysql_insert(XPost).values(chunk)
                update_cols = {
                    "sentiment": stmt.inserted.sentiment,
                    "sentiment_confidence": stmt.inserted.sentiment_confidence,
                    "emotion": stmt.inserted.emotion,
                    "emotion_confidence": stmt.inserted.emotion_confidence,
                    "emotion_source": stmt.inserted.emotion_source,
                    "topic": stmt.inserted.topic,
                    "topic_probability": stmt.inserted.topic_probability,
                    "updated_at": now_utc_ts,
                }
                upsert_stmt = stmt.on_duplicate_key_update(update_cols)
                session.execute(upsert_stmt)
            session.commit()
        else:
            post_repo = XPostRepository(session)
            existing_pids = post_repo.get_existing_post_ids([p["post_id"] for p in posts_data])
            posts_to_insert = [p for p in posts_data if p["post_id"] not in existing_pids]
            posts_to_update = [p for p in posts_data if p["post_id"] in existing_pids]

            for i in range(0, len(posts_to_insert), chunk_size):
                post_repo.add_all(posts_to_insert[i : i + chunk_size])
            if posts_to_update:
                post_repo.update_ml_fields_batch(posts_to_update)

        report["posts_inserted"] = total_enriched
        report["total_posts_loaded"] = total_enriched

        # ----------------------------------------------------
        # 5. Sentiment & Emotion Rollups (derived from x_posts)
        # ----------------------------------------------------
        sent_count = rollup_sentiment_from_posts(session)
        emot_count = rollup_emotions_from_posts(session)
        report["sentiment_periods_upserted"] = sent_count
        report["emotion_rows_upserted"] = emot_count

        # ----------------------------------------------------
        # 6. Hashtag Trends (derived from x_posts via M3A)
        # ----------------------------------------------------
        trends_res = backfill_hashtag_trends(session, period_hours=1)
        report["hashtag_trends"] = trends_res

        # ----------------------------------------------------
        # 7. Network Nodes & Edges (from validated CSVs)
        # ----------------------------------------------------
        df_nodes = pd.read_csv(nodes_csv) if nodes_csv.exists() else pd.DataFrame()
        df_edges = pd.read_csv(edges_csv) if edges_csv.exists() else pd.DataFrame()

        # Build graph for 3D spring coordinates
        G = nx.DiGraph()
        for _, r in df_edges.iterrows():
            G.add_edge(str(r["source_user_id"]), str(r["target_user_id"]), weight=int(r.get("weight", 1)))

        # Ensure all nodes exist in graph
        for _, r in df_nodes.iterrows():
            G.add_node(str(r["user_id"]))

        # Deterministic 3D spring layout
        positions = nx.spring_layout(G, dim=3, seed=42) if G.number_of_nodes() > 0 else {}

        # Build user metadata lookup from enriched_posts
        user_meta: dict[str, dict[str, Any]] = {}
        for _, r in df_enriched.iterrows():
            uid = str(r["user_id"]).strip()
            uname = str(r["username"]).strip() if pd.notna(r.get("username")) else uid
            fc = int(r["followers_count"]) if pd.notna(r.get("followers_count")) else 0
            v = bool(r["verified"]) if pd.notna(r.get("verified")) else False
            if uid not in user_meta:
                user_meta[uid] = {
                    "username": uname,
                    "followers_count": fc,
                    "verified": v,
                    "activity": 0,
                }
            user_meta[uid]["activity"] += 1

        nodes_records: list[dict[str, Any]] = []
        for _, r in df_nodes.iterrows():
            uid = str(r["user_id"]).strip()
            in_d = int(r.get("in_degree", 0))
            out_d = int(r.get("out_degree", 0))
            pr = float(r.get("pagerank", 0.0))
            bw = float(r.get("betweenness", 0.0))
            pos = positions.get(uid, [0.0, 0.0, 0.0])
            meta = user_meta.get(uid, {"username": uid, "followers_count": 0, "verified": False, "activity": 0})

            nodes_records.append({
                "user_id": uid,
                "username": meta["username"],
                "activity": meta["activity"],
                "degree": in_d + out_d,
                "followers_count": meta["followers_count"],
                "verified": meta["verified"],
                "pagerank": round(pr, 6),
                "betweenness": round(bw, 6),
                "layout_x": float(pos[0]),
                "layout_y": float(pos[1]),
                "layout_z": float(pos[2]),
            })

        # Calculate min/max timestamps for edges from posts
        user_timestamps: dict[str, list[datetime]] = {}
        for p in posts_data:
            uid = p["user_id"]
            ts = p["timestamp"]
            if uid not in user_timestamps:
                user_timestamps[uid] = []
            user_timestamps[uid].append(ts)

        edges_records: list[dict[str, Any]] = []
        for _, r in df_edges.iterrows():
            s_uid = str(r["source_user_id"]).strip()
            t_uid = str(r["target_user_id"]).strip()
            w = int(r.get("weight", 1))

            s_ts = user_timestamps.get(s_uid, [])
            first_seen = min(s_ts) if s_ts else None
            last_seen = max(s_ts) if s_ts else None

            edges_records.append({
                "source_user_id": s_uid,
                "target_user_id": t_uid,
                "interaction_type": "mention",
                "weight": w,
                "first_seen_at": first_seen,
                "last_seen_at": last_seen,
            })

        net_repo = XNetworkRepository(session)
        upserted_nodes = net_repo.upsert_nodes(nodes_records)
        upserted_edges = net_repo.upsert_edges(edges_records)
        report["network_nodes_upserted"] = upserted_nodes
        report["network_edges_upserted"] = upserted_edges

        # ----------------------------------------------------
        # 8. Network Events
        # ----------------------------------------------------
        events_records: list[dict[str, Any]] = []
        for p in posts_data:
            mentions = p.get("mentions")
            if mentions and isinstance(mentions, list):
                for m in mentions:
                    t_uid = str(m).strip().lstrip("@")
                    if t_uid:
                        event_id = f"{p['post_id']}:{t_uid}:mention"
                        events_records.append({
                            "event_id": event_id,
                            "post_id": p["post_id"],
                            "source_user_id": p["user_id"],
                            "target_user_id": t_uid,
                            "interaction_type": "mention",
                            "timestamp": p["timestamp"],
                            "ingestion_cycle_id": cycle_id,
                        })

        upserted_events = net_repo.upsert_events(events_records)
        report["network_events_upserted"] = upserted_events

        # ----------------------------------------------------
        # 9. Mark Historical Pipeline Run as COMPLETED
        # ----------------------------------------------------
        backfill_run.records_ingested = total_enriched
        backfill_run.records_processed = total_enriched
        backfill_run.records_failed = 0
        backfill_run.status = "completed"
        backfill_run.actual_end_time = datetime.now(timezone.utc)
        session.commit()

        # ----------------------------------------------------
        # 10. Inspect MySQL after import
        # ----------------------------------------------------
        after_counts = {
            "x_posts": session.scalar(select(func.count(XPost.id))) or 0,
            "x_posts_distinct": session.scalar(select(func.count(func.distinct(XPost.post_id)))) or 0,
            "x_posts_sentiment_not_null": session.scalar(select(func.count(XPost.id)).where(XPost.sentiment.is_not(None))) or 0,
            "x_posts_emotion_not_null": session.scalar(select(func.count(XPost.id)).where(XPost.emotion.is_not(None))) or 0,
            "x_posts_topic_not_null": session.scalar(select(func.count(XPost.id)).where(XPost.topic.is_not(None))) or 0,
            "x_hashtag_trends": session.scalar(select(func.count(XHashtagTrend.id))) or 0,
            "x_sentiment_analytics": session.scalar(select(func.count(XSentimentAnalytics.id))) or 0,
            "x_emotion_analytics": session.scalar(select(func.count(XEmotionAnalytics.id))) or 0,
            "x_network_nodes": session.scalar(select(func.count(XNetworkNode.id))) or 0,
            "x_network_edges": session.scalar(select(func.count(XNetworkEdge.id))) or 0,
            "x_network_events": session.scalar(select(func.count(XNetworkEvent.id))) or 0,
            "x_pipeline_runs": session.scalar(select(func.count(XPipelineRun.id))) or 0,
        }
        report["after_counts"] = after_counts
        report["duration_seconds"] = round(time.time() - start_time, 2)
        report["status"] = "success"

        return report
    except Exception as e:
        session.rollback()
        logger.exception("Historical backfill failed: %s", e)
        # Update pipeline run to failed if possible
        try:
            failed_run = session.scalar(
                select(XPipelineRun).where(XPipelineRun.ingestion_cycle_id == "cycle-x-historical-backfill-15k")
            )
            if failed_run:
                failed_run.status = "failed"
                failed_run.error_message = str(e)
                failed_run.actual_end_time = datetime.now(timezone.utc)
                session.commit()
        except Exception:
            pass
        raise
    finally:
        session.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    res = execute_historical_import()
    import json
    print(json.dumps(res, indent=2, default=str))
