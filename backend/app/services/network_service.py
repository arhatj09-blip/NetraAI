from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import networkx as nx
import pandas as pd

NETWORK_TOP_N = 50
SIMULATION_MINUTES = 20
SIMULATION_BIN_SECONDS = 20
MENTION_PATTERN = re.compile(r"@([A-Za-z0-9_]{1,50})")


def _text(value: Any) -> str | None:
    if pd.isna(value):
        return None
    value = str(value).strip()
    return value or None


def _targets(row: pd.Series) -> list[tuple[str, str]]:
    targets: list[tuple[str, str]] = []
    for column, interaction_type in (
        ("reply_to_user", "reply"),
        ("mentioned_user", "mention"),
        ("retweeted_user", "retweet"),
        ("quoted_user", "quote"),
    ):
        value = _text(row.get(column))
        if value:
            targets.append((value.lstrip("@"), interaction_type))

    mentions = _text(row.get("mentions"))
    if mentions:
        targets.extend((target, "mention") for target in MENTION_PATTERN.findall(mentions))
    return targets


def build_x_network(file_path: str | Path, start_date: str | None = None, end_date: str | None = None) -> dict[str, Any]:
    df = pd.read_csv(file_path, dtype=str, keep_default_na=True)
    df.columns = [str(column).strip().lower() for column in df.columns]

    timestamp_column = "created_at" if "created_at" in df.columns else "timestamp"
    parsed_timestamps = pd.to_datetime(df.get(timestamp_column), errors="coerce", utc=True)
    has_timestamps = parsed_timestamps.notna().any()

    if has_timestamps:
        df["_timestamp"] = parsed_timestamps
        if start_date:
            start = pd.to_datetime(start_date, errors="coerce", utc=True)
            if pd.notna(start):
                df = df[df["_timestamp"] >= start]
        if end_date:
            end = pd.to_datetime(end_date, errors="coerce", utc=True) + pd.Timedelta(days=1)
            if pd.notna(end):
                df = df[df["_timestamp"] < end]
        df = df.dropna(subset=["_timestamp"]).sort_values("_timestamp", kind="mergesort").reset_index(drop=True)
    else:
        df["_timestamp"] = pd.NaT
        df = df.reset_index(drop=True)

    if df.empty:
        return {"platform": "x", "simulation": {"duration_seconds": 1200, "bin_seconds": 20, "frame_count": 60}, "nodes": [], "events": []}

    source_elapsed = ((df["_timestamp"] - df["_timestamp"].min()).dt.total_seconds() if has_timestamps else pd.Series(range(len(df)), index=df.index, dtype=float))
    source_seconds = float(source_elapsed.max()) or float(max(len(df) - 1, 1))
    df["_simulation_seconds"] = source_elapsed.fillna(0) / source_seconds * (SIMULATION_MINUTES * 60)
    df["_simulation_bin"] = (df["_simulation_seconds"] // SIMULATION_BIN_SECONDS).astype(int).clip(upper=59)

    graph = nx.Graph()
    events: list[dict[str, Any]] = []
    usernames: dict[str, str] = {}

    for row_index, row in df.iterrows():
        source_id = _text(row.get("user_id")) or _text(row.get("username"))
        source_name = _text(row.get("username")) or source_id
        if not source_id or not source_name:
            continue
        usernames[source_id] = source_name
        graph.add_node(source_id)
        for target_name, interaction_type in _targets(row):
            target_id = f"mention:{target_name.lower()}"
            usernames[target_id] = target_name
            graph.add_node(target_id)
            graph.add_edge(source_id, target_id)
            event_timestamp = row["_timestamp"].isoformat() if pd.notna(row["_timestamp"]) else None
            events.append({
                "event_id": f"{_text(row.get('post_id')) or row_index}:{target_id}:{interaction_type}",
                "source": source_id,
                "target": target_id,
                "interaction_type": interaction_type,
                "timestamp": event_timestamp,
                "simulation_bin": int(row["_simulation_bin"]),
                "post_id": _text(row.get("post_id")),
            })

    activity: dict[str, int] = {node: 0 for node in graph.nodes}
    for event in events:
        activity[event["source"]] += 1
        activity[event["target"]] += 1

    ranked_nodes = sorted(graph.nodes, key=lambda node: (-activity[node], usernames.get(node, node).lower()))[:NETWORK_TOP_N]
    selected = set(ranked_nodes)
    graph = graph.subgraph(selected).copy()
    events = [event for event in events if event["source"] in selected and event["target"] in selected]

    positions = nx.spring_layout(graph, dim=3, seed=42, weight=None) if graph else {}
    max_activity = max((activity[node] for node in selected), default=1)
    nodes = []
    for node in sorted(selected, key=lambda value: usernames.get(value, value).lower()):
        followers = pd.to_numeric(df.loc[df.get("user_id") == node, "followers_count"], errors="coerce") if "followers_count" in df else pd.Series(dtype=float)
        nodes.append({
            "id": node,
            "username": f"@{usernames.get(node, node)}",
            "activity": activity[node],
            "connections": int(graph.degree(node)),
            "followers": int(followers.max()) if not followers.dropna().empty else None,
            "verified": None,
            "x": float(positions[node][0]),
            "y": float(positions[node][1]),
            "z": float(positions[node][2]),
            "activity_ratio": round(activity[node] / max_activity, 4),
        })

    return {
        "platform": "x",
        "nodes": nodes,
        "events": events,
        "simulation": {
            "duration_seconds": SIMULATION_MINUTES * 60,
            "bin_seconds": SIMULATION_BIN_SECONDS,
            "frame_count": SIMULATION_MINUTES * 60 // SIMULATION_BIN_SECONDS,
            "source_timestamps_available": bool(has_timestamps),
        },
    }