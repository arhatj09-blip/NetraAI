# NetraAI Backend

**Phase 1 Prototype** - AI-driven social media analytics system

## Overview

NetraAI is a social media analytics platform that processes and analyzes data from X (Twitter), Reddit, and Telegram. This Phase 1 prototype uses **historical datasets** rather than live social media APIs, simulating a near-real-time pipeline for demonstration purposes.

## Tech Stack

- **Framework**: FastAPI
- **Python Version**: 3.10+
- **Data Processing**: Pandas, NumPy
- **Environment Management**: python-dotenv

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API route handlers
│   │   ├── health.py        # Health check endpoint
│   │   ├── pipeline.py      # Pipeline status endpoint
│   │   └── platforms.py     # Platforms endpoint
│   ├── models/              # Pydantic models
│   │   └── responses.py     # API response models
│   ├── services/            # Business logic (to be expanded)
│   └── utils/               # Helper functions (to be expanded)
├── data/                    # Historical datasets
│   ├── x/
│   ├── reddit/
│   └── telegram/
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Python 3.10 or higher
- pip (Python package installer)

### Installation

1. **Navigate to the backend directory**

```bash
cd backend
```

2. **Create a virtual environment**

```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

3. **Activate the virtual environment**

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

4. **Install dependencies**

```bash
pip install -r requirements.txt
```

5. **Configure environment variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (optional for Phase 1)
```

### Running the Backend

Start the FastAPI server using Uvicorn:

```bash
# From the backend directory
python -m uvicorn app.main:app --reload

# Or simply
python app/main.py
```

The backend will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Running with Custom Port

```bash
# Set PORT in .env or use command line
uvicorn app.main:app --reload --port 8080
```

## Available Endpoints

### Health Check
```
GET /api/health
```
Returns the health status of the backend.

**Response:**
```json
{
  "status": "healthy",
  "message": "NetraAI backend is running",
  "timestamp": "2026-08-28T10:30:00Z"
}
```

### Pipeline Status
```
GET /api/pipeline/status
```
Returns the current pipeline processing status.

**Response:**
```json
{
  "status": "operational",
  "message": "Continuous Ingestion Engine v2.4",
  "last_ingestion": "2026-08-28T10:15:00Z",
  "next_refresh": "2026-08-28T10:38:42Z",
  "records_processed": 274392,
  "analytics_updated": "2026-08-28T10:25:00Z",
  "health_index": 99.8,
  "active_platforms": ["X", "Reddit", "Telegram"],
  "platform_records": {
    "X": 124392,
    "Reddit": 87201,
    "Telegram": 62799
  }
}
```

### Platforms
```
GET /api/platforms
```
Returns the list of supported platforms.

**Response:**
```json
[
  {
    "id": "x",
    "name": "X (Twitter)",
    "description": "Real-time sentiment tracking and trending topic analysis",
    "icon": "twitter",
    "color": "#3b82f6",
    "active": true,
    "record_count": 124392
  },
  ...
]
```

## Current Limitations

### Phase 1 Scope

- ✅ Basic API structure and health checks
- ✅ Pipeline status endpoint (placeholder values)
- ✅ Platform information endpoint
- ⏳ **Dataset processing** (awaiting finalized schemas)
- ⏳ **Analytics endpoints** (to be implemented)
- ⏳ **Search functionality** (to be implemented)
- ⏳ **AI agent integration** (to be implemented)

### Important Notes

- **No Live APIs**: This prototype does NOT connect to live X, Reddit, or Telegram APIs
- **Historical Data**: Uses prepared/historical datasets for analysis
- **Simulated Pipeline**: Pipeline status simulates batch processing
- **No Authentication**: Not implemented in Phase 1 (can be added if needed)
- **Dataset Schemas**: Not finalized yet; processing services will be added once schemas are confirmed

## Development

### Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

### Code Style

Follow PEP 8 guidelines. Format code using:

```bash
# Install black (optional)
pip install black

# Format code
black app/
```

### Adding New Endpoints

1. Create a new router file in `app/api/`
2. Define your endpoint functions
3. Add response models in `app/models/responses.py`
4. Include the router in `app/main.py`

Example:
```python
# app/api/analytics.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/analytics/{platform}")
async def get_analytics(platform: str):
    # Implementation here
    pass
```

## Future Enhancements

Planned for upcoming phases:

- Dataset processing and normalization
- Sentiment and emotion analysis
- Topic and trend detection
- Search and filtering capabilities
- Date-range filtering
- AI agent integration for Q&A
- Caching for improved performance
- Advanced analytics endpoints

## Troubleshooting

### Port Already in Use

```bash
# Find and kill the process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### CORS Issues

If frontend cannot connect, verify:
1. Backend is running
2. CORS_ORIGINS in `.env` includes your frontend URL
3. Frontend is using the correct backend URL

### Import Errors

Ensure you're running from the backend directory and virtual environment is activated:
```bash
cd backend
source venv/bin/activate  # or appropriate command for your OS
python app/main.py
```

## Support

For questions or issues:
1. Check the interactive API docs at `/api/docs`
2. Review endpoint responses for error details
3. Verify environment configuration in `.env`

## License

Phase 1 Prototype - Internal Development

---

**Built for SIH 2026**
