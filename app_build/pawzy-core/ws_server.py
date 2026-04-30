"""
ws_server.py — WebSocket server bridging Python backend ↔ Electron frontend.

- Listens on ws://localhost:8765
- Forwards all EventBus events to connected Electron clients as JSON
- Receives JSON messages from Electron and emits them on the EventBus
"""

import asyncio
import json
import logging
import threading
from typing import Set

import websockets
from websockets.server import WebSocketServerProtocol

# Suppress verbose "opening handshake failed" spam caused by Electron's
# internal HTTP probes hitting the WebSocket port.
logging.getLogger('websockets').setLevel(logging.WARNING)

from event_bus import bus

HOST = "localhost"
PORT = 8765

# Events to forward from Python → Electron
FORWARD_EVENTS = [
    "state_change",
    "timer_tick",
    "break_start",
    "break_tick",
    "break_end",
    "stats",
    "open_settings",   # tray "Open Settings" → Electron opens settings window
]


class WsServer:
    def __init__(self):
        self._clients: Set[WebSocketServerProtocol] = set()
        self._clients_lock = asyncio.Lock()
        self._loop: asyncio.AbstractEventLoop = None
        self._thread: threading.Thread = None

        # Subscribe to all events that should be forwarded to Electron
        for event in FORWARD_EVENTS:
            bus.subscribe(event, self._make_forwarder(event))

    def _make_forwarder(self, event_name: str):
        """Creates a callback that schedules a WS broadcast for the given event."""
        def forwarder(data):
            if self._loop and self._loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    self._broadcast({"event": event_name, "data": data or {}}),
                    self._loop,
                )
        return forwarder

    async def _broadcast(self, message: dict) -> None:
        payload = json.dumps(message)
        async with self._clients_lock:
            clients = set(self._clients)
        if clients:
            websockets.broadcast(clients, payload)

    async def _handler(self, websocket: WebSocketServerProtocol) -> None:
        async with self._clients_lock:
            self._clients.add(websocket)
        print(f"[WsServer] Electron connected: {websocket.remote_address}")
        try:
            async for raw in websocket:
                try:
                    msg = json.loads(raw)
                    event = msg.get("event")
                    data = msg.get("data", {})
                    if event:
                        bus.emit(event, data)
                except json.JSONDecodeError:
                    print(f"[WsServer] Bad message: {raw}")
        except websockets.exceptions.ConnectionClosedOK:
            pass
        except Exception as e:
            print(f"[WsServer] Connection error: {e}")
        finally:
            async with self._clients_lock:
                self._clients.discard(websocket)
            print(f"[WsServer] Electron disconnected.")

    async def _serve(self) -> None:
        self._loop = asyncio.get_running_loop()
        print(f"[WsServer] Listening on ws://{HOST}:{PORT}")
        async with websockets.serve(self._handler, HOST, PORT):
            await asyncio.Future()  # Run forever

    def start(self) -> None:
        """Start the WebSocket server in a background thread."""
        self._thread = threading.Thread(
            target=asyncio.run,
            args=(self._serve(),),
            name="WsServer",
            daemon=True,
        )
        self._thread.start()
