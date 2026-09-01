# NetraAI Backend Architecture

## Overview

NetraAI backend is built with FastAPI, following a clean, modular architecture suitable for a hackathon prototype while being extensible for future enhancements.

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI app & configuration
│   ├── config.py            # Settings management
│   │
│   ├── api/                 # API endpoints (controllers)
│   │   ├── __init__.py
│   │   ├── health.py        # Health check endpoint
│   │   ├── pipeline.py      # Pipeline status endpoint
│   │   └── platforms.py     # Platforms information
│   │
│   ├── models/              # Data models (Pydantic)
│   │   ├── __init__.py
│   │   └── responses.py     # API response schemas
│   │
│   ├── services/            # Business logic layer
│   │   └── __init__.py      # (Empty - ready for future)
│   │
│   └── utils/               # Utility functions
│       └── __init__.py      # (Empty - ready for future)
│
├── data/                    # Historical datasets (gitignored)
│   ├── x/
│   ├── reddit/
│   └── telegram/
│
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
├── .env                    # Actual config (gitignored)
├── run.py                  # Quick start script
├── test_imports.py         # Import verification
├── setup.sh                # Setup script (Unix)
├── setup.ps1               # Setup script (Windows)
├── README.md               # Full documentation
├── QUICKSTART.md           # Quick reference
└── ARCHITECTURE.md         # This file
```

## Layer Responsibilities

### 1. API Layer (`app/api/`)
**Purpose**: Handle HTTP requests and responses

- Define API endpoints
- Validate request parameters
- Call service layer for business logic
- Format and return responses
- Handle HTTP-specific concerns (status codes, headers)

**Example**:
```python
@router.get("/health")
async def health_check():
    return HealthResponse(...)
```

### 2. Models Layer (`app/models/`)
**Purpose**: Define data structures

- Pydantic models for request/response validation
- Type safety and automatic documentation
- Data serialization/deserialization
- Input validation

**Example**:
```python
class PlatformResponse(BaseModel):
    id: str
    name: str
    active: bool
```

### 3. Services Layer (`app/services/`)
**Purpose**: Business logic and data processing

- Dataset loading and processing
- Analytics calculations (sentiment, trends, etc.)
- Data normalization across platforms
- Caching and optimization
- Integration with external services

**Future structure**:
```
services/
├── data_processor.py      # Dataset loading & processing
├── analytics.py           # Analytics calculations
├── search.py              # Search functionality
└── ai_agent.py           # AI agent integration
```

### 4. Utils Layer (`app/utils/`)
**Purpose**: Helper functions and common utilities

- Date/time formatting
- Data validation helpers
- File I/O utilities
- Common transformations

**Future structure**:
```
utils/
├── date_utils.py         # Date formatting & parsing
├── validators.py         # Custom validators
└── helpers.py           # General helpers
```

## Configuration Management

### Environment Variables (`.env`)
```
ENVIRONMENT=development
PORT=8000
CORS_ORIGINS=http://localhost:3000,...
DATA_PATH_X=../data/x
```

### Settings (`app/config.py`)
- Centralized configuration using Pydantic Settings
- Type-safe environment variable access
- Easy to extend with new settings

```python
from app.config import settings
print(settings.port)  # 8000
```

## API Design Principles

### 1. RESTful Conventions
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs: `/api/platforms`, `/api/analytics/{platform}`
- Consistent response structure

### 2. Prefix Structure
All endpoints use `/api` prefix:
- `/api/health`
- `/api/platforms`
- `/api/pipeline/status`

### 3. Versioning (Future)
When breaking changes needed:
- `/api/v1/platforms`
- `/api/v2/platforms`

### 4. Response Format
Consistent JSON structure:
```json
{
  "field1": "value",
  "field2": 123,
  "timestamp": "2026-08-28T10:30:00Z"
}
```

## CORS Configuration

Configured in `main.py`:
- Allows specified origins (frontend URLs)
- Supports credentials
- Allows all methods and headers
- Easy to modify in `.env`

## Data Flow (Future Implementation)

```
User Request
    ↓
API Endpoint (api/)
    ↓
Service Layer (services/)
    ↓
Data Processing (pandas)
    ↓
Response Model (models/)
    ↓
JSON Response
```

## Error Handling (To Be Implemented)

Future error handling structure:
```python
# Custom exceptions
class DataNotFoundError(Exception): ...
class ProcessingError(Exception): ...

# Error handlers in main.py
@app.exception_handler(DataNotFoundError)
async def handle_not_found(request, exc):
    return JSONResponse(status_code=404, content={...})
```

## Testing Strategy (Future)

### Unit Tests
```
tests/
├── test_api/
│   ├── test_health.py
│   ├── test_pipeline.py
│   └── test_platforms.py
├── test_services/
│   └── test_analytics.py
└── test_utils/
    └── test_helpers.py
```

### Integration Tests
- Test full API flows
- Mock external dependencies
- Test database operations (if added)

## Performance Considerations

### Current Phase 1
- Simple in-memory operations
- No caching needed yet
- Direct file reads acceptable

### Future Optimizations
- Add caching for expensive operations (Redis/in-memory)
- Implement pagination for large results
- Use async file I/O for dataset loading
- Consider database for faster queries
- Add response compression

## Security Considerations

### Current Phase 1
- CORS configured for local development
- No authentication (not needed yet)
- Environment variables for sensitive data

### Future Security
- Add API key authentication if needed
- Rate limiting for public endpoints
- Input sanitization
- SQL injection prevention (if using DB)
- HTTPS in production

## Scalability Path

### Phase 1 (Current)
- Single FastAPI server
- In-memory processing
- Historical datasets

### Phase 2
- Add caching layer
- Optimize data loading
- Implement batch processing

### Phase 3+
- Database for structured data
- Background task queue (if needed)
- Load balancing (if traffic increases)
- Microservices (only if complexity requires)

## Adding New Features

### Example: Adding Analytics Endpoint

1. **Define Response Model** (`models/responses.py`)
```python
class AnalyticsResponse(BaseModel):
    platform: str
    sentiment: float
    trends: List[str]
```

2. **Create Service** (`services/analytics.py`)
```python
def calculate_sentiment(data):
    # Business logic here
    return sentiment_score
```

3. **Create API Endpoint** (`api/analytics.py`)
```python
@router.get("/analytics/{platform}")
async def get_analytics(platform: str):
    data = load_data(platform)
    sentiment = calculate_sentiment(data)
    return AnalyticsResponse(...)
```

4. **Register Router** (`main.py`)
```python
from app.api import analytics
app.include_router(analytics.router, prefix="/api")
```

## Dependencies

### Core Framework
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

### Data Processing
- **Pandas**: Dataset manipulation
- **NumPy**: Numerical operations

### Utilities
- **python-dotenv**: Environment variables
- **httpx**: HTTP client (for future use)

### Development
- **pytest**: Testing framework

## Development Workflow

1. **Activate virtual environment**
   ```bash
   source venv/bin/activate  # or .\venv\Scripts\Activate.ps1
   ```

2. **Make changes to code**

3. **Test locally**
   ```bash
   python run.py
   ```
   FastAPI auto-reloads on changes

4. **Test endpoints**
   - Use `/api/docs` for interactive testing
   - Or use curl/Postman

5. **Commit changes**
   ```bash
   git add .
   git commit -m "Add feature X"
   ```

## Key Design Decisions

### Why FastAPI?
- Modern Python web framework
- Automatic API documentation
- Fast performance (async support)
- Type hints and validation
- Easy to learn

### Why Not Django?
- Too heavy for this prototype
- Unnecessary ORM complexity
- FastAPI is faster and simpler

### Why No Database Yet?
- Phase 1 uses historical CSV/JSON files
- Database adds complexity
- Can add later if query performance requires it

### Why No Docker Yet?
- Simpler setup for students
- Python virtual env is sufficient
- Docker can be added for deployment

## Future Architecture Considerations

### When to Add Database
- If file reading becomes too slow
- If need complex queries
- If need transaction support
- If need multi-user state

### When to Add Caching
- If same queries repeated frequently
- If analytics calculations are expensive
- If API response time > 500ms

### When to Split Services
- If codebase > 10k lines
- If different components have different scaling needs
- If team grows beyond 5 people

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Pydantic Docs**: https://docs.pydantic.dev
- **Pandas Docs**: https://pandas.pydata.org/docs
- **Python Virtual Environments**: https://docs.python.org/3/tutorial/venv.html

---

**Keep it simple. Make it work. Then optimize.**
