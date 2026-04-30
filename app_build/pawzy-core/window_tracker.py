"""
window_tracker.py — Cross-platform active window detection.
Polls every 1 second and emits events on the EventBus:
  - 'window_changed' { app_name, title, pid }
  - 'tick'           { app_name, elapsed_seconds }
"""

import platform
import sys
import threading
import time
from typing import Optional

from event_bus import bus

POLL_INTERVAL = 1.0  # seconds


# --------------------------------------------------------------------------- #
# Platform-specific active window detection                                    #
# --------------------------------------------------------------------------- #
def _get_active_window_windows() -> Optional[dict]:
    """Uses pywin32 + psutil to get the current foreground window."""
    try:
        import win32gui
        import win32process
        import psutil

        hwnd = win32gui.GetForegroundWindow()
        if not hwnd:
            return None
        title = win32gui.GetWindowText(hwnd)
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        try:
            proc = psutil.Process(pid)
            app_name = proc.name()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            app_name = "unknown"
        return {"app_name": app_name, "title": title, "pid": pid}
    except Exception as e:
        print(f"[WindowTracker] Windows error: {e}")
        return None


def _get_active_window_linux() -> Optional[dict]:
    """Uses ewmh + Xlib + psutil to get the current focused window."""
    try:
        from ewmh import EWMH
        import psutil

        ewmh = EWMH()
        win = ewmh.getActiveWindow()
        if win is None:
            return None
        title = ewmh.getWmName(win) or ""
        if isinstance(title, bytes):
            title = title.decode("utf-8", errors="replace")

        # Get PID via _NET_WM_PID
        pid_list = ewmh.getWmPid(win)
        pid = pid_list if isinstance(pid_list, int) else 0
        try:
            proc = psutil.Process(pid)
            app_name = proc.name()
        except (psutil.NoSuchProcess, psutil.AccessDenied, ValueError):
            app_name = title.split(" ")[0] if title else "unknown"

        return {"app_name": app_name, "title": title, "pid": pid}
    except Exception as e:
        print(f"[WindowTracker] Linux error: {e}")
        return None


def get_active_window() -> Optional[dict]:
    system = platform.system()
    if system == "Windows":
        return _get_active_window_windows()
    elif system == "Linux":
        return _get_active_window_linux()
    else:
        print(f"[WindowTracker] Unsupported platform: {system}")
        return None


# --------------------------------------------------------------------------- #
# Tracker thread                                                               #
# --------------------------------------------------------------------------- #
class WindowTracker:
    def __init__(self):
        self._thread = threading.Thread(
            target=self._run, name="WindowTracker", daemon=True
        )
        self._stop_event = threading.Event()
        self._current_app: Optional[str] = None
        self._elapsed: int = 0  # total elapsed seconds (managed by RuleEngine, not here)

    def start(self) -> None:
        print("[WindowTracker] Starting...")
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()

    def _run(self) -> None:
        while not self._stop_event.is_set():
            win_info = get_active_window()
            app_name = win_info["app_name"] if win_info else "unknown"

            # Emit window_changed if app switched
            if app_name != self._current_app:
                self._current_app = app_name
                bus.emit("window_changed", {
                    "app_name": app_name,
                    "title": win_info.get("title", "") if win_info else "",
                    "pid": win_info.get("pid", 0) if win_info else 0,
                })

            # Always emit tick
            bus.emit("tick", {"app_name": app_name})
            time.sleep(POLL_INTERVAL)
