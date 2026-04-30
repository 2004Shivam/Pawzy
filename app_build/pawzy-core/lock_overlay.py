"""
lock_overlay.py — PyQt6 fullscreen hard-lock overlay (Phase 1 placeholder).

In Phase 2, this is replaced by the Electron lock screen. This serves as
a functional fallback if Electron isn't connected yet.

Features:
  - Fullscreen, always-on-top, frameless window
  - Break countdown timer
  - Blocks Alt+F4, minimize, and close attempts
  - Watchdog that re-raises the window every 500ms
"""

import threading
import time

from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject
from PyQt6.QtGui import QColor, QFont, QPainter, QKeyEvent
from PyQt6.QtWidgets import QApplication, QLabel, QWidget, QVBoxLayout

from event_bus import bus


class LockSignals(QObject):
    break_started = pyqtSignal(int)   # duration in seconds
    break_ticked = pyqtSignal(int)    # remaining seconds
    break_finished = pyqtSignal()


class LockOverlay(QWidget):
    def __init__(self):
        super().__init__()
        self._signals = LockSignals()
        self._active = False
        self._watchdog_timer: QTimer = None
        self._use_electron = False  # Set to True when Electron connects

        self._setup_window()
        self._setup_ui()
        self._connect_signals()

        # Subscribe to EventBus
        bus.subscribe("break_start", lambda d: self._signals.break_started.emit(d.get("duration", 300)))
        bus.subscribe("break_tick", lambda d: self._signals.break_ticked.emit(d.get("remaining", 0)))
        bus.subscribe("break_end", lambda _: self._signals.break_finished.emit())
        bus.subscribe("electron_connected", lambda _: self._set_electron_active(True))
        bus.subscribe("electron_disconnected", lambda _: self._set_electron_active(False))

    def _setup_window(self) -> None:
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, False)
        self.setStyleSheet("background-color: #0d0d0d;")

    def _setup_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._emoji_label = QLabel("🐾", self)
        self._emoji_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._emoji_label.setFont(QFont("Arial", 80))

        self._message_label = QLabel("Time for a break!", self)
        self._message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._message_label.setStyleSheet("color: #ffffff; font-size: 32px; font-weight: bold;")

        self._timer_label = QLabel("05:00", self)
        self._timer_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._timer_label.setStyleSheet(
            "color: #a78bfa; font-size: 72px; font-weight: 900; font-family: monospace;"
        )

        self._sub_label = QLabel("Relax. Stretch. Drink some water. 💧", self)
        self._sub_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._sub_label.setStyleSheet("color: #888888; font-size: 18px;")

        layout.addWidget(self._emoji_label)
        layout.addSpacing(20)
        layout.addWidget(self._message_label)
        layout.addSpacing(10)
        layout.addWidget(self._timer_label)
        layout.addSpacing(20)
        layout.addWidget(self._sub_label)

    def _connect_signals(self) -> None:
        self._signals.break_started.connect(self._on_break_start)
        self._signals.break_ticked.connect(self._on_break_tick)
        self._signals.break_finished.connect(self._on_break_end)

    # ----------------------------------------------------------------------- #
    # Slot handlers                                                            #
    # ----------------------------------------------------------------------- #
    def _on_break_start(self, duration: int) -> None:
        if self._use_electron:
            return  # Electron handles this
        self._active = True
        self._update_timer_display(duration)
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen)
        self.showFullScreen()
        self.raise_()
        self.activateWindow()
        self._start_watchdog()

    def _on_break_tick(self, remaining: int) -> None:
        if self._use_electron or not self._active:
            return
        self._update_timer_display(remaining)

    def _on_break_end(self) -> None:
        self._active = False
        self._stop_watchdog()
        self.hide()

    def _update_timer_display(self, seconds: int) -> None:
        mins = seconds // 60
        secs = seconds % 60
        self._timer_label.setText(f"{mins:02d}:{secs:02d}")

    # ----------------------------------------------------------------------- #
    # Watchdog — re-raises window every 500ms to prevent bypass               #
    # ----------------------------------------------------------------------- #
    def _start_watchdog(self) -> None:
        self._watchdog_timer = QTimer(self)
        self._watchdog_timer.setInterval(500)
        self._watchdog_timer.timeout.connect(self._enforce_lock)
        self._watchdog_timer.start()

    def _stop_watchdog(self) -> None:
        if self._watchdog_timer:
            self._watchdog_timer.stop()
            self._watchdog_timer = None

    def _enforce_lock(self) -> None:
        if self._active and not self._use_electron:
            self.raise_()
            self.activateWindow()

    def _set_electron_active(self, active: bool) -> None:
        self._use_electron = active

    # ----------------------------------------------------------------------- #
    # Block all escape attempts                                                #
    # ----------------------------------------------------------------------- #
    def keyPressEvent(self, event: QKeyEvent) -> None:
        """Swallow all keypresses during lock."""
        if self._active:
            return
        super().keyPressEvent(event)

    def closeEvent(self, event) -> None:
        """Prevent closing during lock."""
        if self._active:
            event.ignore()
            return
        super().closeEvent(event)
