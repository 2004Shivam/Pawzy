@echo off
echo 🐾 Starting Pawzy in development mode...
echo.

:: Change to the pawzy-ui directory and start the dev server
cd /d "%~dp0app_build\pawzy-ui"
npm run dev
