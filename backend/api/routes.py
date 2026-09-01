from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
def status():
    return {
        "status": "API is working",
        "service": "NetraAI"
    }