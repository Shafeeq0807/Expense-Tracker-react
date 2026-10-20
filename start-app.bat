@echo off
REM Starts the API (port 5000) and the React app (port 3000) in two windows.
REM Requires MySQL to be running (Windows service "MySQL80").
cd /d "%~dp0"
start "PocketPal API" cmd /k "cd server && npm start"
start "PocketPal App" cmd /k "npm start"
echo Opening http://localhost:3000 in a few seconds...
timeout /t 12 >nul
start http://localhost:3000
