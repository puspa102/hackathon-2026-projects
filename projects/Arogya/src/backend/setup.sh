#!/bin/bash

# Arogya Backend Setup Script
# This script sets up the Django development environment

set -e

echo "🏥 Arogya Backend Setup"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed. Please install Python 3.10 or higher.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"

# Navigate to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

echo ""
echo "📁 Setting up in: $SCRIPT_DIR"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "🔨 Creating virtual environment..."
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo ""
echo "🚀 Activating virtual environment..."
source .venv/bin/activate || . .venv/Scripts/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Upgrade pip
echo ""
echo "📦 Upgrading pip..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
echo -e "${GREEN}✓ pip upgraded${NC}"

# Install requirements
echo ""
echo "📥 Installing dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ requirements.txt not found${NC}"
fi

# Navigate to Django project
cd Arogya || exit 1

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,.herokuapp.com
DATABASE_URL=sqlite:///db.sqlite3
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF
    echo -e "${GREEN}✓ .env file created (please update with your credentials)${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate
echo -e "${GREEN}✓ Database migrations completed${NC}"

# Create superuser
echo ""
echo "👤 Creating superuser..."
echo -e "${YELLOW}ℹ  You can skip this by pressing Ctrl+C${NC}"
python manage.py createsuperuser --noinput 2>/dev/null || python manage.py createsuperuser || true
echo -e "${GREEN}✓ Superuser setup complete${NC}"

# Collect static files
echo ""
echo "📊 Collecting static files..."
python manage.py collectstatic --noinput > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Static files collected${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "🚀 To start the development server, run:"
echo -e "${YELLOW}   source .venv/bin/activate${NC}"
echo -e "${YELLOW}   cd Arogya${NC}"
echo -e "${YELLOW}   python manage.py runserver${NC}"
echo ""
echo "📚 Admin interface will be available at:"
echo -e "${YELLOW}   http://localhost:8000/admin/${NC}"
echo ""
echo "📖 API endpoints:"
echo -e "${YELLOW}   http://localhost:8000/accounts/${NC}"
echo -e "${YELLOW}   http://localhost:8000/checkins/${NC}"
echo -e "${YELLOW}   http://localhost:8000/doctors/${NC}"
echo -e "${YELLOW}   http://localhost:8000/chat/${NC}"
echo -e "${YELLOW}   http://localhost:8000/alerts/${NC}"
echo -e "${YELLOW}   http://localhost:8000/medicines/${NC}"
echo -e "${YELLOW}   http://localhost:8000/reports/${NC}"
echo ""
