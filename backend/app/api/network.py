from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional
from collections import defaultdict
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.database import get_session
from app.db.models import XNetworkEdge, XNetworkEvent, XNetworkNode, XPost

router = APIRouter()


def _parse_dt(dt_val: Optional[str]) -> Optional[datetime]:
    if not dt_val:
        return None
    try:
        import pandas as pd
        return pd.to_datetime(dt_val, utc=True).to_pydatetime()
    except Exception:
        return None


@router.get("/x/network")
async def get_x_network(
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    max_nodes: int = Query(default=200, ge=10, le=1000),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Returns the real X interaction network from MySQL.
    Uses pre-calculated 3D coordinates, PageRank, betweenness, and centrality metrics.
    Resolves author IDs to usernames to provide a richly connected graph with real edges.
    """
    start_dt = _parse_dt(start_date)
    end_dt = _parse_dt(end_date)

    # Get total counts in database for metadata
    total_nodes = session.scalar(select(func.count(XNetworkNode.id))) or 0
    total_edges = session.scalar(select(func.count(XNetworkEdge.id))) or 0

    # Fetch top nodes by PageRank / activity / degree
    nodes_stmt = (
        select(XNetworkNode)
        .order_by(XNetworkNode.pagerank.desc(), XNetworkNode.degree.desc(), XNetworkNode.activity.desc())
        .limit(max_nodes)
    )
    node_rows = list(session.scalars(nodes_stmt).all())
    if not node_rows:
        return {
            "nodes": [],
            "edges": [],
            "events": [],
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "returned_nodes": 0,
            "returned_edges": 0,
            "simulation": {
                "duration_seconds": 45,
                "bin_seconds": 15,
                "frame_count": 10,
                "source_timestamps_available": True,
            },
        }

    max_activity = max((n.activity for n in node_rows), default=1) or 1
    selected_usernames = {n.username for n in node_rows}

    # Fetch author_id -> username mapping from x_posts
    author_mappings = dict(session.execute(select(XPost.user_id, XPost.username).distinct()).all())

    # Fetch matching edges for the selected nodes
    edges_stmt = select(XNetworkEdge)
    if start_dt:
        edges_stmt = edges_stmt.where(XNetworkEdge.last_seen_at >= start_dt)
    if end_dt:
        edges_stmt = edges_stmt.where(XNetworkEdge.first_seen_at <= end_dt)

    edge_rows = list(session.scalars(edges_stmt).all())
    
    in_degree_map = defaultdict(int)
    out_degree_map = defaultdict(int)
    edges_data = []

    for e in edge_rows:
        src = author_mappings.get(e.source_user_id, e.source_user_id)
        tgt = author_mappings.get(e.target_user_id, e.target_user_id)
        if src in selected_usernames and tgt in selected_usernames and src != tgt:
            edges_data.append({
                "source": src,
                "target": tgt,
                "source_user_id": src,
                "target_user_id": tgt,
                "weight": e.weight,
                "interaction_type": e.interaction_type,
            })
            out_degree_map[src] += 1
            in_degree_map[tgt] += 1

    nodes_data = [
        {
            "id": n.username,
            "user_id": n.username,
            "username": n.username,
            "label": n.username,
            "activity": n.activity,
            "connections": n.degree,
            "degree": n.degree,
            "in_degree": in_degree_map.get(n.username, 0),
            "out_degree": out_degree_map.get(n.username, 0),
            "followers": n.followers_count,
            "followers_count": n.followers_count,
            "verified": n.verified,
            "x": n.layout_x,
            "y": n.layout_y,
            "z": n.layout_z,
            "pagerank": round(n.pagerank, 6) if n.pagerank is not None else 0.0,
            "betweenness": round(n.betweenness, 6) if n.betweenness is not None else 0.0,
            "activity_ratio": round(n.activity / max_activity, 4),
        }
        for n in node_rows
    ]

    # Fetch events for timeline replay
    events_stmt = select(XNetworkEvent).order_by(XNetworkEvent.timestamp.asc())
    if start_dt:
        events_stmt = events_stmt.where(XNetworkEvent.timestamp >= start_dt)
    if end_dt:
        events_stmt = events_stmt.where(XNetworkEvent.timestamp <= end_dt)

    event_rows = list(session.scalars(events_stmt).all())
    events_data = []
    
    for ev in event_rows:
        src = author_mappings.get(ev.source_user_id, ev.source_user_id)
        tgt = author_mappings.get(ev.target_user_id, ev.target_user_id)
        if src in selected_usernames and tgt in selected_usernames:
            events_data.append({
                "event_id": ev.event_id,
                "source": src,
                "target": tgt,
                "interaction_type": ev.interaction_type,
                "timestamp": ev.timestamp.isoformat() if ev.timestamp else None,
                "simulation_bin": len(events_data) % 10,
                "post_id": ev.post_id,
            })
            if len(events_data) >= 800:
                break

    return {
        "nodes": nodes_data,
        "edges": edges_data,
        "events": events_data,
        "total_nodes": total_nodes,
        "total_edges": total_edges,
        "returned_nodes": len(nodes_data),
        "returned_edges": len(edges_data),
        "simulation": {
            "duration_seconds": 45,
            "bin_seconds": 15,
            "frame_count": 10,
            "source_timestamps_available": True,
        },
    }