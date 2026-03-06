"""
Claude Code Mastery — MCP Server

Monitors Claude Code updates from multiple sources, performs gap analysis
against the 12-week curriculum, and auto-applies changes.

Sources: Boris Cherny's X, Anthropic blog, changelog, docs, GitHub releases,
YouTube, Reddit r/ClaudeAI.
"""

import logging
import re
from datetime import datetime, timezone
from typing import Optional

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, ConfigDict

from .sources import (
    fetch_boris_x_posts,
    fetch_anthropic_blog,
    fetch_anthropic_changelog,
    fetch_claude_code_docs,
    fetch_github_releases,
    fetch_anthropic_youtube,
    fetch_reddit_claude,
    fetch_github_releases_atom,
    fetch_reddit_atom,
    fetch_pypi_releases,
    fetch_npm_releases,
    fetch_all_updates,
    FetchResult,
    Update,
)
from .analyzer import (
    analyze_gaps,
    generate_update_report,
    load_curriculum_file,
    save_curriculum_file,
    apply_single_update,
    CurriculumUpdate,
    CURRICULUM_TOPIC_MAP,
)
from .cache import (
    load_cache,
    save_cache,
    mark_update_seen,
    mark_updates_seen,
    mark_update_applied,
    is_update_seen,
    get_update_key,
    get_last_check_time,
    load_curriculum_state,
    save_curriculum_state,
)
from .docs_differ import run_docs_diff
from .scheduler import (
    run_scheduled_check,
    load_scheduler_config,
    save_scheduler_config,
    install_launchd,
    generate_crontab_entry,
    _sync_to_site,
)

logger = logging.getLogger(__name__)

# --- Initialize Server ---

mcp = FastMCP("claude_code_mastery")


# --- Input Models ---

class FetchUpdatesInput(BaseModel):
    """Input for fetching updates from all sources."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    days_back: int = Field(
        default=30,
        description="Number of days to look back for updates (1-90)",
        ge=1, le=90,
    )
    source: Optional[str] = Field(
        default=None,
        description="Specific source to fetch from: 'boris_x', 'anthropic_blog', 'anthropic_changelog', 'anthropic_docs', 'github_releases', 'youtube', 'reddit', or None for all sources",
    )
    include_seen: bool = Field(
        default=False,
        description="Include updates that have already been seen/processed",
    )


class AnalyzeGapsInput(BaseModel):
    """Input for analyzing curriculum gaps."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    curriculum_path: Optional[str] = Field(
        default=None,
        description="Path to the curriculum markdown file. If not provided, uses the built-in topic map.",
    )
    days_back: int = Field(
        default=30,
        description="Number of days to look back for updates (1-90)",
        ge=1, le=90,
    )
    priority_filter: Optional[str] = Field(
        default=None,
        description="Filter results by priority: 'high', 'medium', 'low', or None for all",
    )


class SetCurriculumPathInput(BaseModel):
    """Input for setting the curriculum file path."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    path: str = Field(
        ...,
        description="Full path to the curriculum markdown file (e.g., '~/projects/curriculum/curriculum.md')",
        min_length=1,
    )
    current_week: int = Field(
        default=1,
        description="Your current week in the curriculum (1-12)",
        ge=1, le=12,
    )


class GetStatusInput(BaseModel):
    """Input for getting current status."""
    model_config = ConfigDict(extra="forbid")
    verbose: bool = Field(
        default=False,
        description="Include detailed cache and state information",
    )


# --- Tools ---

@mcp.tool(
    name="curriculum_fetch_updates",
    annotations={
        "title": "Fetch Claude Code Updates",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
async def curriculum_fetch_updates(params: FetchUpdatesInput) -> str:
    """Fetch the latest Claude Code updates from Boris Cherny's X account,
    Anthropic blog, changelog, and documentation.

    Monitors multiple sources for new features, deprecations, model updates,
    and tool changes relevant to your Claude Code learning curriculum.

    Args:
        params (FetchUpdatesInput): Fetch parameters including:
            - days_back (int): How far back to look (1-90 days)
            - source (str): Specific source or None for all
            - include_seen (bool): Whether to include already-processed updates

    Returns:
        str: Markdown-formatted list of discovered updates with source, date, and tags
    """
    try:
        errors = []

        # Fetch from specified or all sources
        if params.source:
            single_fetchers = {
                "boris_x": lambda: fetch_boris_x_posts(params.days_back),
                "anthropic_blog": lambda: fetch_anthropic_blog(params.days_back),
                "anthropic_changelog": lambda: fetch_anthropic_changelog(params.days_back),
                "anthropic_docs": lambda: fetch_claude_code_docs(),
                "github_releases": lambda: fetch_github_releases_atom(params.days_back),
                "youtube": lambda: fetch_anthropic_youtube(params.days_back),
                "reddit": lambda: fetch_reddit_atom(params.days_back),
                "pypi": lambda: fetch_pypi_releases(params.days_back),
                "npm": lambda: fetch_npm_releases(params.days_back),
            }
            fetcher = single_fetchers.get(params.source)
            if not fetcher:
                return f"Unknown source '{params.source}'. Valid sources: {', '.join(single_fetchers.keys())}"
            updates = await fetcher()
        else:
            result = await fetch_all_updates(params.days_back)
            updates = result.updates
            errors = result.errors

        # Filter out seen updates unless requested
        if not params.include_seen:
            updates = [
                u for u in updates
                if not is_update_seen(get_update_key(u.source, u.title))
            ]

        # Mark new updates as seen (single batch write)
        mark_updates_seen([get_update_key(u.source, u.title) for u in updates])

        if not updates:
            last_check = get_last_check_time()
            msg = (
                f"No new updates found in the last {params.days_back} days.\n"
                f"Last check: {last_check or 'Never'}\n\n"
                f"Try increasing days_back or use include_seen=true to see all updates."
            )
            if errors:
                msg += f"\n\n**Source errors ({len(errors)}):**\n"
                for e in errors:
                    msg += f"- {e}\n"
            return msg

        # Format results
        output = f"# Claude Code Updates ({len(updates)} found)\n\n"
        output += f"**Period:** Last {params.days_back} days\n"
        output += f"**Checked:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n\n"

        if errors:
            output += f"**Warning:** {len(errors)} source(s) failed:\n"
            for e in errors:
                output += f"- {e}\n"
            output += "\n"

        # Group by source
        SOURCE_LABELS = {
            "x_boris": "Boris Cherny (X)",
            "anthropic_blog": "Anthropic Blog",
            "anthropic_changelog": "Anthropic Changelog",
            "anthropic_docs": "Claude Code Docs",
            "github_releases": "GitHub Releases",
            "youtube_anthropic": "Anthropic YouTube",
            "reddit_claude": "Reddit r/ClaudeAI",
            "pypi_releases": "PyPI Releases",
            "npm_releases": "npm Releases",
            "docs_diff": "Documentation Changes",
        }

        by_source = {}
        for u in updates:
            source_name = SOURCE_LABELS.get(u.source, u.source)
            if source_name not in by_source:
                by_source[source_name] = []
            by_source[source_name].append(u)

        for source_name, source_updates in by_source.items():
            output += f"## {source_name}\n\n"
            for u in source_updates:
                tags_str = ", ".join(f"`{t}`" for t in u.tags) if u.tags else ""
                output += f"### {u.title}\n"
                output += f"- **Date:** {u.date}\n"
                if tags_str:
                    output += f"- **Tags:** {tags_str}\n"
                output += f"- **URL:** {u.url}\n"
                output += f"- **Content:** {u.content[:300]}\n\n"

        return output

    except Exception as e:
        logger.exception("Unexpected error in curriculum_fetch_updates")
        return f"Error fetching updates: {type(e).__name__}: {str(e)}\n\nThis may be due to network issues or rate limiting. Try again in a few minutes."


@mcp.tool(
    name="curriculum_analyze_gaps",
    annotations={
        "title": "Analyze Curriculum Gaps",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
async def curriculum_analyze_gaps(params: AnalyzeGapsInput) -> str:
    """Fetch latest updates and analyze gaps against your Claude Code curriculum.

    Compares recent updates from all sources against the curriculum's topic map
    to identify new features, deprecations, and changes that should be reflected
    in the learning material.

    Args:
        params (AnalyzeGapsInput): Analysis parameters including:
            - curriculum_path (str): Path to curriculum markdown file
            - days_back (int): How far back to look (1-90 days)
            - priority_filter (str): Filter by priority level

    Returns:
        str: Markdown report of gaps found with prioritized suggestions
    """
    try:
        # Fetch all updates
        result = await fetch_all_updates(params.days_back)

        # Load curriculum content — use explicit path, fall back to configured path
        curriculum_content = None
        curriculum_path = params.curriculum_path
        if not curriculum_path:
            state = load_curriculum_state()
            curriculum_path = state.get("path")
        if curriculum_path:
            curriculum_content = load_curriculum_file(curriculum_path)
            if curriculum_content is None:
                return f"Error: Could not read curriculum file at '{curriculum_path}'. Please check the path exists."

        # Analyze gaps
        gaps = analyze_gaps(result.updates, curriculum_content)

        # Filter by priority if requested
        if params.priority_filter:
            gaps = [g for g in gaps if g.priority == params.priority_filter]

        # Generate report
        report = generate_update_report(gaps)

        if result.errors:
            report += f"\n\n**Note:** {len(result.errors)} source(s) failed during fetch:\n"
            for e in result.errors:
                report += f"- {e}\n"

        return report

    except Exception as e:
        logger.exception("Unexpected error in curriculum_analyze_gaps")
        return f"Error analyzing gaps: {type(e).__name__}: {str(e)}"


@mcp.tool(
    name="curriculum_apply_update",
    annotations={
        "title": "Apply Curriculum Update",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    }
)
async def curriculum_apply_update(
    curriculum_path: str,
    week: int,
    section_title: str,
    content: str,
    reason: str,
    action: str = "append",
) -> str:
    """Apply a specific update to the curriculum markdown file.

    Modifies the curriculum file by appending content to an existing week,
    replacing a section, or adding a new appendix entry.

    Args:
        curriculum_path: Path to the curriculum markdown file to update.
        week: Week number to update (1-12), or 0 to add a new appendix section.
        section_title: Title of the new or updated section (e.g., 'Agent Teams Configuration').
        content: The content to add or replace in markdown format.
        reason: Brief explanation of why this update is needed.
        action: How to apply: 'append' (add to week), 'replace' (replace section), 'new' (new week/appendix).

    Returns:
        str: Confirmation of the update with details of what changed
    """
    try:
        # Validate inputs
        if not curriculum_path:
            return "Error: curriculum_path is required."
        if week < 0 or week > 12:
            return "Error: week must be between 0 and 12."
        if not section_title:
            return "Error: section_title is required."
        if not content:
            return "Error: content is required."
        if not reason:
            return "Error: reason is required."

        # Load current curriculum
        current = load_curriculum_file(curriculum_path)
        if current is None:
            return f"Error: Could not read curriculum file at '{curriculum_path}'."

        # Build a CurriculumUpdate and apply it
        cu = CurriculumUpdate(
            week=week,
            section=section_title,
            action=action,
            content=content,
            reason=reason,
        )
        try:
            updated = apply_single_update(current, cu)
        except ValueError as e:
            return f"Error: {e}"

        # Save the updated file
        if save_curriculum_file(curriculum_path, updated):
            mark_update_applied(
                f"manual::{section_title[:50]}",
                f"Week {week}: {section_title} ({action})"
            )
            # Sync to site/ and external copies
            _sync_to_site(curriculum_path, updated)

            return (
                f"**Curriculum updated successfully!**\n\n"
                f"- **File:** {curriculum_path}\n"
                f"- **Week:** {'Appendix' if week == 0 else f'Week {week}'}\n"
                f"- **Section:** {section_title}\n"
                f"- **Action:** {action}\n"
                f"- **Reason:** {reason}\n"
            )
        else:
            return f"Error: Failed to save updated curriculum to '{curriculum_path}'."

    except Exception as e:
        return f"Error applying update: {type(e).__name__}: {str(e)}"


@mcp.tool(
    name="curriculum_set_path",
    annotations={
        "title": "Set Curriculum File Path",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def curriculum_set_path(params: SetCurriculumPathInput) -> str:
    """Set the path to your curriculum markdown file and your current progress week.

    This configures the MCP server to know where your curriculum lives on disk
    so that subsequent analysis and update tools can find it automatically.

    Args:
        params (SetCurriculumPathInput): Configuration including:
            - path (str): Full path to the curriculum markdown file
            - current_week (int): Your current week (1-12)

    Returns:
        str: Confirmation of the configuration
    """
    # Verify the file exists
    content = load_curriculum_file(params.path)
    if content is None:
        return (
            f"⚠️ Warning: File not found at '{params.path}'.\n"
            f"The path has been saved, but make sure the file exists before running analysis.\n"
            f"You can create it later and the tools will pick it up."
        )

    # Save state
    state = load_curriculum_state()
    state["curriculum_path"] = params.path
    state["current_week"] = params.current_week
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    save_curriculum_state(state)

    file_size = len(content)
    return (
        f"✅ **Curriculum configured!**\n\n"
        f"- **File:** {params.path}\n"
        f"- **Size:** {file_size:,} characters\n"
        f"- **Current Week:** {params.current_week}\n"
        f"- **Phase:** {CURRICULUM_TOPIC_MAP.get(params.current_week, {}).get('phase', 'Unknown')}\n\n"
        f"You can now use `curriculum_analyze_gaps` and `curriculum_apply_update` tools."
    )


@mcp.tool(
    name="curriculum_status",
    annotations={
        "title": "Get Curriculum Updater Status",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def curriculum_status(params: GetStatusInput) -> str:
    """Get the current status of the curriculum updater — configuration,
    last check time, number of tracked updates, and your progress.

    Args:
        params (GetStatusInput): Status options:
            - verbose (bool): Include detailed cache information

    Returns:
        str: Formatted status report
    """
    state = load_curriculum_state()
    cache = load_cache()

    current_week = state.get("current_week", 1)
    week_info = CURRICULUM_TOPIC_MAP.get(current_week, {})

    result = "# Curriculum Updater Status\n\n"
    result += f"**Current Week:** {current_week} — {week_info.get('title', 'Unknown')}\n"
    result += f"**Phase:** {week_info.get('phase', 'Unknown')}\n"
    result += f"**Curriculum File:** {state.get('curriculum_path', 'Not set')}\n"
    result += f"**Last Check:** {cache.get('last_check', 'Never')}\n"
    result += f"**Updates Tracked:** {len(cache.get('seen_updates', []))}\n"
    result += f"**Updates Applied:** {len(cache.get('applied_updates', []))}\n"

    if params.verbose:
        result += "\n## Recent Applied Updates\n\n"
        applied = cache.get("applied_updates", [])
        if applied:
            for a in applied[-10:]:  # Last 10
                result += f"- `{a.get('applied_at', '')}` — {a.get('details', '')}\n"
        else:
            result += "No updates applied yet.\n"

        result += "\n## Curriculum Week Map\n\n"
        for week, info in CURRICULUM_TOPIC_MAP.items():
            marker = "👉" if week == current_week else "  "
            result += f"{marker} **Week {week}:** {info['title']} ({info['phase']})\n"

    return result


# --- Docs Diffing Tool ---

class DocsDiffInput(BaseModel):
    """Input for docs diffing."""
    model_config = ConfigDict(extra="forbid")


@mcp.tool(
    name="curriculum_docs_diff",
    annotations={
        "title": "Detect Documentation Changes",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
async def curriculum_docs_diff(params: DocsDiffInput) -> str:
    """Crawl the Claude Code documentation and detect changes since last snapshot.

    On first run, takes a baseline snapshot. On subsequent runs, compares
    against the previous snapshot to detect added, modified, and removed
    sections — catching every docs change, not just what gets announced.

    Returns:
        str: Summary of documentation changes detected
    """
    try:
        updates, summary = await run_docs_diff()

        result = f"# Documentation Diff Report\n\n{summary}\n\n"

        if updates:
            result += "## Changes Detected\n\n"
            for u in updates[:20]:
                result += f"### {u.title}\n"
                result += f"- **Page:** {u.url}\n"
                result += f"- **Tags:** {', '.join(u.tags)}\n"
                result += f"- **Content:** {u.content[:200]}\n\n"

            if len(updates) > 20:
                result += f"\n*... and {len(updates) - 20} more changes*\n"

        return result

    except Exception as e:
        logger.exception("Error in docs diff")
        return f"Error running docs diff: {type(e).__name__}: {str(e)}"


# --- Scheduler Tool ---

class SchedulerInput(BaseModel):
    """Input for scheduler operations."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    action: str = Field(
        default="status",
        description="Action: 'check' (run once now), 'status' (show config), 'configure' (update settings), 'install' (set up macOS launchd), 'crontab' (show crontab entry)",
    )
    check_interval_hours: Optional[int] = Field(
        default=None,
        description="Check interval in hours (for configure/install actions)",
        ge=1, le=168,
    )
    notify_macos: Optional[bool] = Field(
        default=None,
        description="Enable macOS native notifications",
    )
    slack_webhook: Optional[str] = Field(
        default=None,
        description="Slack incoming webhook URL for notifications",
    )
    min_priority: Optional[str] = Field(
        default=None,
        description="Minimum priority to notify: 'high', 'medium', or 'low'",
    )
    notify_email: Optional[str] = Field(
        default=None,
        description="Email address to receive update notifications (uses macOS Mail.app — no SMTP setup needed)",
    )
    auto_apply: Optional[bool] = Field(
        default=None,
        description="Enable/disable auto-applying high-priority updates to the curriculum file",
    )


@mcp.tool(
    name="curriculum_scheduler",
    annotations={
        "title": "Manage Scheduled Checks & Notifications",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    }
)
async def curriculum_scheduler(params: SchedulerInput) -> str:
    """Manage automated curriculum update checks and notifications.

    Supports macOS launchd (background service), cron, or manual one-shot
    checks. Sends notifications via macOS native notifications, Slack, or email.

    Actions:
    - check: Run a single check now and send notifications if gaps found
    - status: Show current scheduler configuration
    - configure: Update scheduler settings
    - install: Install macOS launchd agent for periodic checks
    - crontab: Show crontab entry to add manually

    Args:
        params (SchedulerInput): Scheduler parameters

    Returns:
        str: Result of the scheduler action
    """
    try:
        if params.action == "check":
            result = await run_scheduled_check()
            auto_info = ""
            if result.get("auto_applied", 0) > 0:
                auto_info = (
                    f"- **Auto-Applied:** {result['auto_applied']} update(s)\n"
                    f"- **Backup:** {result.get('backup_path', 'N/A')}\n"
                    f"- **Action Required:** Re-upload curriculum.md to claude.ai\n"
                )
            return (
                f"# Scheduled Check Result\n\n"
                f"- **Timestamp:** {result['timestamp']}\n"
                f"- **Gaps Found:** {result['gaps_found']}\n"
                f"- **High Priority:** {result['high_priority']}\n"
                f"{auto_info}"
                f"- **Notifications Sent:** {', '.join(result['notifications_sent']) or 'none'}\n"
                f"- **Errors:** {len(result['errors'])}\n"
            )

        elif params.action == "status":
            config = load_scheduler_config()
            return (
                f"# Scheduler Configuration\n\n"
                f"- **Enabled:** {config.get('enabled', True)}\n"
                f"- **Check Interval:** Every {config.get('check_interval_hours', 24)} hours\n"
                f"- **Days Back:** {config.get('days_back', 7)}\n"
                f"- **Min Priority:** {config.get('min_priority', 'high')}\n"
                f"- **macOS Notifications:** {config.get('notify_macos', True)}\n"
                f"- **Slack Webhook:** {'configured' if config.get('notify_slack_webhook') else 'not set'}\n"
                f"- **Email:** {config.get('notify_email') or 'not set'}\n"
                f"- **Auto-Apply:** {config.get('auto_apply', False)}\n"
                f"- **Last Check:** {config.get('last_scheduled_check', 'never')}\n"
            )

        elif params.action == "configure":
            config = load_scheduler_config()
            if params.check_interval_hours is not None:
                config["check_interval_hours"] = params.check_interval_hours
            if params.notify_macos is not None:
                config["notify_macos"] = params.notify_macos
            if params.slack_webhook is not None:
                config["notify_slack_webhook"] = params.slack_webhook
            if params.min_priority is not None:
                config["min_priority"] = params.min_priority
            if params.notify_email is not None:
                config["notify_email"] = params.notify_email
            if params.auto_apply is not None:
                config["auto_apply"] = params.auto_apply
            save_scheduler_config(config)
            return f"✅ Scheduler configuration updated successfully."

        elif params.action == "install":
            interval = params.check_interval_hours or 168  # Default weekly
            # Enable auto-apply if requested
            if params.auto_apply:
                config = load_scheduler_config()
                config["auto_apply"] = True
                save_scheduler_config(config)
            return install_launchd(interval, weekly=(interval >= 168))

        elif params.action == "crontab":
            interval = params.check_interval_hours or 24
            entry = generate_crontab_entry(interval)
            return f"# Crontab Entry\n\nAdd this to your crontab (`crontab -e`):\n\n```\n{entry}\n```"

        else:
            return f"Unknown action '{params.action}'. Valid: check, status, configure, install, crontab"

    except Exception as e:
        logger.exception("Error in scheduler")
        return f"Error: {type(e).__name__}: {str(e)}"


class SendNewsletterInput(BaseModel):
    """Input for sending the weekly newsletter."""
    action: str = Field(
        default="preview",
        description="Action: 'preview' (generate without sending), 'send' (send to all subscribers), 'test' (send to test_email only)",
    )
    test_email: Optional[str] = Field(
        default=None,
        description="Email address to send a test newsletter to (used with action='test')",
    )


@mcp.tool(
    name="curriculum_send_newsletter",
    annotations={
        "title": "Generate & Send Weekly Newsletter",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
async def curriculum_send_newsletter(params: SendNewsletterInput) -> str:
    """Generate and optionally send the weekly newsletter PDF.

    Collects recent updates, editorializes the content, renders a
    magazine-style PDF, and delivers it via Resend.

    Actions:
    - preview: Generate HTML/PDF locally without sending
    - send: Send to all newsletter subscribers
    - test: Send to a single test email address

    Args:
        params (SendNewsletterInput): Newsletter parameters

    Returns:
        str: Summary of the newsletter generation/delivery
    """
    from .newsletter import NewsletterConfig, run_newsletter_pipeline
    try:
        config = NewsletterConfig.from_env()

        result = await run_newsletter_pipeline(
            config=config,
            send=params.action == "send",
            test_email=params.test_email or "" if params.action == "test" else "",
            preview_only=params.action == "preview",
        )

        if result.get("skipped"):
            return f"# Newsletter Skipped\n\nNo updates found this week."

        lines = [
            f"# Newsletter #{result.get('issue_number', '?')}",
            f"",
            f"**Headline:** {result.get('headline', 'N/A')}",
            f"**Updates:** {result.get('update_count', 0)}",
            f"**HTML:** {result.get('html_path', 'N/A')}",
            f"**PDF:** {result.get('pdf_path', 'N/A')}",
        ]

        if result.get("send"):
            send = result["send"]
            lines.append(f"**Sent:** {send.get('sent', 0)} / {send.get('total_recipients', 0)}")
            if send.get("failed"):
                lines.append(f"**Failed:** {send['failed']}")
        elif result.get("preview"):
            lines.append(f"\n*Preview mode — open the HTML/PDF files to review.*")
        elif result.get("note"):
            lines.append(f"\n*{result['note']}*")

        return "\n".join(lines)

    except Exception as e:
        logger.exception("Newsletter error")
        return f"Error: {type(e).__name__}: {str(e)}"


# --- Entry Point ---

def main():
    """Run the MCP server."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )
    mcp.run()


if __name__ == "__main__":
    main()
