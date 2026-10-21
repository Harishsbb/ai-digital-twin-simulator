@echo off
title AI Digital Twin Simulator - Launcher
cd /d "%~dp0"

echo ==========================================================
echo   Launching AI Digital Twin Simulator
echo   1. Backend API (Port 8000)
echo   2. Frontend UI (Port 5173)
echo ==========================================================

start "Digital Twin - Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe run.py"
start "Digital Twin - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting in separate windows:
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo - 3D Digital Twin UI: http://localhost:5173/digital-twin
echo.
timeout /t 3 >nul
exit
