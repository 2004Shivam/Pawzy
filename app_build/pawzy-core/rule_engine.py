"""
rule_engine.py — Core state machine for Pawzy.

States: idle → warning → lock → break → happy → idle

Listens to:
  - 'tick'         from WindowTracker: increments elapsed if not whitelisted/paused
  - 'user_action'  from WsServer:      pause, resume, reset, update_config, switch_character

Emits:
  - 'state_change' { state }
  - 'timer_tick'   { elapsed, limit, break_remaining }
  - 'break_start'  { duration }
  - 'break_tick'   { remaining }
  - 'break_end'    {}
  - 'stats'        { today_used, breaks_taken, streak }
"""

import threading
import time
from typing import Optional

import data_store
from event_bus import bus


class State:
    IDLE = "idle"
    WARNING = "warning"
    LOCK = "lock"
    BREAK = "break"
    HAPPY = "happy"


class RuleEngine:
    def __init__(self):
        self._cfg = data_store.read_config()
        self._elapsed: int = 0          # seconds of active screen time
        self._state: str = State.IDLE
        self._paused: bool = False
        self._break_remaining: int = 0
        self._break_row_id: Optional[int] = None
        self._session_row_id: Optional[int] = None
        self._current_app: str = "unknown"
        self._lock = threading.Lock()
        self._break_active: bool = False          # guard against re-entrant breaks
        self._break_cancel = threading.Event()    # set this to cancel the countdown thread
        self._post_break_cooldown: bool = False   # prevents immediate re-trigger after break

        # Subscribe to events
        bus.subscribe("tick", self._on_tick)
        bus.subscribe("window_changed", self._on_window_changed)
        bus.subscribe("user_action", self._on_user_action)

    # ----------------------------------------------------------------------- #
    # Event handlers                                                           #
    # ----------------------------------------------------------------------- #
    def _on_window_changed(self, data: dict) -> None:
        with self._lock:
            # Close previous session
            if self._session_row_id is not None:
                data_store.log_session_end(self._session_row_id)
                self._session_row_id = None

            self._current_app = data.get("app_name", "unknown")

            # Don't log whitelisted apps
            if self._current_app not in self._cfg.get("whitelist", []):
                self._session_row_id = data_store.log_session_start(self._current_app)

    def _on_tick(self, data: dict) -> None:
        with self._lock:
            if self._paused or self._state in (State.LOCK, State.BREAK, State.HAPPY):
                return

            app_name = data.get("app_name", "unknown")

            # Skip whitelisted apps
            if app_name in self._cfg.get("whitelist", []):
                return

            # Increment elapsed
            self._elapsed += 1

            limit = self._get_effective_limit(app_name)
            warning_threshold = int(limit * 0.80)

            # Emit timer tick to Electron
            bus.emit("timer_tick", {
                "elapsed": self._elapsed,
                "limit": limit,
                "break_remaining": None,
            })

            # State transitions — skip if in cooldown after a break
            if self._post_break_cooldown:
                return

            new_state = self._state
            if self._elapsed >= limit:
                new_state = State.LOCK
            elif self._elapsed >= warning_threshold:
                new_state = State.WARNING
            else:
                new_state = State.IDLE

            if new_state != self._state:
                self._transition_to(new_state)

        # Emit stats every 30 ticks
        if self._elapsed % 30 == 0:
            self._emit_stats()

    def _on_user_action(self, data: dict) -> None:
        action = data.get("action")
        with self._lock:
            if action == "pause":
                self._paused = True
                print("[RuleEngine] Tracking paused.")
            elif action == "resume":
                self._paused = False
                print("[RuleEngine] Tracking resumed.")
            elif action == "reset":
                # Cancel any running break countdown
                self._break_cancel.set()
                self._break_active = False
                self._post_break_cooldown = False
                self._elapsed = 0
                old_state = self._state
                self._state = State.IDLE
                if old_state != State.IDLE:
                    bus.emit("state_change", {"state": State.IDLE})
                print("[RuleEngine] Timer manually reset.")
            elif action == "update_config":
                self._cfg = data_store.read_config()
                print("[RuleEngine] Config reloaded.")
            elif action == "switch_character":
                char = data.get("data", {}).get("character", "cat")
                data_store.write_config("character", char)
                self._cfg["character"] = char
                print(f"[RuleEngine] Character switched to: {char}")

    # ----------------------------------------------------------------------- #
    # State transitions                                                        #
    # ----------------------------------------------------------------------- #
    def _transition_to(self, new_state: str) -> None:
        """Must be called with self._lock held."""
        print(f"[RuleEngine] State: {self._state} → {new_state}")
        self._state = new_state
        bus.emit("state_change", {"state": new_state})

        if new_state == State.LOCK:
            # Guard: don't start a second break if one is already running
            if self._break_active:
                print("[RuleEngine] Break already active — ignoring duplicate LOCK transition.")
                return
            self._start_break()

    def _start_break(self) -> None:
        """Must be called with self._lock held."""
        duration = self._cfg.get("break_seconds", 300)
        self._break_remaining = duration
        self._break_active = True
        self._break_cancel.clear()  # reset cancel signal
        self._break_row_id = data_store.log_break_start()
        bus.emit("break_start", {"duration": duration})

        # Close open session during break
        if self._session_row_id is not None:
            data_store.log_session_end(self._session_row_id)
            self._session_row_id = None

        # Start break countdown thread
        t = threading.Thread(target=self._break_countdown, daemon=True)
        t.start()

    def _break_countdown(self) -> None:
        while True:
            # Use event wait so we can cancel early (e.g. on manual reset)
            cancelled = self._break_cancel.wait(timeout=1.0)
            if cancelled:
                print("[RuleEngine] Break countdown cancelled.")
                return

            with self._lock:
                if self._state != State.BREAK and self._state != State.LOCK:
                    # Break was cancelled externally (e.g. manual reset)
                    self._break_active = False
                    return
                # Transition LOCK→BREAK after first tick (lock triggers animation, break is the ongoing state)
                if self._state == State.LOCK:
                    self._state = State.BREAK
                    bus.emit("state_change", {"state": State.BREAK})

                self._break_remaining -= 1
                bus.emit("break_tick", {"remaining": self._break_remaining})

                if self._break_remaining <= 0:
                    self._end_break()
                    return

    def _end_break(self) -> None:
        """Must be called with self._lock held."""
        if self._break_row_id is not None:
            data_store.log_break_end(self._break_row_id)
            self._break_row_id = None

        self._elapsed = 0
        self._break_active = False
        self._state = State.HAPPY
        bus.emit("break_end", {})
        bus.emit("state_change", {"state": State.HAPPY})

        # Happy state lasts 4 seconds, then back to idle.
        # Post-break cooldown: keep elapsed=0 for 10s so timer doesn't immediately retrigger.
        def back_to_idle():
            # Wait for happy animation
            time.sleep(4)
            with self._lock:
                if self._state == State.HAPPY:
                    self._post_break_cooldown = True
                    self._elapsed = 0
                    self._state = State.IDLE
                    bus.emit("state_change", {"state": State.IDLE})

            # Cooldown: don't let elapsed accumulate for 10 more seconds
            time.sleep(10)
            with self._lock:
                self._post_break_cooldown = False
                print("[RuleEngine] Post-break cooldown ended — tracking resumed.")

        threading.Thread(target=back_to_idle, daemon=True).start()

        self._emit_stats()

    # ----------------------------------------------------------------------- #
    # Helpers                                                                  #
    # ----------------------------------------------------------------------- #
    def _get_effective_limit(self, app_name: str) -> int:
        """Returns per-app limit if configured, else global limit."""
        per_app = self._cfg.get("per_app_limits", {})
        return per_app.get(app_name, self._cfg.get("limit_seconds", 3600))

    def _emit_stats(self) -> None:
        stats = data_store.get_today_stats()
        bus.emit("stats", stats)
