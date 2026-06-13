"""Curriculum analysis and update logic.

Uses a multi-layered gap detection approach:
1. Heuristic phrase matching (fast, high precision)
2. Semantic TF-IDF matching (catches synonyms/paraphrases)
3. Tag-based matching (fallback)
"""

import logging
import re
from collections import defaultdict
from datetime import datetime, timezone
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Optional

from .sources import Update
from .semantic import SemanticIndex, is_semantically_covered, find_best_week

logger = logging.getLogger(__name__)


# --- Data Models ---

@dataclass
class CurriculumGap:
    """A gap between current curriculum and latest updates."""
    update: Update
    affected_weeks: list[int]  # Which weeks this affects (0 = new topic needed)
    gap_type: str  # "new_feature", "deprecated", "updated", "new_topic"
    priority: str  # "high", "medium", "low"
    suggestion: str  # What to change in the curriculum
    source_count: int = 1  # How many sources reported this topic

    def to_dict(self) -> dict:
        result = asdict(self)
        return result


@dataclass
class CurriculumUpdate:
    """A specific update to apply to the curriculum."""
    week: int  # 0 = new appendix item
    section: str  # Which section to update
    action: str  # "add", "replace", "append"
    content: str  # The new content
    reason: str  # Why this update is needed


# --- Release Classification ---
# Patterns that indicate a release is just a bugfix (not curriculum-worthy)
_BUGFIX_ONLY_PATTERNS = [
    r"^(?:fixed|fix)\b",
    r"^(?:hotfix|patch)\b",
]

# Minimum change count to consider a release "significant" for curriculum
_MIN_SIGNIFICANT_CHANGES = 2

def _is_bugfix_release(body: str) -> bool:
    """Check if a GitHub release is only bugfixes (no new features)."""
    if not body:
        return True
    lines = [ln.strip().lstrip("- ").strip() for ln in body.split("\n") if ln.strip().startswith("-")]
    if not lines:
        # No bullet items — check for feature keywords in full body
        lower = body.lower()
        return not any(kw in lower for kw in ["added", "new", "introducing", "support for"])
    # If every bullet line starts with "Fixed" / "Fix", it's bugfix-only
    feature_lines = [
        ln for ln in lines
        if not any(re.match(pat, ln, re.IGNORECASE) for pat in _BUGFIX_ONLY_PATTERNS)
        and ln  # skip blanks
    ]
    return len(feature_lines) == 0


# --- Curriculum Topic Map ---
# Maps curriculum weeks to their core topics for gap analysis

CURRICULUM_TOPIC_MAP = {
    1: {
        "title": "The Terminal & File System",
        "topics": ["terminal", "bash", "file system", "node.js", "npm", "command line", "cli"],
        "phase": "Foundation",
    },
    2: {
        "title": "Git & Version Control",
        "topics": ["git", "github", "version control", "branches", "pull requests", "commits"],
        "phase": "Foundation",
    },
    3: {
        "title": "Claude Code: First Contact",
        "topics": ["claude code install", "authentication", "plan mode", "diffs", "/compact", "/clear", "/help", "/model", "claude.md", "CLAUDE.md"],
        "phase": "Foundation",
    },
    4: {
        "title": "First Full Application",
        "topics": ["react", "next.js", "web app", "vercel", "deployment", "components"],
        "phase": "Building",
    },
    5: {
        "title": "Databases & APIs",
        "topics": ["database", "supabase", "sql", "api", "rest", "crud", "schema"],
        "phase": "Building",
    },
    6: {
        "title": "Authentication & Dashboards",
        "topics": ["auth", "authentication", "dashboard", "login", "protected routes", "responsive"],
        "phase": "Building",
    },
    7: {
        "title": "Testing & Quality",
        "topics": ["testing", "unit test", "integration test", "verification loop", "/code-review"],
        "phase": "Building",
    },
    8: {
        "title": "Second Project: Domain Deep Dive",
        "topics": ["project scoping", "external apis", "data visualization", "documentation", "readme"],
        "phase": "Building",
    },
    9: {
        "title": "Skills, Hooks & Custom Commands",
        "topics": ["skills", "skill.md", "hooks", "pretooluse", "posttooluse", "custom commands", "slash commands", ".claude/commands"],
        "phase": "Mastery",
    },
    10: {
        "title": "MCP Servers & Plugins",
        "topics": ["mcp", "model context protocol", "mcp server", "fastmcp", "plugins", "external tools"],
        "phase": "Mastery",
    },
    11: {
        "title": "Agent Teams & Parallel Sessions",
        "topics": ["agent teams", "multi-agent", "parallel sessions", "headless mode", "orchestration", "background tasks"],
        "phase": "Mastery",
    },
    12: {
        "title": "Capstone & Portfolio",
        "topics": ["capstone", "portfolio", "production", "ci/cd", "professional workflow", "full project"],
        "phase": "Mastery",
    },
}


# --- Analysis Functions ---

def analyze_gaps(updates: list[Update], curriculum_content: Optional[str] = None) -> list[CurriculumGap]:
    """
    Compare updates against the curriculum and identify gaps.

    Includes two consolidation passes:
    1. GitHub releases are grouped into a single summary (feature releases vs bugfix-only).
    2. Cross-source duplicates on the same topic are merged into one gap.

    Args:
        updates: List of recent updates from various sources
        curriculum_content: Optional raw markdown of the current curriculum file

    Returns:
        List of identified gaps with suggestions
    """
    # --- Build semantic index (if curriculum provided) ---
    sem_index = None
    if curriculum_content:
        sem_index = SemanticIndex()
        if sem_index.build(curriculum_content, CURRICULUM_TOPIC_MAP):
            logger.info("Semantic index ready for enhanced gap analysis")
        else:
            logger.info("Semantic index unavailable — using heuristic matching only")
            sem_index = None

    # --- Pass 1: consolidate GitHub releases ---
    release_updates = [u for u in updates if u.source == "github_releases"]
    other_updates = [u for u in updates if u.source != "github_releases"]

    consolidated = list(other_updates)  # start with non-release updates
    if release_updates:
        consolidated.extend(_consolidate_releases(release_updates))
        logger.info(
            "Consolidated %d GitHub releases into %d summary update(s)",
            len(release_updates), len(consolidated) - len(other_updates),
        )

    # --- Pass 2: build raw gaps (skip already-covered topics) ---
    raw_gaps = []
    skipped_covered = 0
    skipped_semantic = 0
    for update in consolidated:
        update_text = f"{update.title} {update.content}".lower()

        affected_weeks = _find_affected_weeks(update_text)

        # Try semantic week matching for unmatched updates
        if affected_weeks == [0] and sem_index:
            semantic_week = sem_index.best_week(update_text)
            if semantic_week and semantic_week > 0:
                affected_weeks = [semantic_week]

        gap_type = _classify_gap(update, update_text, curriculum_content)

        # Skip topics that are already covered in the curriculum
        if gap_type == "already_covered":
            skipped_covered += 1
            continue

        # Secondary check: semantic matching for topics the heuristic missed
        # Use a higher threshold (0.30) to avoid false positives from broad curriculum terms
        if curriculum_content and sem_index and gap_type != "deprecated":
            if is_semantically_covered(update_text, curriculum_content, threshold=0.30, index=sem_index):
                skipped_semantic += 1
                continue

        priority = _assess_priority(update, gap_type, affected_weeks)
        suggestion = _generate_suggestion(update, affected_weeks, gap_type)

        if suggestion:
            raw_gaps.append(CurriculumGap(
                update=update,
                affected_weeks=affected_weeks,
                gap_type=gap_type,
                priority=priority,
                suggestion=suggestion,
            ))

    if skipped_covered:
        logger.info("Skipped %d updates already covered (heuristic)", skipped_covered)
    if skipped_semantic:
        logger.info("Skipped %d updates already covered (semantic)", skipped_semantic)

    # --- Pass 3: cross-source deduplication ---
    gaps = _deduplicate_cross_source(raw_gaps)

    # Sort by priority (high first)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    gaps.sort(key=lambda g: priority_order.get(g.priority, 3))

    return gaps


def _consolidate_releases(releases: list[Update]) -> list[Update]:
    """Collapse a list of GitHub releases into 1-2 summary updates.

    - Feature releases (contain "Added", "New", etc.) → single summary
    - Bugfix-only releases → single low-detail note (or skipped entirely)
    """
    feature_releases = []
    bugfix_releases = []

    for r in releases:
        if _is_bugfix_release(r.content):
            bugfix_releases.append(r)
        else:
            feature_releases.append(r)

    summaries: list[Update] = []

    if feature_releases:
        # Extract the notable features from all feature releases
        notable_features = []
        all_tags = set()
        all_urls = []
        for r in feature_releases:
            all_tags.update(r.tags)
            all_urls.append(r.url)
            # Pull "Added ..." and significant lines from the body
            for line in r.content.split("\n"):
                stripped = line.strip().lstrip("- ").strip()
                if stripped and any(stripped.lower().startswith(kw) for kw in ["added", "new", "support", "introduced", "claude opus", "claude sonnet"]):
                    notable_features.append(stripped)

        # Cap the feature list to avoid an enormous summary
        features_text = "\n".join(f"- {f}" for f in notable_features[:15])
        if len(notable_features) > 15:
            features_text += f"\n- ... and {len(notable_features) - 15} more"

        versions = []
        for r in feature_releases:
            m = re.search(r'v[\d.]+', r.title)
            if m:
                versions.append(m.group())
        version_range = f"{versions[-1]}–{versions[0]}" if len(versions) > 1 else (versions[0] if versions else "")

        summaries.append(Update(
            source="github_releases",
            title=f"Claude Code releases ({version_range}): {len(feature_releases)} feature releases",
            content=f"Key features across {len(feature_releases)} releases:\n{features_text}",
            url=all_urls[0] if all_urls else "https://github.com/anthropics/claude-code/releases",
            date=feature_releases[0].date if feature_releases else "",
            tags=sorted(all_tags),
        ))

    if bugfix_releases:
        versions = []
        for r in bugfix_releases:
            m = re.search(r'v[\d.]+', r.title)
            if m:
                versions.append(m.group())
        ver_list = ", ".join(versions[:5])
        if len(versions) > 5:
            ver_list += f" + {len(versions) - 5} more"

        summaries.append(Update(
            source="github_releases",
            title=f"Claude Code: {len(bugfix_releases)} bugfix-only releases ({ver_list})",
            content=f"{len(bugfix_releases)} releases containing only bugfixes — no new curriculum-relevant features.",
            url="https://github.com/anthropics/claude-code/releases",
            date=bugfix_releases[0].date if bugfix_releases else "",
            tags=["claude-code", "release", "bugfix"],
        ))

    return summaries


def _topic_key(gap: CurriculumGap) -> str:
    """Generate a coarse key for cross-source dedup.

    Groups gaps that talk about the same topic (e.g., "opus 4.6") even
    if they come from different sources.
    """
    text = f"{gap.update.title} {gap.update.content}".lower()

    # Check for known high-signal phrases
    known_topics = [
        "opus 4.6", "opus 4", "sonnet 4.5", "haiku 4.5",
        "agent teams", "agent sdk", "cowork",
        "auto memory", "fast mode", "plan mode",
        "task management", "mcp",
    ]
    for topic in known_topics:
        if topic in text:
            return topic

    # Fall back to affected-weeks tuple as grouping key
    return f"weeks:{','.join(str(w) for w in gap.affected_weeks)}"


def _deduplicate_cross_source(gaps: list[CurriculumGap]) -> list[CurriculumGap]:
    """Merge gaps about the same topic from different sources.

    Keeps the highest-priority gap and notes how many sources reported it.
    """
    priority_rank = {"high": 0, "medium": 1, "low": 2}

    groups: dict[str, list[CurriculumGap]] = defaultdict(list)
    for gap in gaps:
        key = _topic_key(gap)
        groups[key].append(gap)

    merged = []
    for key, group in groups.items():
        if len(group) == 1:
            merged.append(group[0])
            continue

        # Pick the highest-priority, most-informative gap as the representative
        group.sort(key=lambda g: (priority_rank.get(g.priority, 3), -len(g.update.content)))
        best = group[0]
        best.source_count = len(group)

        # Combine affected weeks from all duplicates
        all_weeks = set()
        for g in group:
            all_weeks.update(g.affected_weeks)
        best.affected_weeks = sorted(all_weeks)

        # Note the other sources in the suggestion
        other_sources = [g.update.source for g in group[1:]]
        source_note = f"\n📌 Also reported by: {', '.join(other_sources)}"
        best.suggestion += source_note

        merged.append(best)
        logger.debug("Merged %d gaps for topic '%s'", len(group), key)

    logger.info(
        "Cross-source dedup: %d raw gaps → %d unique topics",
        len(gaps), len(merged),
    )
    return merged


def _find_affected_weeks(text: str) -> list[int]:
    """Find which curriculum weeks are affected by this update."""
    affected = []
    
    for week_num, info in CURRICULUM_TOPIC_MAP.items():
        for topic in info["topics"]:
            if topic in text:
                if week_num not in affected:
                    affected.append(week_num)
                break
    
    # If no existing week matches, this might be a new topic
    if not affected:
        affected = [0]  # 0 = needs new section or appendix
    
    return sorted(affected)


def _classify_gap(update: Update, text: str, curriculum_content: Optional[str]) -> str:
    """Classify the type of gap."""

    # Check for deprecation signals
    deprecation_signals = ["deprecated", "removed", "no longer", "replaced by", "breaking change", "sunset"]
    if any(signal in text for signal in deprecation_signals):
        return "deprecated"

    # If curriculum content is provided, check if the topic is already covered
    if curriculum_content:
        if _topic_already_covered(update, text, curriculum_content):
            return "already_covered"

    # Check for new feature signals
    new_signals = ["introducing", "new feature", "now available", "just shipped", "launched", "announcing", "release"]
    if any(signal in text for signal in new_signals):
        return "new_feature"

    # Check for updates to existing features
    update_signals = ["updated", "improved", "enhanced", "faster", "better", "changed", "upgrade"]
    if any(signal in text for signal in update_signals):
        return "updated"

    # If curriculum content is provided, check if topic exists by tags
    if curriculum_content:
        key_terms = [t for t in update.tags if t not in ["claude-code"]]
        if key_terms:
            content_lower = curriculum_content.lower()
            if not any(term.replace("-", " ") in content_lower for term in key_terms):
                return "new_topic"

    return "new_feature"


def _topic_already_covered(update: Update, text: str, curriculum_content: str) -> bool:
    """Check if an update's core topic is already covered in the curriculum.

    Uses multiple heuristic checks:
    1. Known topic phrases extracted from the update title/content
    2. URL matching (if the same URL is already referenced)
    3. Version-specific strings (e.g., "v2.1.32", "opus 4.6")
    """
    content_lower = curriculum_content.lower()

    # Check 1: If the update URL is already in the curriculum, it's covered
    if update.url and update.url in curriculum_content:
        return True

    # Check 2: Extract distinctive phrases from the title and check curriculum
    # These are multi-word phrases that are specific enough to confirm coverage
    title_lower = update.title.lower()
    _COVERAGE_PHRASES = [
        # Model names
        ("opus 4.6", ["opus 4.6"]),
        ("sonnet 4.5", ["sonnet 4.5"]),
        ("haiku 4.5", ["haiku 4.5"]),
        # Tools and features
        ("agent sdk", ["agent sdk"]),
        ("claudedesk", ["claudedesk"]),
        ("rtk", ["rtk"]),
        ("token killer", ["rtk", "token killer"]),
        ("obsidian", ["obsidian"]),
        ("cleanup script", ["cleanup strategies", "~/.claude directory"]),
        ("developer platform", ["developer platform", "platform.claude.com"]),
        ("model context protocol", ["model context protocol", "mcp"]),
        ("cowork", ["cowork"]),
        # Core Claude Code features (broad but curriculum-relevant)
        ("hooks", ["hook events", "hook types", "/hooks"]),
        ("skills", ["skill frontmatter", "skill.md", "custom slash"]),
        ("subagent", ["subagent", "built-in subagent"]),
        ("custom command", ["custom commands", ".claude/commands"]),
        ("permission", ["permission mode", "allowedtools", "bypasspermissions"]),
        ("mcp server", ["mcp server", "mcp serve", "mcp tool"]),
        ("ide integration", ["vs code", "jetbrains", "ide integration"]),
        ("environment variable", ["claude_model", "anthropic_api_key", "environment variable"]),
        # Version-specific mentions
        ("v2.1.", ["v2.1."]),
    ]

    for trigger, required_any in _COVERAGE_PHRASES:
        if trigger in title_lower or trigger in text:
            if any(phrase in content_lower for phrase in required_any):
                logger.debug(
                    "Topic '%s' already covered (matched: %s)",
                    update.title[:50], trigger,
                )
                return True

    # Check 3: Extract version numbers from content and check if any are referenced
    version_matches = re.findall(r'v\d+\.\d+\.\d+', text)
    if version_matches:
        covered_versions = sum(1 for v in version_matches if v in content_lower)
        if covered_versions >= len(version_matches) * 0.5:  # >50% of versions mentioned
            logger.debug(
                "Topic '%s' likely covered (%d/%d versions found in curriculum)",
                update.title[:50], covered_versions, len(version_matches),
            )
            return True

    return False


def _assess_priority(update: Update, gap_type: str, affected_weeks: list[int]) -> str:
    """Assess the priority of addressing this gap.

    Priority rules (evaluated in order):
    - Deprecations → always high
    - Bugfix-only releases → always low (not curriculum-worthy)
    - New features from official Anthropic channels (blog/changelog) → high
    - Feature releases from GitHub → medium (consolidated, not individually high)
    - Foundation-week updates (weeks 1-3) → high
    - Boris's posts about major features → medium
    - Everything else → low
    """
    # Deprecations are always high priority
    if gap_type == "deprecated":
        return "high"

    # Bugfix-only releases should never be high priority
    if update.source == "github_releases" and "bugfix" in update.tags:
        return "low"

    # New features from blog/changelog are high priority (editorial, curated)
    if gap_type == "new_feature" and update.source in ["anthropic_blog", "anthropic_changelog"]:
        return "high"

    # GitHub feature releases are medium — they're consolidated summaries
    if gap_type == "new_feature" and update.source == "github_releases":
        return "medium"

    # Updates to foundation weeks (1-3) are high priority for beginners
    if any(w in [1, 2, 3] for w in affected_weeks):
        return "high"

    # Boris's posts about major features
    if update.source == "x_boris" and any(tag in update.tags for tag in ["claude-code", "mcp", "agent-teams", "model-update"]):
        return "medium"

    # Everything else
    return "low"


def _generate_suggestion(update: Update, affected_weeks: list[int], gap_type: str) -> str:
    """Generate a specific suggestion for how to update the curriculum."""
    
    week_refs = ", ".join(
        f"Week {w}" if w > 0 else "New Section" 
        for w in affected_weeks
    )
    
    if gap_type == "deprecated":
        return (
            f"⚠️ DEPRECATION: {update.title}\n"
            f"Affects: {week_refs}\n"
            f"Action: Review and remove/replace deprecated content.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    if gap_type == "new_feature":
        return (
            f"🆕 NEW FEATURE: {update.title}\n"
            f"Add to: {week_refs}\n"
            f"Action: Add new topic or exercise covering this feature.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    if gap_type == "updated":
        return (
            f"🔄 UPDATE: {update.title}\n"
            f"Update: {week_refs}\n"
            f"Action: Refresh existing content to reflect changes.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    if gap_type == "new_topic":
        return (
            f"📚 NEW TOPIC: {update.title}\n"
            f"Consider: Adding to {week_refs} or creating supplemental material.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    return ""


def generate_update_report(gaps: list[CurriculumGap]) -> str:
    """Generate a formatted markdown report of all gaps and suggestions."""
    
    if not gaps:
        return "✅ **Curriculum is up to date!** No gaps found between latest updates and current curriculum content."
    
    high = [g for g in gaps if g.priority == "high"]
    medium = [g for g in gaps if g.priority == "medium"]
    low = [g for g in gaps if g.priority == "low"]
    
    report = "# Curriculum Update Report\n\n"
    report += f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n"
    report += f"**Total gaps found:** {len(gaps)} ({len(high)} high, {len(medium)} medium, {len(low)} low priority)\n\n"
    
    if high:
        report += "## 🔴 High Priority\n\n"
        for gap in high:
            report += f"{gap.suggestion}\n\n---\n\n"
    
    if medium:
        report += "## 🟡 Medium Priority\n\n"
        for gap in medium:
            report += f"{gap.suggestion}\n\n---\n\n"
    
    if low:
        report += "## 🟢 Low Priority\n\n"
        for gap in low:
            report += f"{gap.suggestion}\n\n---\n\n"
    
    # Summary of affected weeks
    all_weeks = set()
    for gap in gaps:
        all_weeks.update(gap.affected_weeks)
    
    report += "## Affected Weeks Summary\n\n"
    for week in sorted(all_weeks):
        if week == 0:
            report += "- **New Section Needed** — Content that doesn't fit existing weeks\n"
        else:
            info = CURRICULUM_TOPIC_MAP.get(week, {})
            title = info.get("title", "Unknown")
            count = sum(1 for g in gaps if week in g.affected_weeks)
            report += f"- **Week {week}: {title}** — {count} update(s)\n"
    
    return report


def load_curriculum_file(path: str) -> Optional[str]:
    """Load curriculum markdown file from disk."""
    try:
        p = Path(path).expanduser().resolve()
        if p.exists():
            return p.read_text(encoding="utf-8")
        logger.warning("Curriculum file not found: %s", p)
    except Exception as e:
        logger.error("Failed to load curriculum file %s: %s", path, e)
    return None


def save_curriculum_file(path: str, content: str) -> bool:
    """Save updated curriculum to disk."""
    try:
        p = Path(path).expanduser().resolve()
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        logger.info("Saved curriculum file: %s (%d chars)", p, len(content))
        return True
    except Exception as e:
        logger.error("Failed to save curriculum file %s: %s", path, e)
        return False


# --- Auto-Apply Logic ---


def _generate_update_content(gap: "CurriculumGap") -> Optional[CurriculumUpdate]:
    """Convert a CurriculumGap into a structured CurriculumUpdate for auto-apply.

    Returns None if the gap cannot be meaningfully converted.
    """
    update = gap.update
    date_str = update.date[:10] if update.date else "unknown"
    title = update.title[:100].strip()
    summary = update.content[:150].strip()
    if summary and not summary.endswith("."):
        summary = summary.rsplit(" ", 1)[0] + "..."

    week = gap.affected_weeks[0] if gap.affected_weeks else 0

    if gap.gap_type == "deprecated":
        content = (
            f"> **Deprecation Notice ({date_str}):** {title}. "
            f"{summary} "
            f"[Source]({update.url})"
        )
        section = f"Deprecation: {title[:60]}"
        action = "append"

    elif gap.gap_type == "new_feature":
        content = (
            f"**{title}** (added {date_str})\n"
            f"{summary}\n"
            f"Source: {update.url}"
        )
        section = title[:80]
        action = "append" if week > 0 else "new"

    elif gap.gap_type == "updated":
        content = (
            f"**Update ({date_str}):** {title}. "
            f"{summary} "
            f"[Source]({update.url})"
        )
        section = f"Update: {title[:60]}"
        action = "append"

    elif gap.gap_type == "new_topic":
        content = (
            f"**{title}** (added {date_str})\n"
            f"{summary}\n"
            f"Source: {update.url}"
        )
        section = title[:80]
        action = "new"
        week = 0

    else:
        return None

    return CurriculumUpdate(
        week=week,
        section=section,
        action=action,
        content=content,
        reason=f"Auto-applied: {gap.gap_type} from {update.source}",
    )


def convert_gaps_to_updates(gaps: list["CurriculumGap"]) -> list[CurriculumUpdate]:
    """Batch-convert CurriculumGap objects into CurriculumUpdate objects."""
    updates = []
    for gap in gaps:
        cu = _generate_update_content(gap)
        if cu is not None:
            updates.append(cu)
    return updates


def apply_single_update(curriculum_content: str, update: CurriculumUpdate) -> str:
    """Apply a single CurriculumUpdate to curriculum content.

    Returns the modified content string.
    Raises ValueError if the update cannot be applied.
    """
    update_block = f"\n\n{update.content}\n"

    if update.action == "append" and update.week > 0:
        week_pattern = re.compile(
            rf'^(#{{1,3}})\s+(?:WEEK|Week|week)\s+{update.week}\b',
            re.MULTILINE,
        )
        match = week_pattern.search(curriculum_content)

        if not match:
            # Week not found — append at end
            return curriculum_content + update_block

        week_pos = match.start()

        # Find next week/phase/appendix header after this week
        next_section = re.compile(
            rf'^#{{1,3}}\s+(?:(?:WEEK|Week|week)\s+{update.week + 1}\b|(?:Phase|PHASE|Appendix|APPENDIX))',
            re.MULTILINE,
        )
        next_match = next_section.search(curriculum_content, match.end())
        next_boundary = next_match.start() if next_match else len(curriculum_content)

        # Find last --- separator before boundary
        sep_pos = curriculum_content.rfind("\n---", week_pos, next_boundary)
        insert_pos = sep_pos if sep_pos != -1 else next_boundary

        return curriculum_content[:insert_pos] + update_block + curriculum_content[insert_pos:]

    elif update.action == "new" or update.week == 0:
        appendix_block = f"\n\n---\n\n### Appendix: {update.section}\n\n{update.content}\n"
        return curriculum_content + appendix_block

    elif update.action == "replace":
        section_idx = curriculum_content.lower().find(update.section.lower())
        if section_idx == -1:
            raise ValueError(
                f"Could not find section '{update.section}' in curriculum. "
                f"Use action='append' instead."
            )

        # Find the heading line that contains the section title and extract
        # the heading prefix (e.g. "### ", "## ") so it is preserved.
        heading_prefix = ""
        line_start = curriculum_content.rfind("\n", 0, section_idx)
        line_start = 0 if line_start == -1 else line_start + 1
        heading_line = curriculum_content[line_start:section_idx + len(update.section)]
        heading_match = re.match(r'^(#{1,3}\s+)', heading_line)
        if heading_match:
            heading_prefix = heading_match.group(1)

        replacement_block = f"\n\n{heading_prefix}{update.content}\n"

        next_header = re.compile(r'^#{1,3}\s+', re.MULTILINE)
        search_start = section_idx + len(update.section)
        next_match = next_header.search(curriculum_content, search_start)

        if next_match:
            return (
                curriculum_content[:line_start]
                + replacement_block + "\n"
                + curriculum_content[next_match.start():]
            )
        else:
            return curriculum_content[:line_start] + replacement_block

    else:
        raise ValueError(f"Invalid action '{update.action}'. Use 'append', 'replace', or 'new'.")
