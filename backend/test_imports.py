"""
Quick test to verify all imports work correctly
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

print("Testing imports...")

try:
    from app.main import app
    print("✅ Main app imports successfully")
    
    from app.api import health, pipeline, platforms
    print("✅ API routers import successfully")
    
    from app.models.responses import HealthResponse, PipelineStatusResponse, PlatformResponse
    print("✅ Models import successfully")
    
    from app.config import settings
    print("✅ Config imports successfully")
    
    print("\n🎉 All imports successful!")
    print("Backend structure is ready.")
    
except Exception as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
