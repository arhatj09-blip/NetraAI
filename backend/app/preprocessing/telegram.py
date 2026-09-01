from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict

import pandas as pd

from .common import (
    clean_text_series,
    ensure_required_columns,
    make_validation_summary,
    normalize_columns,
    normalize_timestamp_series,
    safe_numeric,
)

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = [
    "platform",
    "post_id",
    "text",
    "timestamp",
    "channel_id",
    "channel_title",
    "channel_username",
]


def preprocess_telegram_dataset(file_path: str | Path) -> Dict[str, Any]:
    file_path = Path(file_path)
    raw_df = pd.read_csv(file_path, dtype=str, keep_default_na=True)
    df = normalize_columns(raw_df)

    ensure_required_columns(df, REQUIRED_COLUMNS)

    initial_count = len(df)
    df["text"] = clean_text_series(df["text"])
    df["post_id"] = clean_text_series(df["post_id"])
    df["platform"] = clean_text_series(df["platform"]).str.lower()
    df["channel_title"] = clean_text_series(df["channel_title"])
    df["channel_username"] = clean_text_series(df["channel_username"])

    df["timestamp"] = normalize_timestamp_series(df["timestamp"])
    numeric_columns = ["views", "forwards", "reactions", "replies"]
    for col in numeric_columns:
        if col in df.columns:
            df[col] = safe_numeric(df[col], fill_value=0)

    df = df.replace({"": pd.NA, "nan": pd.NA})
    df = df.dropna(subset=["post_id", "text", "timestamp"]).copy()
    df = df.drop_duplicates(subset=["post_id", "text", "timestamp"]).copy()
    df = df.sort_values("timestamp", kind="mergesort").reset_index(drop=True)

    duplicate_records = initial_count - len(df)
    valid_records = len(df)
    invalid_records = max(initial_count - valid_records, 0)

    summary = make_validation_summary(
        df,
        REQUIRED_COLUMNS,
        dropped_records=invalid_records,
        duplicate_records=duplicate_records,
    )
    summary["source_file"] = str(file_path)
    summary["platform"] = "telegram"
    summary["record_count"] = valid_records
    summary["valid_records"] = valid_records
    summary["invalid_records"] = invalid_records

    cleaned_data = df.to_dict(orient="records")
    cleaned_data = [
        {
            key: value.isoformat() if hasattr(value, "isoformat") else value
            for key, value in row.items()
        }
        for row in cleaned_data
    ]

    return {
        "platform": "telegram",
        "source_file": str(file_path),
        "total_records": valid_records,
        "data": cleaned_data,
        "validation": summary,
    }
