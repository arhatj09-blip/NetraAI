from pathlib import Path

from app.preprocessing.telegram import preprocess_telegram_dataset
from app.preprocessing.x import preprocess_x_dataset


BASE_DIR = Path(__file__).resolve().parents[1]


def test_telegram_preprocessing_returns_summary_and_records():
    result = preprocess_telegram_dataset(BASE_DIR.parent / "data" / "telegram" / "netra_telegram_100_sample.csv")

    assert result["total_records"] > 0
    assert "validation" in result
    assert "data" in result
    assert "available_columns" in result["validation"]
    assert result["validation"]["total_records"] == result["total_records"]


def test_x_preprocessing_returns_summary_and_records():
    result = preprocess_x_dataset(BASE_DIR.parent / "data" / "x" / "netra_x_100_sample.csv")

    assert result["total_records"] > 0
    assert "validation" in result
    assert "data" in result
    assert "available_columns" in result["validation"]
    assert result["validation"]["total_records"] == result["total_records"]
