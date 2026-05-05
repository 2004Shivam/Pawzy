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
import os

# Force UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

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

    # 3. Start rule engine
    engine = RuleEngine()

    # 4. Start WebSocket server
    ws = WsServer()
    ws.start()

    # 5. Launch System Tray (blocks main thread)
    tray = PawzyTray()

    # Handle Ctrl+C gracefully
    def signal_handler(sig, frame):
        print("\n[Main] Shutdown signal received.")
        tray.stop()
        os._exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    print("🐾 Pawzy is running. Check your system tray!")
    tray.run()


if __name__ == "__main__":
    main()
