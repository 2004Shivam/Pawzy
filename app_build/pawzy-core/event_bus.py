"""
event_bus.py — Thread-safe internal pub/sub event bus for Pawzy.
All inter-module communication goes through this singleton.
"""

import threading
from collections import defaultdict
from typing import Any, Callable


class EventBus:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._subscribers: dict[str, list[Callable]] = defaultdict(list)
                cls._instance._sub_lock = threading.Lock()
        return cls._instance

    def subscribe(self, event: str, callback: Callable) -> None:
        """Subscribe a callback to an event."""
        with self._sub_lock:
            self._subscribers[event].append(callback)

    def unsubscribe(self, event: str, callback: Callable) -> None:
        """Remove a callback from an event."""
        with self._sub_lock:
            if event in self._subscribers:
                self._subscribers[event] = [
                    cb for cb in self._subscribers[event] if cb != callback
                ]

    def emit(self, event: str, data: Any = None) -> None:
        """Emit an event, calling all registered callbacks."""
        with self._sub_lock:
            callbacks = list(self._subscribers.get(event, []))
        for cb in callbacks:
            try:
                cb(data)
            except Exception as e:
                print(f"[EventBus] Error in handler for '{event}': {e}")


# Global singleton instance
bus = EventBus()
