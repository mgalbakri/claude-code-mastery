"""Scheduled runs and notification system.

Provides two modes of operation:

1. **Cron-compatible CLI**: Run ``claude-code-mastery-check`` from crontab
   or launchd to perform periodic checks and send notifications.

2. **Background loop**: Run as a long-lived daemon
   that checks on a configurable interval.

Notifications are sent via:
- macOS native notifications (``osascript``)
- Optional Slack webhook
- Optional email (SMTP)
- Log file (always)

Configuration is stored in ~/.claude-code-mastery/scheduler_config.json
"""

import asyncio
import json
import logging
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

import httpx

from .cache import (
    get_cache_dir,
    load_curriculum_state,
    mark_update_applied,
    create_curriculum_backup,
    get_update_key,
)
from .sources import fetch_all_updates
from .analyzer import (
    analyze_gaps,
    load_curriculum_file,
    save_curriculum_file,
    convert_gaps_to_updates,
    apply_single_update,
    CurriculumGap,
    CURRICULUM_TOPIC_MAP,
)

logger = logging.getLogger(__name__)

SCHEDULER_CONFIG_FILE = "scheduler_config.json"
NOTIFICATION_LOG_FILE = "notifications.log"
DEFAULT_CHECK_INTERVAL_HOURS = 24
LAUNCHD_LABEL = "com.claude-code-mastery.checker"


def _config_path() -> Path:
    return get_cache_dir() / SCHEDULER_CONFIG_FILE


def _notification_log_path() -> Path:
    return get_cache_dir() / NOTIFICATION_LOG_FILE


def load_scheduler_config() -> dict:
    """Load or create default scheduler configuration."""
    path = _config_path()
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            logger.warning("Failed to load scheduler config: %s", e)

    default = {
        "check_interval_hours": DEFAULT_CHECK_INTERVAL_HOURS,
        "days_back": 7,
        "notify_macos": True,
        "notify_slack_webhook": None,
        "notify_email": None,
        "smtp_server": None,
        "smtp_port": 587,
        "smtp_user": None,
        "smtp_password": None,
        "email_from": None,
        "min_priority": "high",  # Only notify for this priority and above
        "auto_apply": False,  # Auto-apply high-priority updates to curriculum file
        "auto_apply_priority": "high",  # Only auto-apply gaps at this priority
        "auto_apply_max_per_run": 5,  # Safety cap per run
        "last_scheduled_check": None,
        "enabled": True,
    }
    save_scheduler_config(default)
    return default


def save_scheduler_config(config: dict) -> None:
    """Persist scheduler config."""
    _config_path().write_text(json.dumps(config, indent=2), encoding="utf-8")


# --- Notification backends ---

def _log_notification(message: str, gaps_summary: str) -> None:
    """Always log to notifications.log."""
    with open(_notification_log_path(), "a", encoding="utf-8") as f:
        ts = datetime.now(timezone.utc).isoformat()
        f.write(f"\n--- {ts} ---\n{message}\n{gaps_summary}\n")


def send_macos_notification(title: str, message: str) -> bool:
    """Send a native macOS notification via osascript."""
    if sys.platform != "darwin":
        return False
    try:
        # Escape special characters for AppleScript
        safe_title = title.replace('"', '\\"')
        safe_msg = message.replace('"', '\\"')
        script = f'display notification "{safe_msg}" with title "{safe_title}"'
        subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            timeout=10,
        )
        logger.info("macOS notification sent: %s", title)
        return True
    except Exception as e:
        logger.warning("macOS notification failed: %s", e)
        return False


async def send_slack_notification(webhook_url: str, title: str, message: str) -> bool:
    """Send a notification to Slack via incoming webhook."""
    payload = {
        "text": f"*{title}*\n{message}",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": title},
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": message[:2900]},
            },
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(webhook_url, json=payload)
            if resp.status_code == 200:
                logger.info("Slack notification sent")
                return True
            logger.warning("Slack webhook returned %d", resp.status_code)
    except Exception as e:
        logger.warning("Slack notification failed: %s", e)
    return False


async def send_email_notification(
    config: dict, subject: str, body: str
) -> bool:
    """Send an email notification.

    Tries three methods in order:
    1. macOS Mail.app via AppleScript (zero config — uses existing mail accounts)
    2. SMTP with credentials (if smtp_server is configured)
    3. macOS ``open mailto:`` as last resort (opens Mail.app compose window)
    """
    to_email = config.get("notify_email")
    if not to_email:
        return False

    # --- Method 1: macOS Mail.app via AppleScript (preferred — no credentials needed) ---
    if sys.platform == "darwin":
        try:
            if _send_via_mail_app(to_email, subject, body):
                logger.info("Email sent via Mail.app to %s", to_email)
                return True
        except Exception as e:
            logger.debug("Mail.app send failed, trying SMTP: %s", e)

    # --- Method 2: SMTP with credentials ---
    if config.get("smtp_server"):
        try:
            import smtplib
            from email.mime.text import MIMEText

            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = config.get("email_from", config.get("smtp_user", ""))
            msg["To"] = to_email

            with smtplib.SMTP(config["smtp_server"], config.get("smtp_port", 587)) as server:
                server.starttls()
                if config.get("smtp_user") and config.get("smtp_password"):
                    server.login(config["smtp_user"], config["smtp_password"])
                server.send_message(msg)
            logger.info("Email sent via SMTP to %s", to_email)
            return True
        except Exception as e:
            logger.warning("SMTP email failed: %s", e)

    # --- Method 3: open mailto: URL (last resort — opens compose window) ---
    if sys.platform == "darwin":
        try:
            import urllib.parse
            mailto = f"mailto:{to_email}?subject={urllib.parse.quote(subject)}&body={urllib.parse.quote(body[:2000])}"
            subprocess.run(["open", mailto], capture_output=True, timeout=10)
            logger.info("Opened mailto: link for %s", to_email)
            return True
        except Exception as e:
            logger.warning("mailto: fallback failed: %s", e)

    logger.warning("All email methods failed for %s", to_email)
    return False


def _send_via_mail_app(to_email: str, subject: str, body: str) -> bool:
    """Send email via macOS Mail.app using AppleScript.

    This uses whatever email account is already configured in Mail.app —
    no SMTP credentials needed.
    """
    # Escape for AppleScript strings
    safe_subject = subject.replace("\\", "\\\\").replace('"', '\\"')
    safe_body = body.replace("\\", "\\\\").replace('"', '\\"')
    safe_to = to_email.replace("\\", "\\\\").replace('"', '\\"')

    applescript = f'''
    tell application "Mail"
        set newMessage to make new outgoing message with properties {{subject:"{safe_subject}", content:"{safe_body}", visible:false}}
        tell newMessage
            make new to recipient at end of to recipients with properties {{address:"{safe_to}"}}
        end tell
        send newMessage
    end tell
    '''

    result = subprocess.run(
        ["osascript", "-e", applescript],
        capture_output=True,
        text=True,
        timeout=30,
    )

    if result.returncode == 0:
        return True

    logger.debug("Mail.app AppleScript failed: %s", result.stderr)
    return False


# --- Check & notify ---

async def run_scheduled_check() -> dict:
    """Run a single check cycle: fetch updates, analyse gaps, auto-apply, notify.

    Returns a summary dict with results.
    """
    config = load_scheduler_config()
    state = load_curriculum_state()

    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "gaps_found": 0,
        "high_priority": 0,
        "auto_applied": 0,
        "backup_path": None,
        "notifications_sent": [],
        "errors": [],
    }

    # Fetch updates
    try:
        fetch_result = await fetch_all_updates(config.get("days_back", 7))
        if fetch_result.errors:
            result["errors"].extend(fetch_result.errors)
    except Exception as e:
        result["errors"].append(f"Fetch failed: {e}")
        return result

    # Load curriculum
    curriculum_content = None
    curriculum_path = state.get("curriculum_path") or state.get("path")
    if curriculum_path:
        curriculum_content = load_curriculum_file(curriculum_path)

    # Analyse gaps
    gaps = analyze_gaps(fetch_result.updates, curriculum_content)

    # Filter by minimum priority
    min_priority = config.get("min_priority", "high")
    priority_levels = {"high": 0, "medium": 1, "low": 2}
    min_level = priority_levels.get(min_priority, 0)
    filtered = [
        g for g in gaps
        if priority_levels.get(g.priority, 2) <= min_level
    ]

    result["gaps_found"] = len(gaps)
    result["high_priority"] = sum(1 for g in gaps if g.priority == "high")

    if not filtered:
        logger.info("No gaps above %s priority — skipping notification", min_priority)
        config["last_scheduled_check"] = result["timestamp"]
        save_scheduler_config(config)
        return result

    # --- Auto-apply if enabled ---
    apply_result = None
    if config.get("auto_apply", False) and curriculum_path and curriculum_content:
        try:
            apply_result = _auto_apply_gaps(
                filtered, curriculum_path, curriculum_content, config
            )
            result["auto_applied"] = len(apply_result.get("applied", []))
            result["backup_path"] = apply_result.get("backup_path")
            if apply_result.get("errors"):
                result["errors"].extend(apply_result["errors"])
        except Exception as e:
            logger.exception("Auto-apply failed: %s", e)
            result["errors"].append(f"Auto-apply failed: {e}")

    # --- Build notification message ---
    if apply_result and apply_result.get("applied"):
        n_applied = len(apply_result["applied"])
        deploy = apply_result.get("deploy", {})
        deploy_ok = deploy.get("success", False)

        if deploy_ok:
            title = f"📚 Curriculum: {n_applied} update(s) applied & deployed"
        else:
            title = f"📚 Curriculum: {n_applied} update(s) applied (deploy needed)"

        lines = [f"📁 File updated: {curriculum_path}"]
        lines.append(f"💾 Backup: {apply_result.get('backup_path', 'N/A')}")
        lines.append("")
        lines.append("Changes made:")
        for item in apply_result["applied"]:
            week_label = f"Week {item['week']}" if item["week"] > 0 else "Appendix"
            lines.append(f"  - [{week_label}] {item['section']} ({item['action']})")
        lines.append("")
        if deploy_ok:
            lines.append(f"✅ Site deployed: {LIVE_SITE_URL}")
        else:
            deploy_err = deploy.get("error", "unknown")
            lines.append(f"⚠️  Auto-deploy failed: {deploy_err}")
            lines.append(f"   Manual deploy: cd site/ && npx vercel deploy --prod --yes --force")
        lines.append(f"🌐 Live site: {LIVE_SITE_URL}")

        if deploy_ok:
            short_msg = f"{n_applied} update(s) applied & deployed! {LIVE_SITE_URL}"
        else:
            short_msg = f"{n_applied} update(s) applied. Deploy needed: {LIVE_SITE_URL}"
    else:
        title = f"📚 Curriculum: {len(filtered)} update(s) need attention"
        lines = []
        for g in filtered[:5]:
            emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(g.priority, "")
            lines.append(f"{emoji} [{g.priority.upper()}] {g.update.title[:80]}")
        if len(filtered) > 5:
            lines.append(f"... and {len(filtered) - 5} more")
        lines.append("")
        lines.append(f"🌐 Current site: {LIVE_SITE_URL}")
        short_msg = f"{len(filtered)} gap(s) found. Highest: {filtered[0].update.title[:60]}"

    message = "\n".join(lines)
    gaps_detail = "\n\n".join(g.suggestion for g in filtered)

    # Prepend change summary to detail for email/log
    if apply_result and apply_result.get("applied"):
        deploy = apply_result.get("deploy", {})
        change_summary = "CHANGES APPLIED TO CURRICULUM:\n\n"
        for item in apply_result["applied"]:
            week_label = f"Week {item['week']}" if item["week"] > 0 else "Appendix"
            change_summary += f"- [{week_label}] {item['section']} ({item['action']}): {item['reason']}\n"
        change_summary += f"\nBackup at: {apply_result.get('backup_path')}\n"
        if deploy.get("success"):
            change_summary += f"\n✅ SITE DEPLOYED AUTOMATICALLY\n🌐 {LIVE_SITE_URL}\n\n"
        else:
            change_summary += f"\n⚠️  AUTO-DEPLOY FAILED: {deploy.get('error', 'unknown')}\n"
            change_summary += f"Manual deploy: cd {Path(curriculum_path).resolve().parent / 'site'} && npx vercel deploy --prod --yes --force\n"
            change_summary += f"🌐 {LIVE_SITE_URL}\n\n"
        change_summary += "ACTION REQUIRED: Re-upload curriculum.md to your claude.ai project.\n\n"
        gaps_detail = change_summary + gaps_detail

    # Always log
    _log_notification(title, gaps_detail)

    # Send notifications
    if config.get("notify_macos", True):
        if send_macos_notification(title, short_msg):
            result["notifications_sent"].append("macos")

    if config.get("notify_slack_webhook"):
        if await send_slack_notification(config["notify_slack_webhook"], title, message):
            result["notifications_sent"].append("slack")

    if config.get("notify_email"):
        if await send_email_notification(config, title, gaps_detail):
            result["notifications_sent"].append("email")

    # --- Newsletter (if enabled and it's the right day) ---
    if config.get("newsletter_enabled", False):
        try:
            newsletter_result = await _run_newsletter_if_due(config)
            if newsletter_result:
                result["newsletter"] = newsletter_result
                if newsletter_result.get("success"):
                    result["notifications_sent"].append("newsletter")
        except Exception as e:
            logger.exception("Newsletter send failed: %s", e)
            result["errors"].append(f"Newsletter failed: {e}")

    config["last_scheduled_check"] = result["timestamp"]
    save_scheduler_config(config)

    return result


async def _run_newsletter_if_due(config: dict) -> dict | None:
    """Run the newsletter pipeline if it's the configured send day."""
    from .newsletter import NewsletterConfig, run_newsletter_pipeline, load_newsletter_state

    send_day = config.get("newsletter_day", 0)  # 0=Monday
    if datetime.now(timezone.utc).weekday() != send_day:
        return None

    # Check if already sent today
    nl_state = load_newsletter_state()
    last_sent = nl_state.get("last_sent_date")
    if last_sent:
        last_date = datetime.fromisoformat(last_sent).date()
        if last_date == datetime.now(timezone.utc).date():
            logger.info("Newsletter already sent today, skipping")
            return None

    nl_config = NewsletterConfig(
        resend_api_key=config.get("resend_api_key", ""),
        audience_id=config.get("resend_audience_id", ""),
        anthropic_api_key=config.get("anthropic_api_key", ""),
    )

    state = load_curriculum_state()
    nl_config.curriculum_path = state.get("curriculum_path") or state.get("path") or ""

    return await run_newsletter_pipeline(nl_config, send=True)


# --- Auto-apply engine ---


def _auto_apply_gaps(
    gaps: list,
    curriculum_path: str,
    curriculum_content: str,
    config: dict,
) -> dict:
    """Auto-apply high-priority gaps to the curriculum file.

    Returns dict with: applied, backup_path, errors, content_after.
    """
    apply_result: dict = {
        "applied": [],
        "backup_path": None,
        "errors": [],
        "content_after": curriculum_content,
    }

    # Filter to auto-apply priority level
    apply_priority = config.get("auto_apply_priority", "high")
    priority_levels = {"high": 0, "medium": 1, "low": 2}
    apply_level = priority_levels.get(apply_priority, 0)
    eligible = [
        g for g in gaps
        if priority_levels.get(g.priority, 2) <= apply_level
    ]

    # Safety cap
    max_per_run = config.get("auto_apply_max_per_run", 5)
    eligible = eligible[:max_per_run]

    if not eligible:
        return apply_result

    # Convert gaps to structured updates
    updates = convert_gaps_to_updates(eligible)
    if not updates:
        return apply_result

    # Create backup before modifying
    backup_path = create_curriculum_backup(curriculum_path)
    if backup_path is None:
        apply_result["errors"].append("Failed to create backup — aborting auto-apply")
        return apply_result
    apply_result["backup_path"] = backup_path

    # Apply each update sequentially
    current_content = curriculum_content
    for cu in updates:
        try:
            current_content = apply_single_update(current_content, cu)
            apply_result["applied"].append({
                "week": cu.week,
                "section": cu.section,
                "action": cu.action,
                "reason": cu.reason,
            })
            # Track in cache
            update_key = f"auto::{cu.section[:50]}"
            mark_update_applied(
                update_key,
                f"Week {cu.week}: {cu.section} ({cu.action})"
            )
            logger.info("Auto-applied: Week %d — %s", cu.week, cu.section)
        except Exception as e:
            logger.warning("Failed to auto-apply '%s': %s", cu.section, e)
            apply_result["errors"].append(f"Failed: {cu.section} — {e}")

    # Save the modified curriculum
    if apply_result["applied"]:
        if save_curriculum_file(curriculum_path, current_content):
            apply_result["content_after"] = current_content
            logger.info(
                "Auto-applied %d update(s) to %s",
                len(apply_result["applied"]),
                curriculum_path,
            )
            # Sync to site/curriculum.md so Vercel deploys pick up changes
            _sync_to_site(curriculum_path, current_content)
            # Auto-deploy to Vercel
            deploy = _deploy_to_vercel(curriculum_path)
            apply_result["deploy"] = deploy
        else:
            apply_result["errors"].append("Failed to save curriculum after applying updates")

    return apply_result


# --- Site sync & deploy ---

LIVE_SITE_URL = "https://claude-code-mastery-iota.vercel.app"


def _sync_to_site(curriculum_path: str, content: str) -> None:
    """Copy updated curriculum to the Next.js site directory.

    Keeps site/curriculum.md in sync so the next Vercel deploy
    picks up auto-applied changes without a manual copy step.
    Also syncs to ~/projects/curriculum/curriculum.md if it exists.
    """
    src = Path(curriculum_path).resolve()
    repo_root = src.parent

    # Sync to site/curriculum.md
    site_copy = repo_root / "site" / "curriculum.md"
    if site_copy.parent.is_dir():
        try:
            shutil.copy2(str(src), str(site_copy))
            logger.info("Synced curriculum to %s", site_copy)
        except Exception as e:
            logger.warning("Failed to sync to site/: %s", e)

    # Sync to ~/Claude Projects/curriculum/curriculum.md (secondary copy)
    external_copy = Path.home() / "Claude Projects" / "curriculum" / "curriculum.md"
    if external_copy.parent.is_dir() and external_copy.resolve() != src:
        try:
            shutil.copy2(str(src), str(external_copy))
            logger.info("Synced curriculum to %s", external_copy)
        except Exception as e:
            logger.warning("Failed to sync to external copy: %s", e)


def _deploy_to_vercel(curriculum_path: str) -> dict:
    """Deploy the site to Vercel after curriculum updates.

    Runs ``npx vercel deploy --prod --yes --force`` in the site/ directory.
    Returns dict with: success, url, error.
    """
    src = Path(curriculum_path).resolve()
    site_dir = src.parent / "site"

    if not (site_dir / "package.json").is_file():
        return {"success": False, "url": None, "error": "site/ directory not found"}

    try:
        result = subprocess.run(
            ["npx", "vercel", "deploy", "--prod", "--yes", "--force"],
            cwd=str(site_dir),
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
            env={**os.environ, "PATH": os.environ.get("PATH", "") + ":/opt/homebrew/bin:/usr/local/bin"},
        )
        if result.returncode == 0:
            # Vercel CLI prints the deployment URL on the last non-empty line
            deploy_url = result.stdout.strip().splitlines()[-1].strip() if result.stdout.strip() else None
            logger.info("Vercel deploy succeeded: %s", deploy_url or LIVE_SITE_URL)
            return {"success": True, "url": deploy_url or LIVE_SITE_URL, "error": None}
        else:
            error_msg = result.stderr.strip()[:200] or result.stdout.strip()[:200]
            logger.warning("Vercel deploy failed (exit %d): %s", result.returncode, error_msg)
            return {"success": False, "url": None, "error": error_msg}
    except subprocess.TimeoutExpired:
        logger.warning("Vercel deploy timed out after 5 minutes")
        return {"success": False, "url": None, "error": "Deploy timed out (5 min)"}
    except FileNotFoundError:
        logger.warning("npx/vercel not found in PATH")
        return {"success": False, "url": None, "error": "npx/vercel CLI not found"}
    except Exception as e:
        logger.warning("Vercel deploy error: %s", e)
        return {"success": False, "url": None, "error": str(e)}


# --- Daemon mode ---

async def run_daemon(interval_hours: Optional[float] = None):
    """Run as a long-lived background process, checking periodically."""
    config = load_scheduler_config()
    interval = interval_hours or config.get("check_interval_hours", DEFAULT_CHECK_INTERVAL_HOURS)

    logger.info("Starting curriculum updater daemon (interval: %sh)", interval)

    while True:
        try:
            result = await run_scheduled_check()
            logger.info(
                "Check complete: %d gaps, %d high priority, notifications: %s",
                result["gaps_found"],
                result["high_priority"],
                result["notifications_sent"] or "none",
            )
        except Exception as e:
            logger.exception("Scheduled check failed: %s", e)

        await asyncio.sleep(interval * 3600)


# --- macOS launchd integration ---

def generate_launchd_plist(interval_hours: int = 24, weekly: bool = False) -> str:
    """Generate a macOS launchd plist for periodic checks.

    If weekly=True, uses StartCalendarInterval for Monday 9 AM instead of StartInterval.
    """
    python_path = sys.executable

    if weekly:
        schedule_block = """    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>"""
    else:
        interval_seconds = interval_hours * 3600
        schedule_block = f"""    <key>StartInterval</key>
    <integer>{interval_seconds}</integer>"""

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{LAUNCHD_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>{python_path}</string>
        <string>-m</string>
        <string>claude_code_mastery.scheduler</string>
        <string>--once</string>
    </array>
{schedule_block}
    <key>StandardOutPath</key>
    <string>{get_cache_dir()}/scheduler.stdout.log</string>
    <key>StandardErrorPath</key>
    <string>{get_cache_dir()}/scheduler.stderr.log</string>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>"""


def install_launchd(interval_hours: int = 24, weekly: bool = False) -> str:
    """Install a macOS launchd agent for periodic checks.

    If weekly=True, schedules for Monday 9 AM.
    Returns a message describing what happened.
    """
    plist_dir = Path.home() / "Library" / "LaunchAgents"
    plist_dir.mkdir(parents=True, exist_ok=True)
    plist_path = plist_dir / f"{LAUNCHD_LABEL}.plist"

    plist_content = generate_launchd_plist(interval_hours, weekly=weekly)
    plist_path.write_text(plist_content, encoding="utf-8")

    # Unload old version if present
    subprocess.run(
        ["launchctl", "unload", str(plist_path)],
        capture_output=True,
    )

    # Load new version
    result = subprocess.run(
        ["launchctl", "load", str(plist_path)],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        schedule_desc = "every Monday at 9:00 AM" if weekly else f"every {interval_hours} hour(s)"
        return (
            f"✅ Installed macOS background checker!\n"
            f"- Plist: {plist_path}\n"
            f"- Schedule: {schedule_desc}\n"
            f"- Auto-Apply: {load_scheduler_config().get('auto_apply', False)}\n"
            f"- Logs: {get_cache_dir()}/scheduler.*.log\n\n"
            f"To uninstall: launchctl unload {plist_path}"
        )
    else:
        return f"⚠️ launchctl load failed: {result.stderr}"


def generate_crontab_entry(interval_hours: int = 24) -> str:
    """Generate a crontab entry for periodic checks."""
    python_path = sys.executable

    if interval_hours <= 1:
        schedule = "0 * * * *"  # Every hour
    elif interval_hours <= 6:
        schedule = f"0 */{interval_hours} * * *"  # Every N hours
    elif interval_hours <= 24:
        schedule = "0 9 * * *"  # Daily at 9 AM
    else:
        schedule = "0 9 * * 1"  # Weekly on Monday

    return (
        f"# Claude Code Mastery - check for curriculum updates\n"
        f"{schedule} {python_path} -m claude_code_mastery.scheduler --once "
        f">> {get_cache_dir()}/scheduler.cron.log 2>&1"
    )


# --- CLI entry point ---

def main():
    """CLI entry point for scheduled checks."""
    import argparse

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )

    parser = argparse.ArgumentParser(description="Curriculum Updater Scheduler")
    parser.add_argument("--once", action="store_true", help="Run a single check and exit")
    parser.add_argument("--daemon", action="store_true", help="Run as background daemon")
    parser.add_argument("--install-launchd", action="store_true", help="Install macOS launchd agent")
    parser.add_argument("--show-crontab", action="store_true", help="Show crontab entry")
    parser.add_argument("--interval", type=int, default=24, help="Check interval in hours (default: 24)")
    parser.add_argument("--weekly", action="store_true", help="Use weekly schedule (Mondays at 9 AM)")
    parser.add_argument("--auto-apply", action="store_true", help="Enable auto-applying high-priority updates")
    parser.add_argument("--newsletter", action="store_true", help="Send the weekly newsletter now")
    args = parser.parse_args()

    if args.auto_apply:
        config = load_scheduler_config()
        config["auto_apply"] = True
        save_scheduler_config(config)
        print("✅ Auto-apply enabled")

    if args.newsletter:
        from .newsletter import NewsletterConfig, run_newsletter_pipeline
        nl_config = NewsletterConfig.from_env()
        nl_result = asyncio.run(run_newsletter_pipeline(nl_config, send=True))
        print(json.dumps(nl_result, indent=2))
        return

    if args.install_launchd:
        print(install_launchd(args.interval, weekly=args.weekly))
    elif args.show_crontab:
        print(generate_crontab_entry(args.interval))
    elif args.daemon:
        asyncio.run(run_daemon(args.interval))
    else:
        # Default: single check
        result = asyncio.run(run_scheduled_check())
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
