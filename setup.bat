@echo off
setlocal enabledelayedexpansion

echo.
echo ########################################################
echo #         EdgeMind v3.2: PROFESSIONAL ANALYTICS        #
echo ########################################################
echo.

:: Validation
python --version >nul 2>&1 || (echo [X] Python Missing! & pause & exit /b)
node --version >nul 2>&1 || (echo [X] Node.js Missing! & pause & exit /b)

echo [1/4] Upgrading Backend Infrastructure (fastapi, psutil)...
pip install -r requirements.txt

echo.
echo [2/4] Regenerating Premium Frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/4] Pulling Neural Weights (Optimized Q4)...
echo --- TinyLlama (Live Ready)...
ollama pull tinyllama
echo --- Phi-2 (Live Ready)...
ollama pull phi
echo --- Mistral (Offline stress-test)...
ollama pull mistral

echo.
echo [4/4] Project v3.2 HUD Enabled!

echo.
echo ########################################################
echo #   HOW TO LAUNCH:                                     #
echo #   1. Backend: python -m backend.main                 #
echo #   2. Frontend: cd frontend ^&^& npm start              #
echo ########################################################
echo.
pause
