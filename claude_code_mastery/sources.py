"""Data source fetchers for Claude Code updates.

Sources are divided into two tiers:

**Tier 1 — Structured feeds (reliable):**
- GitHub Releases API (JSON) / Atom feed
- Reddit JSON / Atom feed
- PyPI RSS feed
- npm Registry JSON API

**Tier 2 — Scraping (best-effort):**
- Anthropic Blog (HTML scraping — no RSS available)
- Anthropic Changelog (HTML scraping)
- Claude Code Docs (HTML scraping — also used by docs differ)
- Boris Cherny's X (meta tag extraction only)
- Anthropic YouTube (script tag extraction)

Tier 1 sources are tried first; Tier 2 are used for sources that
lack structured feeds.
"""

import asyncio
import hashlib
import logging
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field, asdict
from typing import Optional

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


# --- Data Models ---

@dataclass
class Update:
    """A single update/announcement about Claude Code."""
    source: str  # "x_boris", "anthropic_blog", "anthropic_changelog", "anthropic_docs", "github_releases", "youtube_anthropic", "reddit_claude"
    title: str
    content: str
    url: str
    date: str  # ISO format
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


# --- Constants ---

BORIS_X_URL = "https://x.com/anthropaboris"
ANTHROPIC_BLOG_URL = "https://www.anthropic.com/news"
ANTHROPIC_CHANGELOG_URL = "https://docs.anthropic.com/en/changelog"
ANTHROPIC_DOCS_URL = "https://docs.anthropic.com/en/docs"
CLAUDE_CODE_DOCS_URL = "https://docs.anthropic.com/en/docs/claude-code"

# New sources
GITHUB_RELEASES_URL = "https://github.com/anthropics/claude-code/releases"
GITHUB_RELEASES_API = "https://api.github.com/repos/anthropics/claude-code/releases"
GITHUB_RELEASES_ATOM = "https://github.com/anthropics/claude-code/releases.atom"
ANTHROPIC_YOUTUBE_URL = "https://www.youtube.com/@anthropic-ai"
REDDIT_CLAUDE_URL = "https://www.reddit.com/r/ClaudeAI"
REDDIT_CLAUDE_JSON = "https://www.reddit.com/r/ClaudeAI/new.json"
REDDIT_CLAUDE_RSS = "https://www.reddit.com/r/ClaudeAI/.rss"

# Tier 1: Structured API/feed endpoints
PYPI_RSS_URL = "https://pypi.org/rss/project/anthropic/releases.xml"
NPM_REGISTRY_URL = "https://registry.npmjs.org/@anthropic-ai/claude-code"

# Atom namespace
ATOM_NS = "http://www.w3.org/2005/Atom"

# Keywords that signal Claude Code relevance
CLAUDE_CODE_KEYWORDS = [
    "claude code", "claude-code", "@anthropic-ai/claude-code",
    "mcp", "model context protocol", "claude.md", "CLAUDE.md",
    "hooks", "slash commands", "agent", "agentic",
    "parallel sessions", "skills", "skill.md",
    "opus", "sonnet", "haiku", "claude 4", "claude 3.5",
    "terminal", "cli", "command line",
    "npm install", "pip install",
    "context window", "token",
    "tool use", "function calling",
    "anthropic api", "sdk",
    "plan mode", "auto mode",
    "git integration", "github",
    "agent teams", "multi-agent",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


# --- Fetchers ---

async def fetch_boris_x_posts(days_back: int = 30) -> list[Update]:
    """
    Fetch recent posts from Boris Cherny's X account.
    Best-effort only — X blocks most scraping. Returns what we can get
    from the public profile meta tags.
    """
    username = "anthropaboris"
    url = f"https://x.com/{username}"

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers=HEADERS)
            if response.status_code != 200:
                logger.info("X returned %d for %s", response.status_code, url)
                return []
    except httpx.HTTPError as e:
        logger.info("X fetch failed for %s: %s", url, e)
        return []

    updates = []
    soup = BeautifulSoup(response.text, "html.parser")

    for meta in [
        soup.find("meta", {"name": "description"}),
        soup.find("meta", {"property": "og:description"}),
    ]:
        if not meta:
            continue
        content = meta.get("content", "")
        if content and _is_claude_relevant(content):
            updates.append(Update(
                source="x_boris",
                title=_extract_title(content),
                content=content,
                url=url,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(content),
            ))

    logger.info("X/Boris: found %d updates", len(updates))
    return updates


async def fetch_anthropic_blog(days_back: int = 30) -> list[Update]:
    """Fetch recent Claude-related posts from Anthropic's blog."""
    updates = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(ANTHROPIC_BLOG_URL, headers=HEADERS)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    articles = soup.select("a[href*='/news/'], a[href*='/research/'], article a")

    seen_urls = set()
    for article in articles[:30]:
        try:
            href = article.get("href", "")
            if not href or href in seen_urls:
                continue

            full_url = href if href.startswith("http") else f"https://www.anthropic.com{href}"
            seen_urls.add(href)

            title_el = article.select_one("h2, h3, .title, span")
            title = title_el.get_text(strip=True) if title_el else ""
            if not title:
                title = article.get_text(strip=True)[:100]

            desc_el = article.select_one("p, .description, .summary")
            desc = desc_el.get_text(strip=True) if desc_el else ""

            combined = f"{title} {desc}".lower()

            if not any(kw in combined for kw in ["claude code", "claude-code", "mcp", "developer", "tool", "agent", "sdk", "api", "model", "opus", "sonnet", "haiku", "claude 4", "claude 3"]):
                continue

            date_el = article.select_one("time, .date, [datetime]")
            date_str = ""
            if date_el:
                date_str = date_el.get("datetime", date_el.get_text(strip=True))

            if date_str and not _is_within_window(date_str, cutoff):
                continue

            updates.append(Update(
                source="anthropic_blog",
                title=title,
                content=desc or title,
                url=full_url,
                date=date_str or datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(combined),
            ))
        except Exception as e:
            logger.debug("Skipping blog article: %s", e)
            continue

    logger.info("Anthropic Blog: found %d updates", len(updates))
    return updates


async def fetch_anthropic_changelog(days_back: int = 30) -> list[Update]:
    """Fetch recent entries from Anthropic's changelog."""
    updates = []

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(ANTHROPIC_CHANGELOG_URL, headers=HEADERS)
            response.raise_for_status()
    except httpx.HTTPError as e:
        logger.warning("Anthropic Changelog fetch failed: %s", e)
        return []

    soup = BeautifulSoup(response.text, "html.parser")

    entries = soup.select("article, .changelog-entry, section, [class*='changelog']")
    if not entries:
        entries = soup.select("h2, h3")

    for entry in entries[:20]:
        try:
            title = entry.get_text(strip=True)[:200]
            if not title:
                continue

            content_parts = []
            sibling = entry.find_next_sibling()
            while sibling and sibling.name not in ["h2", "h3", "article"]:
                text = sibling.get_text(strip=True)
                if text:
                    content_parts.append(text)
                sibling = sibling.find_next_sibling()
                if len(content_parts) > 5:
                    break

            content = " ".join(content_parts)
            combined = f"{title} {content}".lower()

            if not _is_claude_relevant(combined):
                continue

            updates.append(Update(
                source="anthropic_changelog",
                title=title,
                content=content or title,
                url=ANTHROPIC_CHANGELOG_URL,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(combined),
            ))
        except Exception as e:
            logger.debug("Skipping changelog entry: %s", e)
            continue

    logger.info("Anthropic Changelog: found %d updates", len(updates))
    return updates


async def fetch_claude_code_docs() -> list[Update]:
    """Fetch current Claude Code documentation structure for gap analysis."""
    updates = []

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(CLAUDE_CODE_DOCS_URL, headers=HEADERS)
            response.raise_for_status()
    except httpx.HTTPError as e:
        logger.warning("Claude Code Docs fetch failed: %s", e)
        return []

    soup = BeautifulSoup(response.text, "html.parser")

    # Extract documentation sections/features
    sections = soup.select("a[href*='/docs/claude-code'], nav a, .sidebar a")

    seen = set()
    for section in sections:
        try:
            title = section.get_text(strip=True)
            href = section.get("href", "")
            if not title or title in seen:
                continue
            seen.add(title)

            full_url = href if href.startswith("http") else f"https://docs.anthropic.com{href}"

            updates.append(Update(
                source="anthropic_docs",
                title=title,
                content=f"Documentation section: {title}",
                url=full_url,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(title.lower()),
            ))
        except Exception as e:
            logger.debug("Skipping doc section: %s", e)
            continue

    logger.info("Claude Code Docs: found %d sections", len(updates))
    return updates


async def fetch_github_releases(days_back: int = 30) -> list[Update]:
    """Fetch recent releases from the Claude Code GitHub repository."""
    updates = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    # Try the GitHub API first (structured JSON, no auth needed for public repos)
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            response = await client.get(
                GITHUB_RELEASES_API,
                headers={
                    **HEADERS,
                    "Accept": "application/vnd.github+json",
                },
                params={"per_page": 30},
            )
            response.raise_for_status()
            releases = response.json()

            for release in releases:
                title = release.get("name", "") or release.get("tag_name", "")
                body = release.get("body", "") or ""
                tag = release.get("tag_name", "")
                url = release.get("html_url", GITHUB_RELEASES_URL)
                date = release.get("published_at", "")

                if not title:
                    continue

                if date and not _is_within_window(date, cutoff):
                    continue

                content = f"Release {tag}: {body[:500]}" if body else f"Release {tag}"

                updates.append(Update(
                    source="github_releases",
                    title=f"Claude Code {title}",
                    content=content,
                    url=url,
                    date=date or datetime.now(timezone.utc).isoformat(),
                    tags=["claude-code", "release"] + _extract_tags(f"{title} {body}".lower()),
                ))

            logger.info("GitHub Releases (API): found %d updates", len(updates))
            return updates

        except Exception as e:
            logger.warning("GitHub API failed, trying HTML fallback: %s", e)

    # Fallback: scrape the releases HTML page
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(GITHUB_RELEASES_URL, headers=HEADERS)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        release_entries = soup.select("[data-test-selector='release-entry'], .release, section")

        for entry in release_entries[:20]:
            title_el = entry.select_one("h2 a, .release-title a, a[href*='/releases/tag/']")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            href = title_el.get("href", "")
            url = f"https://github.com{href}" if href.startswith("/") else href

            body_el = entry.select_one(".markdown-body, .release-body")
            body = body_el.get_text(strip=True)[:500] if body_el else ""

            date_el = entry.select_one("relative-time, time")
            date = date_el.get("datetime", "") if date_el else ""

            if date and not _is_within_window(date, cutoff):
                continue

            updates.append(Update(
                source="github_releases",
                title=f"Claude Code {title}",
                content=body or title,
                url=url,
                date=date or datetime.now(timezone.utc).isoformat(),
                tags=["claude-code", "release"] + _extract_tags(f"{title} {body}".lower()),
            ))

        logger.info("GitHub Releases (HTML): found %d updates", len(updates))
    except Exception as e:
        logger.warning("GitHub HTML fallback also failed: %s", e)

    return updates


async def fetch_anthropic_youtube(days_back: int = 30) -> list[Update]:
    """Fetch recent videos from Anthropic's YouTube channel."""
    updates = []

    # YouTube channel page — scrape video titles and descriptions
    urls_to_try = [
        "https://www.youtube.com/@anthropic-ai/videos",
        "https://www.youtube.com/@AnthropicAI/videos",
    ]

    for url in urls_to_try:
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(url, headers=HEADERS)
                if response.status_code != 200:
                    continue

            soup = BeautifulSoup(response.text, "html.parser")

            # YouTube embeds video data in script tags as JSON
            scripts = soup.find_all("script")
            for script in scripts:
                text = script.get_text()
                if "videoRenderer" not in text and "gridVideoRenderer" not in text:
                    continue

                # Extract video titles using regex
                title_matches = re.findall(r'"title":\{"runs":\[\{"text":"([^"]+)"\}', text)
                video_id_matches = re.findall(r'"videoId":"([^"]+)"', text)
                desc_matches = re.findall(r'"descriptionSnippet":\{"runs":\[\{"text":"([^"]+)"', text)

                for i, title in enumerate(title_matches[:15]):
                    if not _is_claude_relevant(title.lower()):
                        continue

                    video_id = video_id_matches[i] if i < len(video_id_matches) else ""
                    desc = desc_matches[i] if i < len(desc_matches) else ""
                    video_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else url

                    updates.append(Update(
                        source="youtube_anthropic",
                        title=title,
                        content=desc or title,
                        url=video_url,
                        date=datetime.now(timezone.utc).isoformat(),
                        tags=["video"] + _extract_tags(f"{title} {desc}".lower()),
                    ))

                if updates:
                    break  # Got data from script tags

            # Fallback: try meta tags
            if not updates:
                meta_tags = soup.find_all("meta", {"property": "og:title"})
                for meta in meta_tags:
                    title = meta.get("content", "")
                    if _is_claude_relevant(title.lower()):
                        updates.append(Update(
                            source="youtube_anthropic",
                            title=title,
                            content=title,
                            url=url,
                            date=datetime.now(timezone.utc).isoformat(),
                            tags=["video"] + _extract_tags(title.lower()),
                        ))

            if updates:
                break  # Found results from this URL

        except Exception as e:
            logger.debug("YouTube fetch failed for %s: %s", url, e)
            continue

    logger.info("Anthropic YouTube: found %d updates", len(updates))
    return updates


async def fetch_reddit_claude(days_back: int = 30) -> list[Update]:
    """Fetch recent posts from r/ClaudeAI subreddit."""
    updates = []
    cutoff_ts = (datetime.now(timezone.utc) - timedelta(days=days_back)).timestamp()

    # Reddit provides JSON feeds without authentication
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(
                REDDIT_CLAUDE_JSON,
                headers={
                    "User-Agent": "CurriculumUpdater/1.0 (Claude Code Learning Tool)",
                    "Accept": "application/json",
                },
                params={"limit": 50},
            )
            response.raise_for_status()
            data = response.json()

        posts = data.get("data", {}).get("children", [])

        for post in posts:
            post_data = post.get("data", {})
            title = post_data.get("title", "")
            selftext = post_data.get("selftext", "")
            url = post_data.get("url", "")
            permalink = post_data.get("permalink", "")
            created = post_data.get("created_utc", 0)
            score = post_data.get("score", 0)
            flair = post_data.get("link_flair_text", "") or ""

            if not title:
                continue

            # Filter by date window
            if created and created < cutoff_ts:
                continue

            combined = f"{title} {selftext} {flair}".lower()

            if not _is_claude_relevant(combined):
                continue

            if score < 5:
                continue

            post_url = f"https://www.reddit.com{permalink}" if permalink else url
            date_str = datetime.fromtimestamp(created, tz=timezone.utc).isoformat() if created else ""

            updates.append(Update(
                source="reddit_claude",
                title=title,
                content=selftext[:500] if selftext else title,
                url=post_url,
                date=date_str,
                tags=["community"] + _extract_tags(combined),
            ))

        logger.info("Reddit (JSON): found %d updates", len(updates))

    except Exception as e:
        logger.warning("Reddit JSON feed failed, trying HTML: %s", e)

    # Fallback: scrape HTML if JSON fails
    if not updates:
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(REDDIT_CLAUDE_URL, headers=HEADERS)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "html.parser")
                    post_links = soup.select("a[href*='/r/ClaudeAI/comments/']")

                    seen_urls = set()
                    for link in post_links[:30]:
                        title = link.get_text(strip=True)
                        href = link.get("href", "")
                        if not title or len(title) < 10 or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        if not _is_claude_relevant(title.lower()):
                            continue

                        full_url = href if href.startswith("http") else f"https://www.reddit.com{href}"

                        updates.append(Update(
                            source="reddit_claude",
                            title=title,
                            content=title,
                            url=full_url,
                            date=datetime.now(timezone.utc).isoformat(),
                            tags=["community"] + _extract_tags(title.lower()),
                        ))

                    logger.info("Reddit (HTML fallback): found %d updates", len(updates))
        except Exception as e:
            logger.warning("Reddit HTML fallback also failed: %s", e)

    return updates


# --- Tier 1: Structured Feed Fetchers ---

async def fetch_github_releases_atom(days_back: int = 30) -> list[Update]:
    """Fetch releases via GitHub's Atom feed (more reliable than API for unauthenticated use)."""
    updates = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(GITHUB_RELEASES_ATOM, headers=HEADERS)
            response.raise_for_status()

        root = ET.fromstring(response.text)
        entries = root.findall(f"{{{ATOM_NS}}}entry")

        for entry in entries[:30]:
            title_el = entry.find(f"{{{ATOM_NS}}}title")
            updated_el = entry.find(f"{{{ATOM_NS}}}updated")
            link_el = entry.find(f"{{{ATOM_NS}}}link[@rel='alternate']")
            content_el = entry.find(f"{{{ATOM_NS}}}content")

            title = title_el.text.strip() if title_el is not None and title_el.text else ""
            date_str = updated_el.text.strip() if updated_el is not None and updated_el.text else ""
            url = link_el.get("href", GITHUB_RELEASES_URL) if link_el is not None else GITHUB_RELEASES_URL

            if not title:
                continue

            if date_str and not _is_within_window(date_str, cutoff):
                continue

            # Extract text from HTML content
            body = ""
            if content_el is not None and content_el.text:
                soup = BeautifulSoup(content_el.text, "html.parser")
                body = soup.get_text(separator="\n", strip=True)[:500]

            updates.append(Update(
                source="github_releases",
                title=f"Claude Code {title}",
                content=f"Release {title}: {body}" if body else f"Release {title}",
                url=url,
                date=date_str or datetime.now(timezone.utc).isoformat(),
                tags=["claude-code", "release"] + _extract_tags(f"{title} {body}".lower()),
            ))

        logger.info("GitHub Releases (Atom feed): found %d updates", len(updates))
    except Exception as e:
        logger.warning("GitHub Atom feed failed: %s", e)

    return updates


async def fetch_reddit_atom(days_back: int = 30) -> list[Update]:
    """Fetch posts from r/ClaudeAI via Atom feed (more reliable than JSON API)."""
    updates = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(
                REDDIT_CLAUDE_RSS,
                headers={
                    "User-Agent": "CurriculumUpdater/1.0 (Claude Code Learning Tool)",
                    "Accept": "application/atom+xml, application/xml, text/xml",
                },
            )
            response.raise_for_status()

        root = ET.fromstring(response.text)
        entries = root.findall(f"{{{ATOM_NS}}}entry")

        for entry in entries[:50]:
            title_el = entry.find(f"{{{ATOM_NS}}}title")
            updated_el = entry.find(f"{{{ATOM_NS}}}updated")
            link_el = entry.find(f"{{{ATOM_NS}}}link[@rel='alternate']")
            content_el = entry.find(f"{{{ATOM_NS}}}content")
            category_el = entry.find(f"{{{ATOM_NS}}}category")

            title = title_el.text.strip() if title_el is not None and title_el.text else ""
            date_str = updated_el.text.strip() if updated_el is not None and updated_el.text else ""
            url = link_el.get("href", REDDIT_CLAUDE_URL) if link_el is not None else REDDIT_CLAUDE_URL
            flair = category_el.get("term", "") if category_el is not None else ""

            if not title:
                continue

            if date_str and not _is_within_window(date_str, cutoff):
                continue

            # Extract text from HTML content
            body = ""
            if content_el is not None and content_el.text:
                soup = BeautifulSoup(content_el.text, "html.parser")
                body = soup.get_text(separator=" ", strip=True)[:500]

            combined = f"{title} {body} {flair}".lower()
            if not _is_claude_relevant(combined):
                continue

            updates.append(Update(
                source="reddit_claude",
                title=title,
                content=body[:500] if body else title,
                url=url,
                date=date_str or datetime.now(timezone.utc).isoformat(),
                tags=["community"] + _extract_tags(combined),
            ))

        logger.info("Reddit (Atom feed): found %d updates", len(updates))
    except Exception as e:
        logger.warning("Reddit Atom feed failed: %s", e)

    return updates


async def fetch_pypi_releases(days_back: int = 30) -> list[Update]:
    """Fetch Anthropic Python SDK releases from PyPI RSS feed."""
    updates = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(PYPI_RSS_URL, headers=HEADERS)
            response.raise_for_status()

        root = ET.fromstring(response.text)
        items = root.findall(".//item")

        for item in items[:20]:
            title_el = item.find("title")
            link_el = item.find("link")
            pubdate_el = item.find("pubDate")

            version = title_el.text.strip() if title_el is not None and title_el.text else ""
            url = link_el.text.strip() if link_el is not None and link_el.text else ""
            date_str = pubdate_el.text.strip() if pubdate_el is not None and pubdate_el.text else ""

            if not version:
                continue

            # Parse RFC 2822 date format from RSS
            if date_str:
                try:
                    from email.utils import parsedate_to_datetime
                    dt = parsedate_to_datetime(date_str)
                    if dt < cutoff:
                        continue
                    date_str = dt.isoformat()
                except Exception:
                    pass

            updates.append(Update(
                source="pypi_releases",
                title=f"Anthropic Python SDK {version}",
                content=f"New release of the anthropic Python package: version {version}",
                url=url or f"https://pypi.org/project/anthropic/{version}/",
                date=date_str or datetime.now(timezone.utc).isoformat(),
                tags=["sdk", "python", "release"],
            ))

        logger.info("PyPI Releases (RSS): found %d updates", len(updates))
    except Exception as e:
        logger.warning("PyPI RSS feed failed: %s", e)

    return updates


async def fetch_npm_releases(days_back: int = 30) -> list[Update]:
    """Fetch Claude Code npm package releases from the npm registry API."""
    updates = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(
                NPM_REGISTRY_URL,
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            data = response.json()

        time_map = data.get("time", {})
        dist_tags = data.get("dist-tags", {})
        latest_version = dist_tags.get("latest", "")

        # Get versions published within the time window
        for version, published_at in sorted(time_map.items(), key=lambda x: x[1], reverse=True):
            if version in ("created", "modified"):
                continue

            try:
                dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                if dt < cutoff:
                    break  # Sorted desc — all remaining are older
                date_str = dt.isoformat()
            except Exception:
                date_str = published_at

            is_latest = version == latest_version
            title = f"Claude Code npm {version}"
            if is_latest:
                title += " (latest)"

            updates.append(Update(
                source="npm_releases",
                title=title,
                content=f"@anthropic-ai/claude-code@{version} published to npm",
                url=f"https://www.npmjs.com/package/@anthropic-ai/claude-code/v/{version}",
                date=date_str,
                tags=["claude-code", "npm", "release"],
            ))

        logger.info("npm Registry: found %d updates", len(updates))
    except Exception as e:
        logger.warning("npm registry fetch failed: %s", e)

    return updates


@dataclass
class FetchResult:
    """Result of fetching from all sources, including any errors."""
    updates: list[Update]
    errors: list[str]


async def fetch_all_updates(days_back: int = 30) -> FetchResult:
    """Fetch updates from all sources. Returns combined, deduplicated list plus errors.

    Uses Tier 1 feeds (structured APIs) as primary sources, with Tier 2
    scrapers for sources that don't provide feeds. If a Tier 1 feed fails,
    falls back to the equivalent Tier 2 scraper.
    """
    all_updates = []
    errors = []

    # Tier 1 feeds — reliable structured data
    tier1_fetchers = {
        "GitHub Releases (Atom)": fetch_github_releases_atom(days_back),
        "Reddit r/ClaudeAI (Atom)": fetch_reddit_atom(days_back),
        "PyPI Releases (RSS)": fetch_pypi_releases(days_back),
        "npm Registry (API)": fetch_npm_releases(days_back),
    }

    # Tier 2 scrapers — best-effort HTML scraping
    tier2_fetchers = {
        "Boris Cherny X": fetch_boris_x_posts(days_back),
        "Anthropic Blog": fetch_anthropic_blog(days_back),
        "Anthropic Changelog": fetch_anthropic_changelog(days_back),
        "Claude Code Docs": fetch_claude_code_docs(),
        "Anthropic YouTube": fetch_anthropic_youtube(days_back),
    }

    # Run all Tier 1 feeds first
    tier1_settled = await asyncio.gather(
        *tier1_fetchers.values(), return_exceptions=True
    )

    github_from_feed = False
    reddit_from_feed = False

    for name, result in zip(tier1_fetchers, tier1_settled):
        if isinstance(result, Exception):
            logger.warning("Tier 1 source '%s' failed: %s", name, result)
            errors.append(f"{name}: {type(result).__name__}: {result}")
        elif result:
            all_updates.extend(result)
            if "GitHub" in name:
                github_from_feed = True
            if "Reddit" in name:
                reddit_from_feed = True

    # Add Tier 2 fallback scrapers for sources whose feeds failed
    if not github_from_feed:
        tier2_fetchers["GitHub Releases (HTML)"] = fetch_github_releases(days_back)
    if not reddit_from_feed:
        tier2_fetchers["Reddit r/ClaudeAI (JSON)"] = fetch_reddit_claude(days_back)

    # Run Tier 2 scrapers
    tier2_settled = await asyncio.gather(
        *tier2_fetchers.values(), return_exceptions=True
    )

    for name, result in zip(tier2_fetchers, tier2_settled):
        if isinstance(result, Exception):
            logger.error("Tier 2 source '%s' failed: %s", name, result)
            errors.append(f"{name}: {type(result).__name__}: {result}")
        else:
            all_updates.extend(result)

    # Deduplicate by content hash (not just first N chars)
    seen_hashes = set()
    unique_updates = []
    for u in all_updates:
        h = _content_hash(u)
        if h not in seen_hashes:
            seen_hashes.add(h)
            unique_updates.append(u)

    total_sources = len(tier1_fetchers) + len(tier2_fetchers)
    logger.info(
        "Total: %d unique updates from %d sources (%d errors)",
        len(unique_updates), total_sources - len(errors), len(errors),
    )
    return FetchResult(updates=unique_updates, errors=errors)


# --- Helpers ---

def _is_claude_relevant(text: str) -> bool:
    """Check if text is relevant to Claude Code / developer tools."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in CLAUDE_CODE_KEYWORDS)


def _extract_title(text: str) -> str:
    """Extract a short title from a longer text."""
    # Use first sentence or first 80 chars
    first_sentence = re.split(r'[.!?\n]', text)[0].strip()
    if len(first_sentence) > 80:
        return first_sentence[:77] + "..."
    return first_sentence


def _content_hash(update: Update) -> str:
    """Generate a stable hash for deduplication. Uses source + title + first 200 chars of content."""
    raw = f"{update.source}:{update.title}:{update.content[:200]}".lower().strip()
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _is_within_window(date_str: str, cutoff: datetime) -> bool:
    """Check if a date string falls within the time window (after cutoff).
    Returns True if date can't be parsed (benefit of the doubt)."""
    try:
        # Handle common ISO formats
        cleaned = date_str.strip()
        # Strip timezone name suffixes like " UTC"
        for suffix in (" UTC", " GMT"):
            if cleaned.endswith(suffix):
                cleaned = cleaned[:-len(suffix)] + "+00:00"

        # Try full ISO parse
        dt = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt >= cutoff
    except (ValueError, TypeError):
        return True  # Can't parse — include it


def _extract_tags(text: str) -> list[str]:
    """Extract relevant tags from text."""
    text_lower = text.lower()
    tags = []
    tag_map = {
        "claude code": "claude-code",
        "mcp": "mcp",
        "model context protocol": "mcp",
        "hooks": "hooks",
        "skills": "skills",
        "agent teams": "agent-teams",
        "parallel sessions": "parallel-sessions",
        "opus": "model-update",
        "sonnet": "model-update",
        "haiku": "model-update",
        "api": "api",
        "sdk": "sdk",
        "claude.md": "claude-md",
        "plan mode": "plan-mode",
        "context window": "context-window",
        "git": "git",
        "tool use": "tool-use",
    }
    for keyword, tag in tag_map.items():
        if keyword in text_lower and tag not in tags:
            tags.append(tag)
    return tags
