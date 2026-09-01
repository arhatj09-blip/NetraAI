from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from app.preprocessing.telegram import preprocess_telegram_dataset
from app.preprocessing.x import preprocess_x_dataset

BASE_DIR = Path(__file__).resolve().parents[2] / "data"


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
