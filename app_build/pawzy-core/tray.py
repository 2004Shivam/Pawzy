"""
tray.py — pystray system tray icon and context menu.

Provides:
  - Tray icon with live usage tooltip
  - Context menu: usage label, pause/resume, settings, reset, quit
  - Reacts to 'stats' and 'state_change' events from EventBus
"""

import os
import sys
import threading
from pathlib import Path
from PIL import Image
import pystray
from pystray import MenuItem as item

from event_bus import bus
import data_store

class PawzyTray:
    def __init__(self):
        self._paused = False
        self._last_stats: dict = {"today_used": 0, "breaks_taken": 0, "streak": 0}
        self._state = "idle"
        self._skip_enabled = False
        
        # Load icon
        self._icon_image = self._load_icon_image()
        
        # Create the icon
        self._icon = pystray.Icon(
            "Pawzy",
            self._icon_image,
            title="Pawzy — Loading...",
            menu=self._create_menu()
        )

        # Subscribe to EventBus
        bus.subscribe("stats", self._on_stats_updated)
        bus.subscribe("state_change", lambda d: self._on_state_changed(d.get("state", "")))

        print("[Tray] pystray system tray initialized.")

    def run(self):
        """Start the tray icon loop (blocks)."""
        self._icon.run()

    def stop(self):
        """Stop the tray icon."""
        self._icon.stop()

    # ----------------------------------------------------------------------- #
    # Menu Construction                                                        #
    # ----------------------------------------------------------------------- #
    def _create_menu(self):
        return pystray.Menu(
            item(lambda _: self._get_usage_label(), lambda: None, enabled=False),
            pystray.Menu.SEPARATOR,
            item("⏭  Skip Break", self._skip_break, enabled=lambda _: self._skip_enabled),
            item(lambda _: "▶  Resume Tracking" if self._paused else "⏸  Pause Tracking", self._toggle_pause),
            item("⚙️  Open Settings", self._open_settings),
            item("🔄  Reset Timer", self._manual_reset),
            pystray.Menu.SEPARATOR,
            item("✖  Quit Pawzy", self._quit)
        )

    def _get_usage_label(self):
        used = self._last_stats.get("today_used", 0)
        limit = data_store.read_config().get("limit_seconds", 3600)
        used_min = used // 60
        limit_min = limit // 60
        streak = self._last_stats.get("streak", 0)

        label = f"🐾 Pawzy — {used_min} / {limit_min} min"
        if streak > 0:
            label += f"  🔥 {streak} day streak"
        return label

    # ----------------------------------------------------------------------- #
    # Event Handlers                                                           #
    # ----------------------------------------------------------------------- #
    def _on_stats_updated(self, stats: dict) -> None:
        self._last_stats = stats
        used_min = stats.get("today_used", 0) // 60
        limit_min = data_store.read_config().get("limit_seconds", 3600) // 60
        self._icon.title = f"Pawzy — {used_min} min / {limit_min} min used today"
        # Force a menu refresh if possible (some implementations need this)
        # self._icon.update_menu() 

    def _on_state_changed(self, state: str) -> None:
        self._state = state
        state_labels = {
            "idle": "😴",
            "warning": "⚠️",
            "lock": "🔒",
            "break": "☕",
            "happy": "🎉",
        }
        icon_label = state_labels.get(state, "🐾")
        self._icon.title = f"Pawzy {icon_label} — {state.capitalize()}"
        self._skip_enabled = state in ("lock", "break")

    # ----------------------------------------------------------------------- #
    # Actions                                                                  #
    # ----------------------------------------------------------------------- #
    def _skip_break(self, icon, item):
        bus.emit("user_action", {"action": "reset"})

    def _toggle_pause(self, icon, item):
        self._paused = not self._paused
        action = "pause" if self._paused else "resume"
        bus.emit("user_action", {"action": action})

    def _open_settings(self, icon, item):
        bus.emit("open_settings", {})

    def _manual_reset(self, icon, item):
        bus.emit("user_action", {"action": "reset"})

    def _quit(self, icon, item):
        print("[Tray] Quitting Pawzy...")
        self.stop()
        # Trigger global exit if needed, but usually stopping the icon 
        # and letting the main thread finish is enough.
        os._exit(0) 

    # ----------------------------------------------------------------------- #
    # Utils                                                                    #
    # ----------------------------------------------------------------------- #
    def _load_icon_image(self):
        icon_path = Path(__file__).parent / "assets" / "tray_icon.png"
        if icon_path.exists():
            return Image.open(icon_path)
        # Fallback: create a simple square if missing
        return Image.new('RGB', (64, 64), color=(255, 105, 180))
