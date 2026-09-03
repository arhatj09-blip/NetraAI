from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from app.preprocessing.telegram import preprocess_telegram_dataset
from app.preprocessing.x import preprocess_x_dataset

DATA_ROOT = Path(__file__).resolve().parents[3] / "data"


@lru_cache(maxsize=8)
def get_processed_dataset(platform: str):
    platform_key = platform.lower().strip()
    project_root = Path(__file__).resolve().parents[3]
    dataset_map = {
        "telegram": project_root / "data" / "telegram" / "netra_telegram_100_sample.csv",
        "x": project_root / "data" / "x" / "netra_x_100_sample.csv",
    }

    if platform_key not in dataset_map:
        raise ValueError(f"Unsupported platform '{platform}'. Supported platforms: telegram, x")

    file_path = dataset_map[platform_key]
    if platform_key == "telegram":
        return preprocess_telegram_dataset(file_path)
    return preprocess_x_dataset(file_path)


def refresh_processed_datasets() -> dict[str, int]:
    """Reload supported datasets and return their processed record counts."""
    get_processed_dataset.cache_clear()
    return {
        platform: int(get_processed_dataset(platform)["total_records"])
        for platform in ("x", "telegram")
    }
