@echo off
title Arogya Backend Server
color 0A

echo.
echo  ==========================================
echo   AROGYA BACKEND SERVER
echo  ==========================================
echo.

:: Go to the project backend directory
cd /d "%~dp0src\backend\Arogya"

:: Find the right Python (try .venv2 first, then .venv)
set PYTHON=
if exist "..\\.venv2\Scripts\python.exe" (
    set PYTHON=..\.venv2\Scripts\python.exe
    echo  [OK] Using .venv2
) else if exist "..\\.venv\Scripts\python.exe" (
    set PYTHON=..\.venv\Scripts\python.exe
    echo  [OK] Using .venv
) else (
    echo  [WARN] No venv found - trying system Python
    set PYTHON=python
)

echo.
echo  ==========================================
echo   RUNNING MIGRATIONS
echo  ==========================================
%PYTHON% manage.py migrate
echo.

echo  ==========================================
echo   SERVER INFO
echo  ==========================================
echo.
echo   Local   : http://127.0.0.1:8000
echo   Network : http://192.168.100.40:8000
echo   Admin   : http://127.0.0.1:8000/admin/
echo.
echo   For Expo Go on PHONE use:
echo   http://192.168.100.40:8000
echo.
echo   Make sure your phone and PC are on
echo   the SAME WiFi network!
echo  ==========================================
echo.
echo  Starting... Press Ctrl+C to stop.
echo.

%PYTHON% manage.py runserver 0.0.0.0:8000

echo.
echo  Server stopped.
pause
