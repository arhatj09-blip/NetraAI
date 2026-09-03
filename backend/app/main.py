"""
NetraAI Backend - Main FastAPI Application
Phase 1 Prototype: Historical Data Processing & Analytics
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import os
from dotenv import load_dotenv

from app.api import datasets, health, network, pipeline, platforms
from app.services.ingestion_service import refresh_now, run_ingestion_worker

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle"""
    print("🚀 NetraAI Backend starting...")
    print(f"📊 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔗 API Base URL: {os.getenv('API_BASE_URL', 'http://localhost:8000')}")
    stop_event = asyncio.Event()
    await asyncio.to_thread(refresh_now)
    worker_task = asyncio.create_task(run_ingestion_worker(stop_event))
    app.state.ingestion_stop_event = stop_event
    app.state.ingestion_worker = worker_task
    yield
    stop_event.set()
    await worker_task
    print("👋 NetraAI Backend shutting down...")


# Initialize FastAPI application
app = FastAPI(
    title="NetraAI API",
    description="AI-driven social media analytics system - Phase 1 Prototype",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])
app.include_router(platforms.router, prefix="/api", tags=["Platforms"])
app.include_router(datasets.router, prefix="/api", tags=["Datasets"])
app.include_router(network.router, prefix="/api", tags=["Network"])


@app.get("/")
async def root():
    """Root endpoint redirect"""
    return {
        "message": "NetraAI API is running",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
