@echo off
echo ==========================================
echo       LinguaLate Local Launcher
echo ==========================================

echo.
echo [1/4] Pulling latest changes from git...
git pull

echo.
echo [2/4] Installing dependencies...
call npm install

echo.
echo [3/4] Opening browser...
start http://localhost:5173

echo.
echo [4/4] Starting development server...
echo Press Ctrl+C to stop the server.
npm run dev
