from fastapi import FastAPI
from backend.api.routes import router

app = FastAPI(title="NetraAI API")

app.include_router(router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "NetraAI backend is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NetraAI backend"
    }