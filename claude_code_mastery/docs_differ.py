"""Documentation diffing engine.

Snapshots the Claude Code documentation tree and detects changes between
runs. This catches every docs change — not just what gets announced on the
blog — by comparing the actual page content paragraph by paragraph.

Storage: ~/.claude-code-mastery/docs_snapshots/
"""

import hashlib
import json
import logging
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from .sources import Update, HEADERS
from .cache import get_cache_dir

logger = logging.getLogger(__name__)

SNAPSHOT_DIR_NAME = "docs_snapshots"
DOCS_BASE_URL = "https://docs.anthropic.com/en/docs/claude-code"

# Pages to crawl (relative to base).  We discover more dynamically.
SEED_PATHS = [
    "",                     # main Claude Code page
    "/overview",
    "/cli-reference",
    "/cli-usage",
    "/memory",
    "/hooks",
    "/mcp-servers",
    "/sub-agents",
    "/settings",
    "/ide-integrations",
    "/permissions",
    "/github-actions",
    "/security",
    "/troubleshooting",
    "/tutorials",
    "/sdk",
    "/skills",
    "/agent-teams",
]


def _snapshot_dir() -> Path:
    d = get_cache_dir() / SNAPSHOT_DIR_NAME
    d.mkdir(parents=True, exist_ok=True)
    return d


def _snapshot_path(label: str = "latest") -> Path:
    return _snapshot_dir() / f"docs_{label}.json"


def _section_hash(text: str) -> str:
    """Hash a normalised text block for comparison."""
    normalised = re.sub(r"\s+", " ", text.strip().lower())
    return hashlib.sha256(normalised.encode()).hexdigest()[:16]


async def _fetch_page(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """Fetch a single docs page, return HTML or None."""
    try:
        resp = await client.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return resp.text
        logger.debug("Docs page %s returned %d", url, resp.status_code)
    except httpx.HTTPError as e:
        logger.debug("Failed to fetch %s: %s", url, e)
    return None


def _extract_sections(html: str) -> dict[str, str]:
    """Extract headed sections from a docs page.

    Returns {section_title: section_text} where title is the nearest
    heading and text is the content until the next heading.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Remove nav, sidebar, footer — keep only article / main content
    for tag in soup.select("nav, header, footer, .sidebar, .navigation, script, style"):
        tag.decompose()

    main = soup.select_one("main, article, .docs-content, [role='main']") or soup

    sections: dict[str, str] = {}
    current_heading = "__intro__"
    current_parts: list[str] = []

    for el in main.find_all(recursive=False):
        if el.name in ("h1", "h2", "h3", "h4"):
            # Save previous section
            text = " ".join(current_parts).strip()
            if text:
                sections[current_heading] = text
            current_heading = el.get_text(strip=True)
            current_parts = []
        elif el.name in ("p", "li", "code", "pre", "td"):
            t = el.get_text(strip=True)
            if t:
                current_parts.append(t)

    # Save last section
    text = " ".join(current_parts).strip()
    if text:
        sections[current_heading] = text

    return sections


def _discover_links(html: str) -> list[str]:
    """Find links to other Claude Code docs pages."""
    soup = BeautifulSoup(html, "html.parser")
    links: list[str] = []
    for a in soup.select("a[href*='/docs/claude-code']"):
        href = a.get("href", "")
        if href and "/docs/claude-code" in href:
            # Normalise to path only
            path = href.split("?")[0].split("#")[0]
            if path.startswith("/"):
                path = f"https://docs.anthropic.com{path}"
            links.append(path)
    return list(set(links))


async def snapshot_docs() -> dict:
    """Crawl all Claude Code docs pages and return a snapshot dict.

    Snapshot structure::

        {
            "timestamp": "...",
            "pages": {
                "<url>": {
                    "sections": {
                        "<heading>": {"text": "...", "hash": "..."},
                        ...
                    }
                },
                ...
            }
        }
    """
    snapshot: dict = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pages": {},
    }

    # Build initial URL set
    urls_to_crawl = set()
    for path in SEED_PATHS:
        url = f"{DOCS_BASE_URL}{path}" if path else DOCS_BASE_URL
        urls_to_crawl.add(url.rstrip("/"))

    crawled: set[str] = set()

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        # Crawl in waves (max 3 waves to avoid infinite loops)
        for wave in range(3):
            pending = urls_to_crawl - crawled
            if not pending:
                break
            logger.info("Docs crawl wave %d: %d pages", wave + 1, len(pending))

            for url in sorted(pending):
                html = await _fetch_page(client, url)
                crawled.add(url)
                if not html:
                    continue

                sections = _extract_sections(html)
                page_data: dict = {"sections": {}}
                for heading, text in sections.items():
                    page_data["sections"][heading] = {
                        "text": text[:2000],  # Cap for storage
                        "hash": _section_hash(text),
                    }
                snapshot["pages"][url] = page_data

                # Discover new links
                for link in _discover_links(html):
                    normalised = link.rstrip("/")
                    if normalised not in crawled:
                        urls_to_crawl.add(normalised)

    logger.info(
        "Docs snapshot complete: %d pages, %d total sections",
        len(snapshot["pages"]),
        sum(len(p["sections"]) for p in snapshot["pages"].values()),
    )
    return snapshot


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


def save_snapshot(snapshot: dict, label: str = "latest") -> Path:
    """Persist a snapshot to disk atomically."""
    path = _snapshot_path(label)
    _atomic_write(path, json.dumps(snapshot, indent=2))
    logger.info("Saved docs snapshot to %s", path)
    return path


def load_snapshot(label: str = "latest") -> Optional[dict]:
    """Load a saved snapshot from disk."""
    path = _snapshot_path(label)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        logger.warning("Failed to load snapshot %s: %s", path, e)
        return None


def diff_snapshots(old: dict, new: dict) -> list[dict]:
    """Compare two snapshots and return a list of changes.

    Each change dict::

        {
            "type": "added" | "removed" | "modified",
            "page": "<url>",
            "section": "<heading>",
            "old_text": "..." | None,
            "new_text": "..." | None,
        }
    """
    changes: list[dict] = []
    old_pages = old.get("pages", {})
    new_pages = new.get("pages", {})

    all_urls = set(old_pages.keys()) | set(new_pages.keys())

    for url in sorted(all_urls):
        old_page = old_pages.get(url, {}).get("sections", {})
        new_page = new_pages.get(url, {}).get("sections", {})

        all_sections = set(old_page.keys()) | set(new_page.keys())

        for section in sorted(all_sections):
            old_sec = old_page.get(section)
            new_sec = new_page.get(section)

            if old_sec is None and new_sec is not None:
                changes.append({
                    "type": "added",
                    "page": url,
                    "section": section,
                    "old_text": None,
                    "new_text": new_sec.get("text", ""),
                })
            elif old_sec is not None and new_sec is None:
                changes.append({
                    "type": "removed",
                    "page": url,
                    "section": section,
                    "old_text": old_sec.get("text", ""),
                    "new_text": None,
                })
            elif old_sec and new_sec and old_sec.get("hash") != new_sec.get("hash"):
                changes.append({
                    "type": "modified",
                    "page": url,
                    "section": section,
                    "old_text": old_sec.get("text", ""),
                    "new_text": new_sec.get("text", ""),
                })

    return changes


def changes_to_updates(changes: list[dict]) -> list[Update]:
    """Convert diff changes to Update objects for the analyzer pipeline."""
    updates: list[Update] = []

    for change in changes:
        if change["type"] == "added":
            title = f"New docs section: {change['section']}"
            content = change["new_text"] or ""
        elif change["type"] == "removed":
            title = f"Removed docs section: {change['section']}"
            content = f"Previously: {(change['old_text'] or '')[:300]}"
        else:
            title = f"Updated docs section: {change['section']}"
            content = change["new_text"] or ""

        updates.append(Update(
            source="docs_diff",
            title=title[:200],
            content=content[:500],
            url=change["page"],
            date=datetime.now(timezone.utc).isoformat(),
            tags=_extract_diff_tags(title, content),
        ))

    return updates


def _extract_diff_tags(title: str, content: str) -> list[str]:
    """Extract tags from a diff change."""
    combined = f"{title} {content}".lower()
    tags = ["docs-change"]
    tag_map = {
        "hook": "hooks",
        "mcp": "mcp",
        "skill": "skills",
        "agent": "agents",
        "permission": "permissions",
        "subagent": "subagents",
        "memory": "memory",
        "cli": "cli",
        "sdk": "sdk",
        "settings": "settings",
        "ide": "ide",
        "security": "security",
    }
    for keyword, tag in tag_map.items():
        if keyword in combined and tag not in tags:
            tags.append(tag)
    return tags


async def run_docs_diff() -> tuple[list[Update], str]:
    """Main entry point: snapshot docs, diff against previous, return updates.

    Returns:
        (updates, summary_message)
    """
    # Load previous snapshot
    old_snapshot = load_snapshot("latest")

    # Take new snapshot
    new_snapshot = await snapshot_docs()

    if old_snapshot is None:
        # First run — save baseline, no diffs yet
        save_snapshot(new_snapshot, "latest")
        page_count = len(new_snapshot.get("pages", {}))
        section_count = sum(
            len(p.get("sections", {}))
            for p in new_snapshot.get("pages", {}).values()
        )
        return [], (
            f"📸 First docs snapshot saved as baseline.\n"
            f"Crawled {page_count} pages, {section_count} sections.\n"
            f"Run again later to detect changes."
        )

    # Diff
    changes = diff_snapshots(old_snapshot, new_snapshot)

    # Atomic rotation: write new to temp label, rotate old→previous, temp→latest
    save_snapshot(new_snapshot, "incoming")
    save_snapshot(old_snapshot, "previous")
    incoming_path = _snapshot_path("incoming")
    latest_path = _snapshot_path("latest")
    os.replace(str(incoming_path), str(latest_path))

    if not changes:
        return [], "✅ No documentation changes detected since last snapshot."

    updates = changes_to_updates(changes)

    added = sum(1 for c in changes if c["type"] == "added")
    removed = sum(1 for c in changes if c["type"] == "removed")
    modified = sum(1 for c in changes if c["type"] == "modified")

    summary = (
        f"📝 Documentation changes detected:\n"
        f"- {added} section(s) added\n"
        f"- {modified} section(s) modified\n"
        f"- {removed} section(s) removed\n"
        f"- {len(updates)} update(s) generated for analysis"
    )

    return updates, summary
