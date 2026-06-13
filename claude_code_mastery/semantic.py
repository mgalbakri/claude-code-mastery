"""Semantic matching engine for curriculum gap analysis.

Uses TF-IDF vectorisation + cosine similarity to compare update content
against curriculum sections.  This replaces the brittle keyword-matching
approach with one that understands "lifecycle event callbacks" and "hooks"
are the same concept.

No external ML dependencies — uses scikit-learn's TfidfVectorizer which is
lightweight and fast.  Falls back gracefully to keyword matching when
scikit-learn is unavailable.

Key entry points
-----------------
- ``is_semantically_covered(update_text, curriculum_text)`` — main check
- ``find_best_week(update_text, curriculum_sections)`` — find best-matching week
- ``SemanticIndex.build(curriculum_text)`` — build reusable index
"""

import asyncio
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded sklearn components
_sklearn_available: Optional[bool] = None
_TfidfVectorizer = None
_cosine_similarity = None


def _ensure_sklearn():
    """Lazy-load scikit-learn. Sets _sklearn_available flag."""
    global _sklearn_available, _TfidfVectorizer, _cosine_similarity
    if _sklearn_available is not None:
        return _sklearn_available
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        _TfidfVectorizer = TfidfVectorizer
        _cosine_similarity = cosine_similarity
        _sklearn_available = True
        logger.debug("scikit-learn loaded for semantic matching")
    except ImportError:
        _sklearn_available = False
        logger.info(
            "scikit-learn not installed — semantic matching will use fallback. "
            "Install with: pip install scikit-learn"
        )
    return _sklearn_available


# --- Normalisation helpers ---

def _normalise(text: str) -> str:
    """Normalise text for comparison."""
    # Lowercase
    text = text.lower()
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove markdown formatting
    text = re.sub(r"[#*_`\[\]()]", " ", text)
    # Remove URLs
    text = re.sub(r"https?://\S+", "", text)
    return text.strip()


# Claude Code domain synonyms — pairs that should be considered equivalent
_SYNONYMS = [
    ({"hooks", "hook"}, {"lifecycle events", "lifecycle callbacks", "event handlers", "pretooluse", "posttooluse"}),
    ({"skills", "skill"}, {"slash commands", "custom commands", "skill.md"}),
    ({"subagent", "subagents"}, {"child agent", "child agents", "agent delegation", "spawned agent"}),
    ({"mcp", "model context protocol"}, {"mcp server", "mcp tool", "fastmcp", "external tools"}),
    ({"permissions"}, {"access control", "allowedtools", "allow list", "deny list", "sandbox"}),
    ({"ide integration"}, {"vs code", "vscode", "jetbrains", "cursor ide"}),
    ({"agent teams"}, {"multi-agent", "parallel sessions", "orchestration"}),
    ({"claude.md"}, {"project context", "project memory", "project instructions"}),
    ({"cli"}, {"command line", "terminal", "flags", "arguments"}),
    ({"token"}, {"context window", "token usage", "token limit", "compact"}),
]

def _expand_with_synonyms(text: str) -> str:
    """Expand text with domain synonyms so TF-IDF can match them."""
    text_lower = text.lower()
    extras = []
    for group_a, group_b in _SYNONYMS:
        all_terms = group_a | group_b
        found = any(term in text_lower for term in all_terms)
        if found:
            extras.extend(all_terms)
    if extras:
        return text + " " + " ".join(extras)
    return text


class SemanticIndex:
    """Reusable TF-IDF index over curriculum sections.

    Build once per analysis run, query many times.
    """

    def __init__(self):
        self._vectorizer = None
        self._matrix = None
        self._sections: list[dict] = []  # [{week, title, text}, ...]
        self._built = False

    def build(self, curriculum_text: str, topic_map: Optional[dict] = None) -> bool:
        """Build the index from curriculum markdown.

        Returns True if the index was built successfully (sklearn available).
        """
        if not _ensure_sklearn():
            return False

        self._sections = self._parse_curriculum_sections(curriculum_text, topic_map)
        if not self._sections:
            logger.warning("No sections found in curriculum for indexing")
            return False

        documents = [
            _expand_with_synonyms(_normalise(s["text"]))
            for s in self._sections
        ]

        self._vectorizer = _TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 3),
            stop_words="english",
            sublinear_tf=True,
        )
        self._matrix = self._vectorizer.fit_transform(documents)
        self._built = True
        logger.info(
            "Semantic index built: %d sections, %d features",
            len(self._sections),
            len(self._vectorizer.get_feature_names_out()),
        )
        return True

    def query(self, text: str, threshold: float = 0.15) -> list[dict]:
        """Find curriculum sections similar to the query text.

        Returns list of {week, title, score} dicts, sorted by score desc.
        Only includes results above the threshold.
        """
        if not self._built:
            return []

        query_vec = self._vectorizer.transform(
            [_expand_with_synonyms(_normalise(text))]
        )
        similarities = _cosine_similarity(query_vec, self._matrix).flatten()

        results = []
        for i, score in enumerate(similarities):
            if score >= threshold:
                results.append({
                    "week": self._sections[i]["week"],
                    "title": self._sections[i]["title"],
                    "score": float(score),
                })

        results.sort(key=lambda r: r["score"], reverse=True)
        return results

    def is_covered(self, text: str, threshold: float = 0.20) -> bool:
        """Check if the topic described by text is covered in the curriculum.

        Uses a higher threshold than query() to reduce false positives.
        """
        results = self.query(text, threshold=threshold)
        return len(results) > 0

    def best_week(self, text: str) -> Optional[int]:
        """Find the best-matching curriculum week for this content."""
        results = self.query(text, threshold=0.10)
        if results:
            return results[0]["week"]
        return None

    def _parse_curriculum_sections(
        self, text: str, topic_map: Optional[dict] = None
    ) -> list[dict]:
        """Parse curriculum markdown into indexable sections."""
        sections = []

        # Split by week headers
        week_pattern = re.compile(
            r"^#{1,3}\s+(?:WEEK|Week|week)\s+(\d+)\s*[:\-—]?\s*(.*)",
            re.MULTILINE,
        )
        matches = list(week_pattern.finditer(text))

        for i, match in enumerate(matches):
            week_num = int(match.group(1))
            week_title = match.group(2).strip()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)

            section_text = text[start:end].strip()
            if section_text:
                sections.append({
                    "week": week_num,
                    "title": week_title or f"Week {week_num}",
                    "text": section_text,
                })

        # Also index appendices
        appendix_pattern = re.compile(
            r"^#{1,3}\s+(?:Appendix|APPENDIX)\s+([A-Z])\s*[:\-—]?\s*(.*)",
            re.MULTILINE,
        )
        for match in appendix_pattern.finditer(text):
            letter = match.group(1)
            title = match.group(2).strip()
            start = match.end()
            # Find next appendix or end
            next_match = appendix_pattern.search(text, start)
            end = next_match.start() if next_match else len(text)

            section_text = text[start:end].strip()
            if section_text:
                sections.append({
                    "week": 0,
                    "title": f"Appendix {letter}: {title}",
                    "text": section_text,
                })

        # Add topic map entries as additional context
        if topic_map:
            for week_num, info in topic_map.items():
                topics_text = " ".join(info.get("topics", []))
                sections.append({
                    "week": week_num,
                    "title": info.get("title", f"Week {week_num}"),
                    "text": f"{info.get('title', '')} {topics_text}",
                })

        return sections


# --- Convenience functions ---

_global_index: Optional[SemanticIndex] = None
_index_lock = asyncio.Lock()


def build_index(curriculum_text: str, topic_map: Optional[dict] = None) -> SemanticIndex:
    """Build (or rebuild) the global semantic index."""
    global _global_index
    idx = SemanticIndex()
    idx.build(curriculum_text, topic_map)
    _global_index = idx
    return idx


def _ensure_global_index(curriculum_text: str) -> None:
    """Build the global index if it hasn't been built yet (non-async helper)."""
    global _global_index
    if _global_index is None or not _global_index._built:
        build_index(curriculum_text)


async def ensure_global_index_async(curriculum_text: str) -> None:
    """Build the global index under a lock to prevent redundant concurrent rebuilds."""
    global _global_index
    async with _index_lock:
        if _global_index is None or not _global_index._built:
            build_index(curriculum_text)


def is_semantically_covered(
    update_text: str,
    curriculum_text: str,
    threshold: float = 0.20,
    index: Optional[SemanticIndex] = None,
) -> bool:
    """Check if an update's topic is already covered in the curriculum.

    This is the main entry point for the analyzer to use.

    Args:
        update_text: The update title + content to check
        curriculum_text: Full curriculum markdown (used to build index if needed)
        threshold: Similarity threshold (0-1). Higher = stricter matching.
        index: Optional pre-built index (avoids rebuilding per call)
    """
    if index:
        return index.is_covered(update_text, threshold=threshold)

    # Build or reuse global index
    _ensure_global_index(curriculum_text)

    if _global_index and _global_index._built:
        return _global_index.is_covered(update_text, threshold=threshold)

    # Fallback: simple keyword check (if sklearn unavailable)
    return _fallback_keyword_check(update_text, curriculum_text)


def find_best_week(
    update_text: str,
    curriculum_text: str,
    index: Optional[SemanticIndex] = None,
) -> Optional[int]:
    """Find the best-matching week for an update.

    Returns week number or None if no good match.
    """
    if index:
        return index.best_week(update_text)

    _ensure_global_index(curriculum_text)

    if _global_index and _global_index._built:
        return _global_index.best_week(update_text)

    return None


def _fallback_keyword_check(update_text: str, curriculum_text: str) -> bool:
    """Simple keyword overlap check when sklearn is unavailable."""
    update_words = set(_normalise(update_text).split())
    curriculum_lower = curriculum_text.lower()

    # Count how many meaningful words from the update appear in the curriculum
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been",
        "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "can", "shall", "to", "of",
        "in", "for", "on", "with", "at", "by", "from", "as", "into",
        "about", "like", "through", "after", "over", "between", "out",
        "up", "down", "this", "that", "these", "those", "it", "its",
        "and", "but", "or", "nor", "not", "no", "so", "if", "then",
        "than", "too", "very", "just", "new", "also", "now",
    }

    meaningful = update_words - stop_words
    if not meaningful:
        return False

    found = sum(1 for w in meaningful if w in curriculum_lower)
    ratio = found / len(meaningful) if meaningful else 0

    return ratio >= 0.5  # 50% of meaningful words found = likely covered
