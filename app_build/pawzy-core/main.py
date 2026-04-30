"""
main.py — Pawzy entry point.

Boot sequence:
1. Initialize database
2. Start WindowTracker (background thread)
3. Start RuleEngine (subscribes to EventBus)
4. Start WsServer (background thread, listens for Electron)
5. Create PyQt6 app and SystemTray (blocks main thread)

Note: Break UI is handled entirely by Electron (lockWindow pill widget).
The PyQt6 LockOverlay has been removed — Electron is always connected.
"""

import sys
import signal

# Force UTF-8 output so emoji in print() don't crash on Windows (cp1252 terminals)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from PyQt6.QtWidgets import QApplication

import data_store
from window_tracker import WindowTracker
from rule_engine import RuleEngine
from ws_server import WsServer
from tray import PawzyTray


def main():
    print("🐾 Pawzy starting up...")

    # 1. Initialize persistence
    data_store.init_db()

    # 2. Start window tracker
    tracker = WindowTracker()
    tracker.start()

    # 3. Start rule engine (auto-subscribes to EventBus)
    engine = RuleEngine()

    # 4. Start WebSocket server
    ws = WsServer()
    ws.start()

    # 5. Launch PyQt6 app (needed for system tray)
    app = QApplication(sys.argv)
    app.setApplicationName("Pawzy")
    app.setQuitOnLastWindowClosed(False)

    # System tray
    tray = PawzyTray(app)

    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, lambda *_: app.quit())

    print("🐾 Pawzy is running. Check your system tray!")
    sys.exit(app.exec())


if __name__ == "__main__":
    main()

