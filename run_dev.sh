#!/bin/bash
# Pawzy — Development Launcher
# Starts both the Python backend and Electron frontend in parallel.
# Usage: bash run_dev.sh

set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🐾 Starting Pawzy in development mode..."
echo ""

# ─── Kill any lingering Pawzy processes ──────────────────────────────────────
echo "🧹 Cleaning up any old Pawzy processes..."
pkill -f "python3.*main.py" 2>/dev/null || true
pkill -f "electron"         2>/dev/null || true
# Wait for port 8765 to be released
for i in 1 2 3; do
  fuser -k 8765/tcp 2>/dev/null || true
  sleep 0.5
done
echo "   Done."
echo ""

# ─── Python backend ──────────────────────────────────────────────────────────
echo "▶ Starting pawzy-core (Python backend)..."
cd "$BASE_DIR/app_build/pawzy-core"
python3 main.py &
PYTHON_PID=$!
echo "  Python PID: $PYTHON_PID"
echo ""

# Give Python a moment to start the WebSocket server
sleep 2

# ─── Electron + Vite frontend ────────────────────────────────────────────────
echo "▶ Starting pawzy-ui (Electron + Vite)..."
cd "$BASE_DIR/app_build/pawzy-ui"
NODE_ENV=development npx electron . &
ELECTRON_PID=$!
echo "  Electron PID: $ELECTRON_PID"
echo ""

echo "────────────────────────────────────────────"
echo "🐾 Pawzy is running!"
echo "   Backend:  ws://localhost:8765"
echo "   Tray:     Check your system tray"
echo "   Press Ctrl+C to stop both processes."
echo "────────────────────────────────────────────"
echo ""

# Wait and cleanup on exit
trap "echo ''; echo 'Stopping Pawzy...'; kill $PYTHON_PID $ELECTRON_PID 2>/dev/null; exit 0" EXIT
wait $PYTHON_PID $ELECTRON_PID
