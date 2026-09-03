import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import logging
from app.services.backfill_service import run_15k_ml_backfill

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

if __name__ == "__main__":
    print("=" * 60)
    print("STARTING M3 CORE 15,000-POST ML BACKFILL & ENRICHMENT")
    print("=" * 60)
    result = run_15k_ml_backfill()
    print("=" * 60)
    print("BACKFILL COMPLETED RESULT:")
    for k, v in result.items():
        print(f"  {k}: {v}")
    print("=" * 60)
