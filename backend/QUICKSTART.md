# NetraAI Backend - Quick Start Guide

## 🚀 Setup (First Time Only)

### Option 1: Using Setup Script (Recommended)

**Windows (PowerShell):**
```powershell
cd backend
.\setup.ps1
```

**macOS/Linux:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

**Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## 🏃 Running the Backend

### Make sure you're in the backend directory and virtual environment is activated

**Windows:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
python run.py
```

**Alternative (using uvicorn directly):**
```bash
uvicorn app.main:app --reload
```

## 🌐 Accessing the API

Once running, access:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 📡 Test the Endpoints

### Using Browser
1. Open http://localhost:8000/api/docs
2. Click on any endpoint
3. Click "Try it out"
4. Click "Execute"

### Using curl

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Pipeline Status:**
```bash
curl http://localhost:8000/api/pipeline/status
```

**Platforms:**
```bash
curl http://localhost:8000/api/platforms
```

### Using PowerShell (Windows)

**Health Check:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/api/health | Select-Object -Expand Content
```

**Pipeline Status:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/api/pipeline/status | Select-Object -Expand Content
```

## 🔧 Common Issues

### "python is not recognized"
- Install Python 3.10+ from python.org
- Make sure Python is added to PATH during installation

### "pip is not recognized"
- Use `python -m pip` instead of `pip`
- Or reinstall Python with pip included

### "Port 8000 is already in use"
- Change port in `.env`: `PORT=8080`
- Or kill the process using port 8000

**Windows:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:8000 | xargs kill -9
```

### "Cannot activate virtual environment"

**Windows:**
```powershell
# If you get execution policy error
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### CORS errors from frontend
- Make sure backend is running
- Check `.env` file has correct `CORS_ORIGINS`
- Default includes: `http://localhost:3000,http://localhost:3001,http://localhost:5173`

## 📝 Development Tips

### Auto-reload on code changes
The `--reload` flag is enabled by default, so FastAPI will automatically restart when you change code.

### View logs
All logs appear in the terminal where you ran `python run.py`

### Stop the server
Press `Ctrl+C` in the terminal

### Deactivate virtual environment
```bash
deactivate
```

## 🧪 Testing Imports

Quick test to verify everything is set up correctly:
```bash
python test_imports.py
```

## 📚 Next Steps

After the backend is running:
1. ✅ Verify all three endpoints work
2. ✅ Connect frontend to backend
3. ⏳ Add dataset processing services
4. ⏳ Implement analytics endpoints
5. ⏳ Add search functionality
6. ⏳ Integrate AI agent

## 💡 Remember

- Always activate virtual environment before running
- Keep backend running while testing frontend
- Check API docs at `/api/docs` for endpoint details
- This is Phase 1 - uses historical data, not live APIs

---

Need help? Check the full README.md or API documentation.
