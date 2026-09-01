from fastapi import APIRouter
from backend.models.twitter import TwitterAnalysis

router = APIRouter()


@router.get("/status")
def status():
    return {
        "status": "API is working",
        "service": "NetraAI"
    }


@router.post("/twitter/analyze")
def analyze_twitter(data: TwitterAnalysis):
    return {
        "status": "success",
        "message": "Twitter analysis received successfully",
        "data": data
    }