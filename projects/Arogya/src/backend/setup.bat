@echo off
REM Arogya Backend Setup Script for Windows
REM This script sets up the Django backend for development on Windows

setlocal enabledelayedexpansion

color 0A
echo.
echo =====================================
echo   Arogya Backend Setup - Windows
echo =====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo.
echo Setting up in: %SCRIPT_DIR%
echo.

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo [*] Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        color 0C
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

REM Activate virtual environment
echo.
echo [*] Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    color 0C
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated

REM Upgrade pip
echo.
echo [*] Upgrading pip...
python -m pip install --upgrade pip setuptools wheel >nul 2>&1
echo [OK] pip upgraded

REM Install requirements
echo.
echo [*] Installing dependencies...
if exist "requirements.txt" (
    pip install -r requirements.txt
    echo [OK] Dependencies installed
) else (
    color 0E
    echo [WARNING] requirements.txt not found
    color 0A
)

REM Navigate to Django project directory
cd /d "%SCRIPT_DIR%Arogya"
if errorlevel 1 (
    color 0C
    echo ERROR: Could not navigate to Arogya directory
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo.
    echo [*] Creating .env file...
    (
        echo DEBUG=True
        echo SECRET_KEY=django-insecure-dev-key-change-in-production
        echo ALLOWED_HOSTS=localhost,127.0.0.1,.herokuapp.com
        echo DATABASE_URL=sqlite:///db.sqlite3
        echo CLOUDINARY_CLOUD_NAME=your_cloud_name
        echo CLOUDINARY_API_KEY=your_api_key
        echo CLOUDINARY_API_SECRET=your_api_secret
    ) > .env
    echo [OK] .env file created (update with your credentials^)
) else (
    echo [OK] .env file already exists
)

REM Run migrations
echo.
echo [*] Running database migrations...
python manage.py makemigrations
if errorlevel 1 (
    color 0C
    echo ERROR: makemigrations failed
    pause
    exit /b 1
)

python manage.py migrate
if errorlevel 1 (
    color 0C
    echo ERROR: migrate failed
    pause
    exit /b 1
)
echo [OK] Database migrations completed

REM Create superuser
echo.
echo [*] Creating superuser...
echo [INFO] You can skip by pressing Ctrl+C
python manage.py createsuperuser
echo [OK] Superuser setup complete

REM Collect static files
echo.
echo [*] Collecting static files...
python manage.py collectstatic --noinput >nul 2>&1
echo [OK] Static files collected

echo.
color 0B
echo =====================================
echo   Setup Complete!
echo =====================================
color 0A
echo.
echo To start the development server:
echo.
echo   1. Activate virtual environment:
echo      .venv\Scripts\activate.bat
echo.
echo   2. Navigate to project:
echo      cd Arogya
echo.
echo   3. Run the server:
echo      python manage.py runserver
echo.
echo Admin interface: http://localhost:8000/admin/
echo.
echo API Endpoints:
echo   http://localhost:8000/accounts/
echo   http://localhost:8000/checkins/
echo   http://localhost:8000/doctors/
echo   http://localhost:8000/chat/
echo   http://localhost:8000/alerts/
echo   http://localhost:8000/medicines/
echo   http://localhost:8000/reports/
echo.
pause
