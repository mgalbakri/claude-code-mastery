"""Local cache for tracking seen updates and curriculum state."""

import json
import logging
import os
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


def _atomic_write(path: Path, content: str):
    """Write content to a file atomically via temp file + rename."""
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        os.write(fd, content.encode())
        os.close(fd)
        os.replace(tmp, str(path))
    except:
        os.close(fd)
        os.unlink(tmp)
        raise


DEFAULT_CACHE_DIR = Path.home() / ".claude-code-mastery"
CACHE_FILE = "update_cache.json"
CURRICULUM_STATE_FILE = "curriculum_state.json"
MAX_SEEN_UPDATES = 500

# In-memory singletons — avoids repeated disk reads
_cache_instance: Optional[dict] = None
_state_instance: Optional[dict] = None
# Tracks insertion order so we can trim oldest entries
_seen_order: list[str] = []


def get_cache_dir() -> Path:
    """Get or create the cache directory."""
    cache_dir = DEFAULT_CACHE_DIR
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def load_cache() -> dict:
    """Load the update cache from disk (once per session, then in-memory)."""
    global _cache_instance, _seen_order
    if _cache_instance is not None:
        return _cache_instance

    cache_file = get_cache_dir() / CACHE_FILE
    if cache_file.exists():
        try:
            data = json.loads(cache_file.read_text(encoding="utf-8"))
            seen_list = data.get("seen_updates", [])
            data["seen_updates"] = set(seen_list)
            # Preserve disk order as our best approximation of insertion order
            _seen_order = list(seen_list)
            _cache_instance = data
            return _cache_instance
        except Exception as e:
            logger.warning("Failed to load cache from %s: %s", cache_file, e)

    _seen_order = []
    _cache_instance = {"seen_updates": set(), "last_check": None, "applied_updates": []}
    return _cache_instance


def save_cache(cache: dict) -> None:
    """Save the update cache to disk."""
    global _cache_instance
    _cache_instance = cache
    cache_file = get_cache_dir() / CACHE_FILE
    # Convert set to sorted list for JSON serialization
    serializable = {
        **cache,
        "seen_updates": sorted(cache["seen_updates"]),
    }
    _atomic_write(cache_file, json.dumps(serializable, indent=2))


def mark_update_seen(update_key: str) -> None:
    """Mark an update as seen."""
    global _seen_order
    cache = load_cache()
    if update_key not in cache["seen_updates"]:
        cache["seen_updates"].add(update_key)
        _seen_order.append(update_key)
    cache["last_check"] = datetime.now(timezone.utc).isoformat()
    _trim_seen(cache)
    save_cache(cache)


def mark_updates_seen(update_keys: list[str]) -> None:
    """Mark multiple updates as seen in a single write."""
    global _seen_order
    cache = load_cache()
    for key in update_keys:
        if key not in cache["seen_updates"]:
            cache["seen_updates"].add(key)
            _seen_order.append(key)
    cache["last_check"] = datetime.now(timezone.utc).isoformat()
    _trim_seen(cache)
    save_cache(cache)


def mark_update_applied(update_key: str, details: str) -> None:
    """Mark an update as applied to the curriculum."""
    cache = load_cache()
    cache["applied_updates"].append({
        "key": update_key,
        "details": details,
        "applied_at": datetime.now(timezone.utc).isoformat(),
    })
    save_cache(cache)


def is_update_seen(update_key: str) -> bool:
    """Check if an update has already been seen (O(1) set lookup)."""
    cache = load_cache()
    return update_key in cache["seen_updates"]


def get_last_check_time() -> Optional[str]:
    """Get the timestamp of the last update check."""
    cache = load_cache()
    return cache.get("last_check")


def get_update_key(source: str, title: str) -> str:
    """Generate a unique key for an update."""
    # Simple hash based on source + first 50 chars of title
    clean_title = title.lower().strip()[:50]
    return f"{source}::{clean_title}"


def load_curriculum_state() -> dict:
    """Load the curriculum progress state (once per session, then in-memory)."""
    global _state_instance
    if _state_instance is not None:
        return _state_instance

    state_file = get_cache_dir() / CURRICULUM_STATE_FILE
    if state_file.exists():
        try:
            _state_instance = json.loads(state_file.read_text(encoding="utf-8"))
            return _state_instance
        except Exception as e:
            logger.warning("Failed to load state from %s: %s", state_file, e)

    _state_instance = {
        "current_week": 1,
        "curriculum_version": "v2",
        "curriculum_path": None,
        "last_updated": None,
    }
    return _state_instance


def save_curriculum_state(state: dict) -> None:
    """Save curriculum progress state."""
    global _state_instance
    _state_instance = state
    state_file = get_cache_dir() / CURRICULUM_STATE_FILE
    _atomic_write(state_file, json.dumps(state, indent=2))


MAX_BACKUPS = 10


def create_curriculum_backup(curriculum_path: str) -> Optional[str]:
    """Create a timestamped backup of the curriculum file.

    Returns the backup file path, or None if backup failed.
    Keeps at most MAX_BACKUPS backups, deleting the oldest.
    """
    try:
        src = Path(curriculum_path).expanduser().resolve()
        if not src.exists():
            logger.warning("Cannot backup: file not found at %s", src)
            return None

        timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
        backup_path = src.parent / f"{src.name}.backup.{timestamp}"

        shutil.copy2(str(src), str(backup_path))
        logger.info("Created curriculum backup: %s", backup_path)

        # Clean up old backups — keep only the newest MAX_BACKUPS
        pattern = f"{src.name}.backup.*"
        backups = sorted(src.parent.glob(pattern))
        if len(backups) > MAX_BACKUPS:
            for old_backup in backups[:-MAX_BACKUPS]:
                old_backup.unlink()
                logger.debug("Deleted old backup: %s", old_backup)

        return str(backup_path)

    except Exception as e:
        logger.error("Failed to create curriculum backup: %s", e)
        return None


def _trim_seen(cache: dict) -> None:
    """Trim seen_updates to MAX_SEEN_UPDATES, dropping the oldest entries."""
    global _seen_order
    if len(cache["seen_updates"]) > MAX_SEEN_UPDATES:
        # Keep the most recently added keys
        keep = set(_seen_order[-MAX_SEEN_UPDATES:])
        cache["seen_updates"] = cache["seen_updates"] & keep
        _seen_order = [k for k in _seen_order if k in cache["seen_updates"]]
        logger.info("Trimmed seen_updates from %d to %d", len(cache["seen_updates"]) + (MAX_SEEN_UPDATES - len(keep)), len(cache["seen_updates"]))
