from __future__ import annotations

from fastapi import APIRouter, Query

from app.services.network_service import build_x_network

router = APIRouter()


@router.get("/x/network")
async def get_x_network(start_date: str | None = Query(default=None), end_date: str | None = Query(default=None)):
    """Return the real X interaction network and compressed replay events."""
    from app.services.data_service import DATA_ROOT

    return build_x_network(DATA_ROOT / "x" / "netra_x_100_sample.csv", start_date=start_date, end_date=end_date)