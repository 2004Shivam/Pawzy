# Pawzy — Technical Specification
**Version:** 1.0 | **Status:** Approved | **Architecture:** Option 1

---

## Architecture

Two-process system communicating over a local WebSocket:

- **pawzy-core** (Python): Active window tracking, rule engine, SQLite persistence, PyQt6 tray
- **pawzy-ui** (Electron + React + Rive): Transparent frameless character window, lock screen overlay, settings

```
pawzy-core (Python) <──── WebSocket localhost:8765 ────> pawzy-ui (Electron)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 |
| Window tracking (Win) | pywin32 + psutil |
| Window tracking (Linux) | python-xlib + ewmh + psutil |
| Tray | PyQt6 |
| IPC | websockets (Python server, JS client) |
| Frontend | Electron + React (Vite) |
| Animations | Rive (@rive-app/react-canvas) |
| Storage | SQLite (sessions) + JSON (config) |
| Packaging | PyInstaller + electron-builder |

## IPC Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Py→El | `state_change` | `{ state: "idle"|"warning"|"lock"|"break"|"happy" }` |
| Py→El | `timer_tick` | `{ elapsed, limit, break_remaining }` |
| Py→El | `break_start` | `{ duration }` |
| Py→El | `break_tick` | `{ remaining }` |
| Py→El | `break_end` | `{}` |
| Py→El | `stats` | `{ today_used, breaks_taken, streak }` |
| El→Py | `user_action` | `{ action: "pause"|"resume"|"reset"|"update_config", data? }` |

## Phase 1 Scope (Current Build)

- `window_tracker.py` — cross-platform active window polling
- `rule_engine.py` — state machine (idle → warning → lock → break → happy)
- `event_bus.py` — thread-safe internal pub/sub
- `data_store.py` — SQLite sessions + JSON config
- `ws_server.py` — WebSocket server bridging Python ↔ Electron
- `tray.py` — PyQt6 system tray
- `main.py` — entry point
- Electron skeleton (`main.js`, `character` window, `lockscreen` window, `useWebSocket` hook)
- React character widget (placeholder box, Rive integration ready)
- React lock screen (countdown + habit prompts)
