from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List, Optional

import pandas as pd

logger = logging.getLogger(__name__)


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(col).strip().lower() for col in df.columns]
    return df


def clean_text_series(series: pd.Series) -> pd.Series:
    return series.map(lambda value: str(value).strip() if pd.notna(value) else pd.NA)


def safe_numeric(series: pd.Series, fill_value: Any = 0) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").fillna(fill_value)


def normalize_timestamp_series(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce", utc=True)


def make_validation_summary(
    df: pd.DataFrame,
    required_columns: Iterable[str],
    dropped_records: int = 0,
    duplicate_records: int = 0,
    extra: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    summary = {
        "total_records": int(len(df)),
        "valid_records": int(len(df)),
        "invalid_records": int(dropped_records),
        "duplicate_records": int(duplicate_records),
        "missing_values": {str(col): int(value) for col, value in df.isna().sum().items() if value > 0},
        "available_columns": df.columns.tolist(),
        "required_columns": list(required_columns),
    }

    missing_required = [col for col in required_columns if col not in df.columns]
    if missing_required:
        summary["missing_required_columns"] = missing_required
    else:
        summary["missing_required_columns"] = []

    timestamp_cols = [col for col in df.columns if "timestamp" in col]
    if timestamp_cols:
        range_data = {}
        for col in timestamp_cols:
            parsed = pd.to_datetime(df[col], errors="coerce", utc=True)
            valid = parsed.dropna()
            if not valid.empty:
                range_data[col] = {
                    "min": valid.min().isoformat(),
                    "max": valid.max().isoformat(),
                }
        summary["timestamp_range"] = range_data
    else:
        summary["timestamp_range"] = {}

    if extra:
        summary.update(extra)

    return summary


def ensure_required_columns(df: pd.DataFrame, required_columns: Iterable[str]) -> List[str]:
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")
    return list(required_columns)
