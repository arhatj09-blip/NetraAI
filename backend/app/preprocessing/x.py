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
    "post_id",
    "text",
    "timestamp",
    "user_id",
    "username",
]


def preprocess_x_dataset(file_path: str | Path) -> Dict[str, Any]:
    file_path = Path(file_path)
    raw_df = pd.read_csv(file_path, dtype=str, keep_default_na=True)
    df = normalize_columns(raw_df)

    ensure_required_columns(df, REQUIRED_COLUMNS)

    initial_count = len(df)
    df["text"] = clean_text_series(df["text"])
    df["post_id"] = clean_text_series(df["post_id"])
    df["username"] = clean_text_series(df["username"])
    df["user_id"] = clean_text_series(df["user_id"])
    df["timestamp"] = normalize_timestamp_series(df["timestamp"])

    numeric_columns = [
        "likes",
        "replies",
        "retweets",
        "followers_count",
        "following_count",
    ]
    for col in numeric_columns:
        if col in df.columns:
            df[col] = safe_numeric(df[col], fill_value=0)

    df = df.replace({"": pd.NA, "nan": pd.NA})

    post_id_or_text_missing = int(df[["post_id", "text"]].isna().any(axis=1).sum())
    timestamp_missing = int(df["timestamp"].isna().sum())

    df = df.dropna(subset=["post_id", "text"]).copy()
    df = df.drop_duplicates(subset=["post_id", "text"]).copy()
    df = df.sort_values(by=["timestamp", "post_id"], ascending=[True, True], kind="mergesort").reset_index(drop=True)

    duplicate_records = initial_count - len(df) - post_id_or_text_missing
    valid_records = len(df)
    invalid_records = max(initial_count - valid_records - timestamp_missing, 0)

    summary = make_validation_summary(
        df,
        REQUIRED_COLUMNS,
        dropped_records=invalid_records,
        duplicate_records=duplicate_records,
    )
    summary["source_file"] = str(file_path)
    summary["platform"] = "x"
    summary["record_count"] = valid_records
    summary["valid_records"] = valid_records
    summary["invalid_records"] = invalid_records
    summary["warnings"] = {"missing_timestamp": timestamp_missing}
    summary["rejected_reasons"] = {
        "missing_post_id_or_text": post_id_or_text_missing,
        "duplicate_rows": duplicate_records,
    }

    cleaned_data = df.to_dict(orient="records")
    cleaned_data = [
        {
            key: value.isoformat() if hasattr(value, "isoformat") else value
            for key, value in row.items()
        }
        for row in cleaned_data
    ]

    return {
        "platform": "x",
        "source_file": str(file_path),
        "total_records": valid_records,
        "data": cleaned_data,
        "validation": summary,
    }
