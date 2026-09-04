from __future__ import annotations

from datetime import datetime, timezone
import logging
import re
from typing import Any

import networkx as nx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import XPost
from app.db.repository import XNetworkRepository

logger = logging.getLogger(__name__)

MENTION_PATTERN = re.compile(r"@([A-Za-z0-9_]{1,50})")


def _extract_targets(post: XPost) -> list[tuple[str, str]]:
    """Extract interaction target user IDs and interaction types from an X post."""
    targets: list[tuple[str, str]] = []

    # 1. Replies
    if post.in_reply_to_user_id and str(post.in_reply_to_user_id).strip():
        targets.append((str(post.in_reply_to_user_id).strip().lstrip("@"), "reply"))

    # 2. Mentions (handles list, JSON string, or delimited string)
    if post.mentions:
        if isinstance(post.mentions, list):
            for m in post.mentions:
                clean = str(m).strip().lstrip("@")
                if clean:
                    targets.append((clean, "mention"))
        else:
            m_str = str(post.mentions).strip()
            matched = MENTION_PATTERN.findall(m_str)
            if matched:
                targets.extend((m, "mention") for m in matched)
            else:
                for item in m_str.split(","):
                    clean = item.strip().lstrip("@")
                    if clean:
                        targets.append((clean, "mention"))

    return targets


def update_network_from_posts(
    session: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    cycle_id: str | None = None,
) -> dict[str, int]:
    """
    Builds and persists interaction network graph (events, nodes, edges) to MySQL from x_posts.
    Calculates deterministic PageRank, betweenness, degrees, and 3D spring coordinates (seed=42).
    """
    logger.info("Extracting network interactions from x_posts...")
    stmt = select(XPost).where(
        XPost.user_id.is_not(None),
        XPost.timestamp.is_not(None),
    ).order_by(XPost.timestamp.asc())

    if start_date:
        stmt = stmt.where(XPost.timestamp >= start_date)
    if end_date:
        stmt = stmt.where(XPost.timestamp <= end_date)

    posts = list(session.scalars(stmt).all())
    if not posts:
        logger.info("No posts found for network calculation.")
        return {"events": 0, "nodes": 0, "edges": 0}

    graph = nx.Graph()
    events_data: list[dict[str, Any]] = []
    edges_map: dict[tuple[str, str, str], dict[str, Any]] = {}
    user_metadata: dict[str, dict[str, Any]] = {}

    for post in posts:
        source_id = str(post.user_id).strip()
        source_name = str(post.username).strip() if post.username else source_id

        if source_id not in user_metadata:
            user_metadata[source_id] = {
                "username": source_name,
                "followers_count": post.followers_count or 0,
                "verified": post.verified or False,
                "activity": 0,
            }
        user_metadata[source_id]["activity"] += 1
        graph.add_node(source_id)

        targets = _extract_targets(post)
        for target_name, i_type in targets:
            target_id = f"user_{target_name.lower()}"
            if target_id not in user_metadata:
                user_metadata[target_id] = {
                    "username": target_name,
                    "followers_count": 0,
                    "verified": False,
                    "activity": 0,
                }
            user_metadata[target_id]["activity"] += 1
            graph.add_node(target_id)
            graph.add_edge(source_id, target_id)

            event_id = f"{post.post_id}:{target_id}:{i_type}"
            events_data.append({
                "event_id": event_id,
                "post_id": post.post_id,
                "source_user_id": source_id,
                "target_user_id": target_id,
                "interaction_type": i_type,
                "timestamp": post.timestamp,
                "ingestion_cycle_id": cycle_id,
            })

            edge_key = (source_id, target_id, i_type)
            if edge_key not in edges_map:
                edges_map[edge_key] = {
                    "source_user_id": source_id,
                    "target_user_id": target_id,
                    "interaction_type": i_type,
                    "weight": 0,
                    "first_seen_at": post.timestamp,
                    "last_seen_at": post.timestamp,
                }
            edges_map[edge_key]["weight"] += 1
            if post.timestamp > edges_map[edge_key]["last_seen_at"]:
                edges_map[edge_key]["last_seen_at"] = post.timestamp
            if post.timestamp < edges_map[edge_key]["first_seen_at"]:
                edges_map[edge_key]["first_seen_at"] = post.timestamp

    # Compute network metrics
    logger.info("Computing network topology metrics (PageRank, betweenness, 3D layout)...")
    pagerank_scores = nx.pagerank(graph, weight=None) if graph.number_of_edges() > 0 else {n: 0.0 for n in graph.nodes}
    betweenness_scores = nx.betweenness_centrality(graph, weight=None) if graph.number_of_edges() > 0 else {n: 0.0 for n in graph.nodes}
    positions = nx.spring_layout(graph, dim=3, seed=42, weight=None) if graph.number_of_nodes() > 0 else {}

    nodes_data: list[dict[str, Any]] = []
    for node_id in graph.nodes:
        meta = user_metadata.get(node_id, {"username": node_id, "followers_count": 0, "verified": False, "activity": 0})
        pos = positions.get(node_id, [0.0, 0.0, 0.0])
        nodes_data.append({
            "user_id": node_id,
            "username": meta["username"],
            "activity": meta["activity"],
            "degree": int(graph.degree(node_id)),
            "followers_count": meta["followers_count"],
            "verified": meta["verified"],
            "pagerank": round(float(pagerank_scores.get(node_id, 0.0)), 6),
            "betweenness": round(float(betweenness_scores.get(node_id, 0.0)), 6),
            "layout_x": float(pos[0]),
            "layout_y": float(pos[1]),
            "layout_z": float(pos[2]),
        })

    edges_data = list(edges_map.values())

    repo = XNetworkRepository(session)
    n_events = repo.upsert_events(events_data)
    n_nodes = repo.upsert_nodes(nodes_data)
    n_edges = repo.upsert_edges(edges_data)

    logger.info("Persisted network: %d events, %d nodes, %d edges.", n_events, n_nodes, n_edges)
    return {"events": n_events, "nodes": n_nodes, "edges": n_edges}
