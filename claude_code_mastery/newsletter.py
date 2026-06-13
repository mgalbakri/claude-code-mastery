"""Weekly newsletter pipeline for Agent Code Academy.

Generates, renders, and sends a magazine-style PDF newsletter
summarizing recent Claude Code updates and curriculum changes.

Pipeline: collect → editorialize → render HTML → render PDF → send
"""

import argparse
import asyncio
import base64
import json
import logging
import os
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

import httpx
from jinja2 import Environment, FileSystemLoader
from urllib.parse import quote

from .cache import get_cache_dir
from .sources import Update, fetch_all_updates
from .analyzer import CurriculumGap, analyze_gaps

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent / "templates"
NEWSLETTER_STATE_FILE = "newsletter_state.json"
DEFAULT_FROM_EMAIL = "Agent Code Academy <hello@agentcodeacademy.com>"
SITE_URL = "https://agentcodeacademy.com"

# Map gap_type to newsletter tag display
GAP_TYPE_MAP = {
    "new_feature": ("new", "New"),
    "new_topic": ("new", "New"),
    "deprecated": ("deprecated", "Heads Up"),
    "updated": ("updated", "Updated"),
}


# --- Data Models ---

@dataclass
class NewsletterUpdate:
    """A single update formatted for the newsletter template."""
    tag_class: str  # "new", "updated", "deprecated"
    tag_label: str  # "New", "Updated", "Heads Up"
    title: str
    body: str
    impact: str  # e.g., "→ Affects Week 7 (Refactoring)"


@dataclass
class NewsletterTip:
    """The quick tip section of the newsletter."""
    title: str
    body: str
    code: str = ""


@dataclass
class NewsletterStat:
    """A single stat in the stats bar."""
    value: int
    label: str


@dataclass
class NewsletterIssue:
    """A fully assembled newsletter ready for rendering."""
    issue_number: int
    date_range: str
    headline: str
    subtitle: str
    stats: list[NewsletterStat]
    updates: list[NewsletterUpdate]
    tip: Optional[NewsletterTip] = None
    html_content: str = ""
    pdf_path: str = ""


@dataclass
class NewsletterConfig:
    """Configuration for the newsletter pipeline."""
    resend_api_key: str = ""
    audience_id: str = ""
    from_email: str = DEFAULT_FROM_EMAIL
    anthropic_api_key: str = ""
    template_path: str = str(TEMPLATES_DIR / "newsletter.html")
    output_dir: str = "/tmp/newsletter-output"
    curriculum_path: str = ""

    @classmethod
    def from_env(cls) -> "NewsletterConfig":
        """Load config from environment variables."""
        return cls(
            resend_api_key=os.environ.get("RESEND_API_KEY", ""),
            audience_id=os.environ.get("RESEND_AUDIENCE_ID", ""),
            from_email=os.environ.get("EMAIL_FROM", DEFAULT_FROM_EMAIL),
            anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            curriculum_path=os.environ.get(
                "CURRICULUM_PATH",
                str(Path(__file__).parent.parent / "curriculum.md"),
            ),
        )


# --- State Management ---

def _state_path() -> Path:
    return get_cache_dir() / NEWSLETTER_STATE_FILE


def load_newsletter_state() -> dict:
    """Load newsletter state from disk."""
    path = _state_path()
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            logger.warning("Failed to load newsletter state: %s", e)
    return {"last_issue_number": 0, "last_sent_date": None, "history": []}


def save_newsletter_state(state: dict) -> None:
    """Persist newsletter state to disk."""
    path = _state_path()
    path.write_text(json.dumps(state, indent=2), encoding="utf-8")


def get_next_issue_number() -> int:
    """Get the next newsletter issue number."""
    state = load_newsletter_state()
    return state["last_issue_number"] + 1


# --- Content Collection ---

async def collect_newsletter_content(
    days_back: int = 7,
    curriculum_path: str = "",
) -> tuple[list[Update], list[CurriculumGap]]:
    """Fetch recent updates and analyze curriculum gaps.

    Reuses the existing MCP server fetch/analyze pipeline.
    """
    result = await fetch_all_updates(days_back=days_back)

    if result.errors:
        for err in result.errors:
            logger.warning("Fetch error: %s", err)

    curriculum_content = None
    if curriculum_path:
        p = Path(curriculum_path).expanduser()
        if p.exists():
            curriculum_content = p.read_text(encoding="utf-8")

    gaps = analyze_gaps(result.updates, curriculum_content)
    return result.updates, gaps


# --- Content Editorialization ---

def _format_week_list(weeks: list[int]) -> str:
    """Format a list of affected week numbers into a readable string."""
    if not weeks or weeks == [0]:
        return ""
    week_strs = [f"Week {w}" for w in sorted(weeks) if w > 0]
    if not week_strs:
        return ""
    return "→ Affects " + ", ".join(week_strs)


def _deterministic_editorialize(
    updates: list[Update],
    gaps: list[CurriculumGap],
) -> NewsletterIssue:
    """Create a newsletter without AI — uses raw update data directly."""
    issue_number = get_next_issue_number()

    # Date range
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    date_range = f"{week_ago.strftime('%b %d')} – {now.strftime('%b %d, %Y')}"

    # Classify gaps
    new_count = sum(1 for g in gaps if g.gap_type in ("new_feature", "new_topic"))
    updated_count = sum(1 for g in gaps if g.gap_type == "updated")
    deprecated_count = sum(1 for g in gaps if g.gap_type == "deprecated")

    # Build newsletter updates from gaps
    newsletter_updates = []
    for gap in gaps:
        tag_class, tag_label = GAP_TYPE_MAP.get(
            gap.gap_type, ("updated", "Updated")
        )
        newsletter_updates.append(
            NewsletterUpdate(
                tag_class=tag_class,
                tag_label=tag_label,
                title=gap.update.title,
                body=gap.suggestion,
                impact=_format_week_list(gap.affected_weeks),
            )
        )

    # Headline from the highest-priority gap
    if gaps:
        top = sorted(gaps, key=lambda g: {"high": 0, "medium": 1, "low": 2}.get(g.priority, 3))[0]
        headline = top.update.title
    else:
        headline = "This Week in Claude Code"

    # Subtitle
    parts = []
    if new_count:
        parts.append(f"{new_count} new feature{'s' if new_count != 1 else ''}")
    if updated_count:
        parts.append(f"{updated_count} update{'s' if updated_count != 1 else ''}")
    if deprecated_count:
        parts.append(f"{deprecated_count} deprecation{'s' if deprecated_count != 1 else ''}")
    subtitle = " · ".join(parts) if parts else "Curriculum digest"

    # Stats
    stats = []
    if new_count:
        stats.append(NewsletterStat(value=new_count, label="New Features"))
    if deprecated_count:
        stats.append(NewsletterStat(value=deprecated_count, label="Deprecations"))
    lessons_updated = len(set(w for g in gaps for w in g.affected_weeks if w > 0))
    if lessons_updated:
        stats.append(NewsletterStat(value=lessons_updated, label="Lessons Updated"))
    stats.append(NewsletterStat(value=len(updates), label="Sources Checked"))

    return NewsletterIssue(
        issue_number=issue_number,
        date_range=date_range,
        headline=headline,
        subtitle=subtitle,
        stats=stats,
        updates=newsletter_updates,
    )


async def editorialize_content(
    updates: list[Update],
    gaps: list[CurriculumGap],
    anthropic_api_key: str = "",
) -> NewsletterIssue:
    """Generate an editorialized newsletter from raw data.

    If an Anthropic API key is provided, uses Claude to write punchy
    headlines and readable summaries. Otherwise falls back to the
    deterministic formatter.
    """
    issue = _deterministic_editorialize(updates, gaps)

    if not anthropic_api_key or not gaps:
        return issue

    # AI editorialization
    gap_summaries = "\n".join(
        f"- [{g.gap_type}] {g.update.title}: {g.suggestion} (Weeks: {g.affected_weeks})"
        for g in gaps[:10]  # Limit to avoid token overflow
    )

    prompt = f"""You are writing the weekly newsletter for Agent Code Academy, a 12-week course
on AI-assisted coding with Claude Code. Write in a confident, friendly, magazine-style voice.

Here are this week's curriculum changes:
{gap_summaries}

Generate a JSON response with:
1. "headline": A punchy, engaging headline (max 60 chars). Don't use quotes or colons.
2. "updates": For each change, rewrite the summary in 1-2 clear sentences explaining
   what changed and why it matters to a learner. Keep the same order.
3. "tip_title": A short actionable tip title related to one of the changes.
4. "tip_body": 1-2 sentences explaining the tip.
5. "tip_code": Optional short code snippet (plain text, no syntax highlighting).

Return ONLY valid JSON, no markdown fences."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1500,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["content"][0]["text"]
            # Parse the JSON from the response
            ai_data = json.loads(text)

            # Apply AI content to the issue
            issue.headline = ai_data.get("headline", issue.headline)

            ai_updates = ai_data.get("updates", [])
            for i, ai_update in enumerate(ai_updates):
                if i < len(issue.updates):
                    if isinstance(ai_update, str):
                        issue.updates[i].body = ai_update
                    elif isinstance(ai_update, dict):
                        issue.updates[i].body = ai_update.get("body", ai_update.get("summary", issue.updates[i].body))

            tip_title = ai_data.get("tip_title")
            tip_body = ai_data.get("tip_body")
            if tip_title and tip_body:
                issue.tip = NewsletterTip(
                    title=tip_title,
                    body=tip_body,
                    code=ai_data.get("tip_code", ""),
                )

            logger.info("AI editorialization applied successfully")

    except Exception as e:
        logger.warning("AI editorialization failed, using deterministic content: %s", e)

    return issue


# --- HTML Rendering ---

def render_html(issue: NewsletterIssue, template_path: str = "") -> str:
    """Render the newsletter HTML from the Jinja2 template."""
    if not template_path:
        template_path = str(TEMPLATES_DIR / "newsletter.html")

    template_dir = str(Path(template_path).parent)
    template_name = Path(template_path).name

    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=True,
    )
    template = env.get_template(template_name)

    web_version_url = f"{SITE_URL}/newsletter/issue-{issue.issue_number}.html"

    html = template.render(
        issue_number=issue.issue_number,
        date_range=issue.date_range,
        headline=issue.headline,
        subtitle=issue.subtitle,
        stats=[asdict(s) for s in issue.stats],
        updates=[asdict(u) for u in issue.updates],
        tip=asdict(issue.tip) if issue.tip else None,
        unsubscribe_url=f"{SITE_URL}/api/unsubscribe",
        web_version_url=web_version_url,
    )

    issue.html_content = html
    return html


# --- PDF Rendering ---

async def render_pdf(html_content: str, output_path: str) -> str:
    """Render HTML to a Letter-size PDF using Playwright."""
    from playwright.async_api import async_playwright

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        try:
            page = await browser.new_page(viewport={"width": 612, "height": 792})
            await page.set_content(html_content, wait_until="networkidle")
            await page.pdf(
                path=output_path,
                format="Letter",
                print_background=True,
                margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            )
        finally:
            await browser.close()

    logger.info("PDF rendered: %s", output_path)
    return output_path


# --- Email Delivery ---

async def fetch_audience_contacts(
    api_key: str,
    audience_id: str,
) -> list[str]:
    """Fetch all subscriber emails from a Resend audience."""
    contacts = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"https://api.resend.com/audiences/{audience_id}/contacts",
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        data = resp.json()
        for contact in data.get("data", []):
            if not contact.get("unsubscribed", False):
                contacts.append(contact["email"])
    return contacts


async def send_newsletter(
    issue: NewsletterIssue,
    config: NewsletterConfig,
    test_email: str = "",
) -> dict:
    """Send the newsletter via Resend.

    If test_email is provided, sends only to that address.
    Otherwise sends to all audience subscribers.
    """
    if not config.resend_api_key:
        return {"success": False, "error": "No Resend API key configured"}

    # Read the PDF (guard against missing path)
    if not issue.pdf_path or not Path(issue.pdf_path).exists():
        return {"success": False, "error": f"PDF not found: {issue.pdf_path!r}"}

    pdf_bytes = Path(issue.pdf_path).read_bytes()
    pdf_b64 = base64.b64encode(pdf_bytes).decode()

    filename = f"agent-code-academy-dispatch-{issue.issue_number}.pdf"
    subject = f"Weekly Dispatch #{issue.issue_number}: {issue.headline}"

    if test_email:
        recipients = [test_email]
    else:
        if not config.audience_id:
            return {"success": False, "error": "No audience ID configured"}
        recipients = await fetch_audience_contacts(
            config.resend_api_key, config.audience_id
        )

    if not recipients:
        return {"success": False, "error": "No recipients found"}

    # Send in batches of 50
    sent = 0
    failed = 0
    batch_size = 50

    from_email = config.from_email.strip()

    # Build attachment once, shared across all recipients
    attachment = {"filename": filename, "content": pdf_b64}

    async with httpx.AsyncClient(timeout=30.0) as client:
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i : i + batch_size]
            # Resend batch API expects an array of individual email objects
            # Each recipient gets a personalized unsubscribe link
            payload = [
                {
                    "from": from_email,
                    "to": [recipient],
                    "subject": subject,
                    "html": issue.html_content.replace(
                        f"{SITE_URL}/api/unsubscribe",
                        f"{SITE_URL}/api/unsubscribe?email={quote(recipient, safe='')}",
                    ),
                    "attachments": [attachment],
                }
                for recipient in batch
            ]

            resp = None
            try:
                resp = await client.post(
                    "https://api.resend.com/emails/batch",
                    json=payload,
                    headers={"Authorization": f"Bearer {config.resend_api_key}"},
                )
                resp.raise_for_status()
                sent += len(batch)
            except Exception as e:
                status = resp.status_code if resp is not None else "N/A"
                logger.error("Batch send failed (HTTP %s): %s", status, e)
                failed += len(batch)

    return {
        "success": failed == 0,
        "sent": sent,
        "failed": failed,
        "total_recipients": len(recipients),
    }


# --- Web Archive ---

def save_web_version(issue: NewsletterIssue, site_dir: str = "") -> Optional[str]:
    """Save the HTML to the site's public newsletter directory for 'view in browser'."""
    if not site_dir:
        site_dir = str(Path(__file__).parent.parent / "site" / "public" / "newsletter")

    out_dir = Path(site_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"issue-{issue.issue_number}.html"
    out_path.write_text(issue.html_content, encoding="utf-8")
    logger.info("Web version saved: %s", out_path)
    return str(out_path)


# --- Pipeline Orchestrator ---

async def run_newsletter_pipeline(
    config: NewsletterConfig,
    send: bool = False,
    test_email: str = "",
    preview_only: bool = False,
) -> dict:
    """Run the full newsletter pipeline.

    Args:
        config: Newsletter configuration
        send: Whether to actually send the newsletter
        test_email: If set, send only to this address
        preview_only: If True, generate HTML/PDF but don't send

    Returns:
        Result dict with pipeline status
    """
    output_dir = Path(config.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: Collect content
    logger.info("Collecting newsletter content...")
    updates, gaps = await collect_newsletter_content(
        days_back=7, curriculum_path=config.curriculum_path
    )

    if not gaps and not updates:
        return {
            "success": True,
            "skipped": True,
            "reason": "No updates found this week",
        }

    # Step 2: Editorialize
    logger.info("Editorializing content (%d gaps)...", len(gaps))
    issue = await editorialize_content(
        updates, gaps, config.anthropic_api_key
    )

    # Step 3: Render HTML
    logger.info("Rendering HTML...")
    html = render_html(issue, config.template_path)

    html_path = output_dir / f"issue-{issue.issue_number}.html"
    html_path.write_text(html, encoding="utf-8")
    logger.info("HTML saved: %s", html_path)

    # Step 4: Render PDF
    logger.info("Rendering PDF...")
    pdf_path = str(output_dir / f"issue-{issue.issue_number}.pdf")
    await render_pdf(html, pdf_path)
    issue.pdf_path = pdf_path

    # Step 5: Save web version
    save_web_version(issue)

    result = {
        "success": True,
        "issue_number": issue.issue_number,
        "headline": issue.headline,
        "update_count": len(issue.updates),
        "html_path": str(html_path),
        "pdf_path": pdf_path,
    }

    if preview_only:
        result["preview"] = True
        logger.info(
            "Preview ready: HTML at %s, PDF at %s", html_path, pdf_path
        )
        return result

    # Step 6: Send
    if send or test_email:
        logger.info("Sending newsletter...")
        send_result = await send_newsletter(issue, config, test_email)
        result["send"] = send_result

        if send_result.get("success"):
            # Update state
            state = load_newsletter_state()
            state["last_issue_number"] = issue.issue_number
            state["last_sent_date"] = datetime.now(timezone.utc).isoformat()
            state["history"].append({
                "issue": issue.issue_number,
                "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "sent": send_result.get("sent", 0),
                "failed": send_result.get("failed", 0),
            })
            # Keep last 52 issues in history
            state["history"] = state["history"][-52:]
            save_newsletter_state(state)
            logger.info(
                "Newsletter #%d sent to %d recipients",
                issue.issue_number,
                send_result.get("sent", 0),
            )
    else:
        result["note"] = "Generated but not sent (use --send to deliver)"

    return result


# --- CLI ---

def main():
    """CLI entry point for the newsletter pipeline."""
    parser = argparse.ArgumentParser(
        description="Agent Code Academy weekly newsletter pipeline"
    )
    parser.add_argument(
        "--send", action="store_true",
        help="Send the newsletter to all subscribers",
    )
    parser.add_argument(
        "--preview", action="store_true",
        help="Generate HTML/PDF without sending",
    )
    parser.add_argument(
        "--test-email",
        help="Send to a single test address instead of the full audience",
    )
    parser.add_argument(
        "--output-dir", default="/tmp/newsletter-output",
        help="Directory for generated files (default: /tmp/newsletter-output)",
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true",
        help="Enable verbose logging",
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    config = NewsletterConfig.from_env()
    config.output_dir = args.output_dir

    result = asyncio.run(
        run_newsletter_pipeline(
            config=config,
            send=args.send,
            test_email=args.test_email or "",
            preview_only=args.preview and not args.send and not args.test_email,
        )
    )

    # Print result summary
    print(json.dumps(result, indent=2))

    if not result.get("success"):
        sys.exit(1)


if __name__ == "__main__":
    main()
