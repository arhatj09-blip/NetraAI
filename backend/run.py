"""
Quick start script for NetraAI Backend
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    print("=" * 60)
    print("🚀 Starting NetraAI Backend")
    print("=" * 60)
    print(f"📍 API URL: http://localhost:{port}")
    print(f"📚 Docs: http://localhost:{port}/api/docs")
    print(f"📖 ReDoc: http://localhost:{port}/api/redoc")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
