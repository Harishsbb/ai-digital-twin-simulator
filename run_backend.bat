@echo off
title AI Digital Twin Simulator - Backend
cd /d "%~dp0backend"
echo Starting AI Digital Twin Backend Server...
.\venv\Scripts\python.exe run.py
pause
