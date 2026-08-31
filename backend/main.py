from fastapi import FastAPI

app = FastAPI(title="NetraAI API")


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