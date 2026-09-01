#!/bin/bash
# Setup script for NetraAI Backend (macOS/Linux)

echo "========================================"
echo "NetraAI Backend Setup"
echo "========================================"

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. You can edit it with your configuration."
else
    echo "⚠️  .env file already exists. Skipping..."
fi

echo ""
echo "========================================"
echo "✅ Setup complete!"
echo "========================================"
echo ""
echo "To start the backend:"
echo "  1. Activate the virtual environment:"
echo "     source venv/bin/activate"
echo "  2. Run the server:"
echo "     python run.py"
echo ""
echo "API will be available at: http://localhost:8000"
echo "Docs available at: http://localhost:8000/api/docs"
echo "========================================"
