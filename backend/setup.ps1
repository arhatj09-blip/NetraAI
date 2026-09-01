# Setup script for NetraAI Backend (Windows PowerShell)

Write-Host "========================================"
Write-Host "NetraAI Backend Setup"
Write-Host "========================================"

# Check Python version
Write-Host "Checking Python version..."
python --version

# Create virtual environment
Write-Host "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements.txt

# Copy .env.example to .env if it doesn't exist
if (-Not (Test-Path .env)) {
    Write-Host "Creating .env file..."
    Copy-Item .env.example .env
    Write-Host "✅ .env file created. You can edit it with your configuration."
} else {
    Write-Host "⚠️  .env file already exists. Skipping..."
}

Write-Host ""
Write-Host "========================================"
Write-Host "✅ Setup complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "To start the backend:"
Write-Host "  1. Activate the virtual environment:"
Write-Host "     .\venv\Scripts\Activate.ps1"
Write-Host "  2. Run the server:"
Write-Host "     python run.py"
Write-Host ""
Write-Host "API will be available at: http://localhost:8000"
Write-Host "Docs available at: http://localhost:8000/api/docs"
Write-Host "========================================"
