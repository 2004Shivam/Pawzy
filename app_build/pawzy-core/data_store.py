"""
data_store.py — Persistence layer for Pawzy.
  - SQLite: session logging (start/end/app_name per day)
  - JSON:   user config (limits, character, whitelist, etc.)
"""

import json
import sqlite3
import threading
from datetime import date, datetime
from pathlib import Path
from typing import Any

# --------------------------------------------------------------------------- #
# Paths — stored in user home dir so they survive reinstalls                  #
# --------------------------------------------------------------------------- #
BASE_DIR = Path.home() / ".pawzy"
BASE_DIR.mkdir(exist_ok=True)
DB_PATH = BASE_DIR / "pawzy.db"
CONFIG_PATH = BASE_DIR / "config.json"

DEFAULT_CONFIG: dict[str, Any] = {
    "limit_seconds": 3600,        # 1 hour
    "break_seconds": 300,         # 5 minutes
    "character": "cat",
    "whitelist": [],              # process names that don't count toward limit
    "per_app_limits": {},         # { "chrome.exe": 1800 }
    "sounds_enabled": True,
    "sound_categories": {
        "voice": True,
        "ambient": True,
        "interaction": True,
    },
    "char_size": "medium",        # small | medium | large
    "overlay_opacity": 0.85,
    "daily_reset_hour": 0,        # midnight
    "first_launch": True,
}

_config_lock = threading.Lock()
_db_lock = threading.Lock()


# --------------------------------------------------------------------------- #
# Config helpers                                                               #
# --------------------------------------------------------------------------- #
def _ensure_config() -> dict:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, "r") as f:
            stored = json.load(f)
        # Merge missing keys from defaults (handles new keys after updates)
        merged = {**DEFAULT_CONFIG, **stored}
        return merged
    return dict(DEFAULT_CONFIG)


def read_config() -> dict:
    with _config_lock:
        return _ensure_config()


def write_config(key: str, value: Any) -> None:
    with _config_lock:
        cfg = _ensure_config()
        cfg[key] = value
        with open(CONFIG_PATH, "w") as f:
            json.dump(cfg, f, indent=2)


def write_config_bulk(updates: dict) -> None:
    """Write multiple config keys at once."""
    with _config_lock:
        cfg = _ensure_config()
        cfg.update(updates)
        with open(CONFIG_PATH, "w") as f:
            json.dump(cfg, f, indent=2)


# --------------------------------------------------------------------------- #
# SQLite helpers                                                               #
# --------------------------------------------------------------------------- #
def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables if they don't exist."""
    with _db_lock:
        conn = _get_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                date        TEXT NOT NULL,
                app_name    TEXT NOT NULL,
                start_ts    REAL NOT NULL,
                end_ts      REAL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS breaks (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                date        TEXT NOT NULL,
                started_at  REAL NOT NULL,
                ended_at    REAL,
                completed   INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()


def log_session_start(app_name: str) -> int:
    """Start a new session log entry, returns the row id."""
    with _db_lock:
        conn = _get_connection()
        cursor = conn.execute(
            "INSERT INTO sessions (date, app_name, start_ts, end_ts) VALUES (?, ?, ?, NULL)",
            (date.today().isoformat(), app_name, datetime.now().timestamp()),
        )
        row_id = cursor.lastrowid
        conn.commit()
        conn.close()
    return row_id


def log_session_end(row_id: int) -> None:
    """Close an open session log entry."""
    with _db_lock:
        conn = _get_connection()
        conn.execute(
            "UPDATE sessions SET end_ts = ? WHERE id = ?",
            (datetime.now().timestamp(), row_id),
        )
        conn.commit()
        conn.close()


def log_break_start() -> int:
    """Log a break start, returns the row id."""
    with _db_lock:
        conn = _get_connection()
        cursor = conn.execute(
            "INSERT INTO breaks (date, started_at) VALUES (?, ?)",
            (date.today().isoformat(), datetime.now().timestamp()),
        )
        row_id = cursor.lastrowid
        conn.commit()
        conn.close()
    return row_id


def log_break_end(row_id: int) -> None:
    with _db_lock:
        conn = _get_connection()
        conn.execute(
            "UPDATE breaks SET ended_at = ?, completed = 1 WHERE id = ?",
            (datetime.now().timestamp(), row_id),
        )
        conn.commit()
        conn.close()


def get_today_stats() -> dict:
    """
    Returns today's stats for display in tray and settings:
      - today_used:    total active seconds today
      - breaks_taken:  number of completed breaks today
      - streak:        consecutive days with at least 1 completed break
    """
    today = date.today().isoformat()
    with _db_lock:
        conn = _get_connection()

        # Total session time today
        row = conn.execute(
            """
            SELECT COALESCE(SUM(
                CASE WHEN end_ts IS NOT NULL
                     THEN end_ts - start_ts
                     ELSE strftime('%s','now') - start_ts
                END
            ), 0) AS total
            FROM sessions WHERE date = ?
            """,
            (today,),
        ).fetchone()
        today_used = int(row["total"])

        # Breaks taken today
        row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM breaks WHERE date = ? AND completed = 1",
            (today,),
        ).fetchone()
        breaks_taken = row["cnt"]

        # Streak — count consecutive days backward from yesterday that have ≥1 break
        rows = conn.execute(
            "SELECT DISTINCT date FROM breaks WHERE completed = 1 ORDER BY date DESC"
        ).fetchall()
        conn.close()

    streak = 0
    check_date = date.today()
    dates_with_breaks = {r["date"] for r in rows}
    while True:
        if check_date.isoformat() in dates_with_breaks:
            streak += 1
            check_date = date.fromordinal(check_date.toordinal() - 1)
        else:
            break

    return {
        "today_used": today_used,
        "breaks_taken": breaks_taken,
        "streak": streak,
    }
