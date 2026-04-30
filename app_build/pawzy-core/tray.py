"""
tray.py — PyQt6 system tray icon and context menu.

Provides:
  - Tray icon with live usage tooltip
  - Context menu: usage label, pause/resume, settings, reset, switch char, quit
  - Reacts to 'stats' and 'state_change' events from EventBus
"""

import sys

from PyQt6.QtCore import QTimer, pyqtSignal, QObject
from PyQt6.QtGui import QIcon, QAction
from PyQt6.QtWidgets import QApplication, QMenu, QSystemTrayIcon, QWidget

from event_bus import bus
import data_store


class TraySignals(QObject):
    """Relay async EventBus events to the Qt main thread via signals."""
    stats_updated = pyqtSignal(dict)
    state_changed = pyqtSignal(str)


class PawzyTray:
    def __init__(self, app: QApplication):
        self._app = app
        self._signals = TraySignals()
        self._paused = False
        self._last_stats: dict = {"today_used": 0, "breaks_taken": 0, "streak": 0}

        # System tray icon
        self._tray = QSystemTrayIcon()
        self._tray.setIcon(self._load_icon())
        self._tray.setToolTip("Pawzy — Loading...")

        # Context menu
        self._menu = QMenu()
        self._usage_action = QAction("Loading...", self._menu)
        self._usage_action.setEnabled(False)

        self._skip_break_action = QAction("⏭  Skip Break", self._menu)
        self._skip_break_action.triggered.connect(self._skip_break)
        self._skip_break_action.setEnabled(False)  # only active during a break

        self._pause_action = QAction("⏸  Pause Tracking", self._menu)
        self._pause_action.triggered.connect(self._toggle_pause)

        settings_action = QAction("⚙️  Open Settings", self._menu)
        settings_action.triggered.connect(self._open_settings)

        reset_action = QAction("🔄  Reset Timer", self._menu)
        reset_action.triggered.connect(self._manual_reset)

        quit_action = QAction("✖  Quit Pawzy", self._menu)
        quit_action.triggered.connect(self._quit)

        self._menu.addAction(self._usage_action)
        self._menu.addSeparator()
        self._menu.addAction(self._skip_break_action)
        self._menu.addAction(self._pause_action)
        self._menu.addAction(settings_action)
        self._menu.addAction(reset_action)
        self._menu.addSeparator()
        self._menu.addAction(quit_action)

        self._tray.setContextMenu(self._menu)

        # Connect signals (thread-safe Qt updates)
        self._signals.stats_updated.connect(self._update_stats_display)
        self._signals.state_changed.connect(self._on_state_changed)

        # Subscribe to EventBus
        bus.subscribe("stats", lambda d: self._signals.stats_updated.emit(d))
        bus.subscribe("state_change", lambda d: self._signals.state_changed.emit(d.get("state", "")))

        # Refresh stats on startup
        QTimer.singleShot(500, self._refresh_stats)

        self._tray.show()
        print("[Tray] System tray ready.")

    # ----------------------------------------------------------------------- #
    # Display updates                                                          #
    # ----------------------------------------------------------------------- #
    def _update_stats_display(self, stats: dict) -> None:
        self._last_stats = stats
        used = stats.get("today_used", 0)
        limit = data_store.read_config().get("limit_seconds", 3600)
        used_min = used // 60
        limit_min = limit // 60
        streak = stats.get("streak", 0)

        label = f"🐾 Pawzy — {used_min} / {limit_min} min"
        if streak > 0:
            label += f"  🔥 {streak} day streak"
        self._usage_action.setText(label)
        self._tray.setToolTip(f"Pawzy — {used_min} min / {limit_min} min used today")

    def _on_state_changed(self, state: str) -> None:
        state_labels = {
            "idle": "😴",
            "warning": "⚠️",
            "lock": "🔒",
            "break": "☕",
            "happy": "🎉",
        }
        icon_label = state_labels.get(state, "🐾")
        self._tray.setToolTip(f"Pawzy {icon_label} — {state.capitalize()}")
        # Enable skip only during an active break
        self._skip_break_action.setEnabled(state in ("lock", "break"))

    def _refresh_stats(self) -> None:
        stats = data_store.get_today_stats()
        self._signals.stats_updated.emit(stats)

    # ----------------------------------------------------------------------- #
    # Actions                                                                  #
    # ----------------------------------------------------------------------- #
    def _skip_break(self) -> None:
        """End the current break immediately and reset the timer."""
        bus.emit("user_action", {"action": "reset"})
        self._tray.showMessage("Pawzy", "Break skipped ⏭", QSystemTrayIcon.MessageIcon.Information, 1500)

    def _toggle_pause(self) -> None:
        self._paused = not self._paused
        action = "pause" if self._paused else "resume"
        self._pause_action.setText(
            "▶  Resume Tracking" if self._paused else "⏸  Pause Tracking"
        )
        bus.emit("user_action", {"action": action})

    def _open_settings(self) -> None:
        bus.emit("user_action", {"action": "open_settings"})

    def _manual_reset(self) -> None:
        bus.emit("user_action", {"action": "reset"})
        self._tray.showMessage("Pawzy", "Timer reset! Fresh start 🐾", QSystemTrayIcon.MessageIcon.Information, 2000)


    def _quit(self) -> None:
        print("[Tray] Quitting Pawzy...")
        self._app.quit()

    # ----------------------------------------------------------------------- #
    # Utils                                                                    #
    # ----------------------------------------------------------------------- #
    def _load_icon(self) -> QIcon:
        """Load tray icon — falls back to a built-in Qt icon if asset is missing."""
        from pathlib import Path
        icon_path = Path(__file__).parent / "assets" / "tray_icon.png"
        if icon_path.exists():
            return QIcon(str(icon_path))
        # Fallback: use a standard Qt icon so the tray always shows something
        from PyQt6.QtWidgets import QStyle
        style = self._app.style()
        return style.standardIcon(QStyle.StandardPixmap.SP_ComputerIcon)
