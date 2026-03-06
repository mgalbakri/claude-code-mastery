"""Tests for the newsletter pipeline."""

import json
import pytest
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

from claude_code_mastery.newsletter import (
    NewsletterConfig,
    NewsletterIssue,
    NewsletterStat,
    NewsletterUpdate,
    NewsletterTip,
    get_next_issue_number,
    load_newsletter_state,
    save_newsletter_state,
    collect_newsletter_content,
    editorialize_content,
    render_html,
    run_newsletter_pipeline,
    _deterministic_editorialize,
    _format_week_list,
)
from claude_code_mastery.sources import Update
from claude_code_mastery.analyzer import CurriculumGap


# --- Fixtures ---

@pytest.fixture
def sample_updates():
    return [
        Update(
            source="github_releases",
            title="Multi-file edit mode",
            content="Claude Code now supports multi-file edits",
            url="https://github.com/anthropics/claude-code/releases/v1.2",
            date="2026-02-24",
            tags=["feature"],
        ),
        Update(
            source="anthropic_changelog",
            title="Hook execution 3x faster",
            content="Hooks run in parallel now",
            url="https://docs.anthropic.com/changelog",
            date="2026-02-25",
            tags=["performance"],
        ),
    ]


@pytest.fixture
def sample_gaps(sample_updates):
    return [
        CurriculumGap(
            update=sample_updates[0],
            affected_weeks=[7, 9],
            gap_type="new_feature",
            priority="high",
            suggestion="Add multi-file edit examples to Week 7 refactoring lesson.",
        ),
        CurriculumGap(
            update=sample_updates[1],
            affected_weeks=[10],
            gap_type="updated",
            priority="medium",
            suggestion="Update Week 10 hooks section with parallel execution info.",
        ),
    ]


@pytest.fixture
def tmp_state_dir(tmp_path, monkeypatch):
    """Redirect newsletter state to a temp directory."""
    monkeypatch.setattr(
        "claude_code_mastery.newsletter.get_cache_dir",
        lambda: tmp_path,
    )
    return tmp_path


# --- State Management ---

class TestNewsletterState:
    def test_initial_state(self, tmp_state_dir):
        state = load_newsletter_state()
        assert state["last_issue_number"] == 0
        assert state["last_sent_date"] is None
        assert state["history"] == []

    def test_save_and_load(self, tmp_state_dir):
        state = {"last_issue_number": 5, "last_sent_date": "2026-02-24T09:00:00Z", "history": []}
        save_newsletter_state(state)
        loaded = load_newsletter_state()
        assert loaded["last_issue_number"] == 5

    def test_get_next_issue_number(self, tmp_state_dir):
        assert get_next_issue_number() == 1
        save_newsletter_state({"last_issue_number": 10, "last_sent_date": None, "history": []})
        assert get_next_issue_number() == 11


# --- Helper Functions ---

class TestHelpers:
    def test_format_week_list_empty(self):
        assert _format_week_list([]) == ""
        assert _format_week_list([0]) == ""

    def test_format_week_list_single(self):
        assert _format_week_list([7]) == "→ Affects Week 7"

    def test_format_week_list_multiple(self):
        result = _format_week_list([9, 7])
        assert result == "→ Affects Week 7, Week 9"


# --- Deterministic Editorialization ---

class TestDeterministicEditorialize:
    def test_produces_newsletter_issue(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        assert isinstance(issue, NewsletterIssue)
        assert issue.issue_number == 1
        assert len(issue.updates) == 2

    def test_classifies_gap_types(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        assert issue.updates[0].tag_class == "new"
        assert issue.updates[0].tag_label == "New"
        assert issue.updates[1].tag_class == "updated"
        assert issue.updates[1].tag_label == "Updated"

    def test_headline_from_top_priority(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        assert "Multi-file edit mode" in issue.headline

    def test_empty_gaps(self, sample_updates, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, [])
        assert issue.headline == "This Week in Claude Code"
        assert len(issue.updates) == 0


# --- HTML Rendering ---

class TestRenderHtml:
    def test_renders_valid_html(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        html = render_html(issue)
        assert "<!DOCTYPE html>" in html
        assert "Weekly Dispatch #1" in html
        assert "Multi-file edit mode" in html

    def test_renders_with_tip(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        issue.tip = NewsletterTip(
            title="Test Tip",
            body="This is a test tip.",
            code="echo hello",
        )
        html = render_html(issue)
        assert "Test Tip" in html
        assert "echo hello" in html

    def test_renders_without_tip(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        issue.tip = None
        html = render_html(issue)
        assert "Quick Tip of the Week" not in html

    def test_unsubscribe_url_present(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = _deterministic_editorialize(sample_updates, sample_gaps)
        html = render_html(issue)
        assert "/api/unsubscribe" in html


# --- AI Editorialization ---

class TestEditorializeContent:
    @pytest.mark.asyncio
    async def test_falls_back_without_api_key(self, sample_updates, sample_gaps, tmp_state_dir):
        issue = await editorialize_content(sample_updates, sample_gaps, "")
        assert isinstance(issue, NewsletterIssue)
        assert len(issue.updates) == 2

    @pytest.mark.asyncio
    async def test_applies_ai_content(self, sample_updates, sample_gaps, tmp_state_dir):
        ai_response = {
            "content": [{"text": json.dumps({
                "headline": "AI-Generated Headline",
                "updates": ["Rewritten summary 1", "Rewritten summary 2"],
                "tip_title": "AI Tip",
                "tip_body": "AI tip body",
                "tip_code": "ai_code()",
            })}]
        }

        mock_response = MagicMock()
        mock_response.json.return_value = ai_response
        mock_response.raise_for_status = MagicMock()

        with patch("claude_code_mastery.newsletter.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock(
                post=AsyncMock(return_value=mock_response)
            ))
            mock_client.return_value.__aexit__ = AsyncMock(return_value=False)

            issue = await editorialize_content(
                sample_updates, sample_gaps, "test-api-key"
            )

        assert issue.headline == "AI-Generated Headline"
        assert issue.tip is not None
        assert issue.tip.title == "AI Tip"


# --- Config ---

class TestNewsletterConfig:
    def test_from_env_defaults(self, monkeypatch):
        monkeypatch.delenv("RESEND_API_KEY", raising=False)
        monkeypatch.delenv("RESEND_AUDIENCE_ID", raising=False)
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        config = NewsletterConfig.from_env()
        assert config.resend_api_key == ""
        assert config.audience_id == ""

    def test_from_env_with_values(self, monkeypatch):
        monkeypatch.setenv("RESEND_API_KEY", "re_test123")
        monkeypatch.setenv("RESEND_AUDIENCE_ID", "aud_456")
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test")
        config = NewsletterConfig.from_env()
        assert config.resend_api_key == "re_test123"
        assert config.audience_id == "aud_456"
        assert config.anthropic_api_key == "sk-ant-test"


# --- Full Pipeline ---

class TestPipeline:
    @pytest.mark.asyncio
    async def test_preview_pipeline(self, sample_updates, sample_gaps, tmp_state_dir, tmp_path):
        """Test the full pipeline in preview mode (no sending, no PDF rendering)."""
        mock_fetch_result = MagicMock()
        mock_fetch_result.updates = sample_updates
        mock_fetch_result.errors = []

        config = NewsletterConfig(
            output_dir=str(tmp_path / "output"),
            curriculum_path="",
        )

        with patch("claude_code_mastery.newsletter.fetch_all_updates", new_callable=AsyncMock) as mock_fetch, \
             patch("claude_code_mastery.newsletter.analyze_gaps") as mock_analyze, \
             patch("claude_code_mastery.newsletter.render_pdf", new_callable=AsyncMock) as mock_pdf, \
             patch("claude_code_mastery.newsletter.save_web_version") as mock_web:

            mock_fetch.return_value = mock_fetch_result
            mock_analyze.return_value = sample_gaps
            mock_pdf.return_value = str(tmp_path / "output" / "issue-1.pdf")

            result = await run_newsletter_pipeline(
                config=config,
                preview_only=True,
            )

        assert result["success"] is True
        assert result["preview"] is True
        assert result["issue_number"] == 1
        assert result["update_count"] == 2

    @pytest.mark.asyncio
    async def test_skips_when_no_updates(self, tmp_state_dir, tmp_path):
        mock_fetch_result = MagicMock()
        mock_fetch_result.updates = []
        mock_fetch_result.errors = []

        config = NewsletterConfig(output_dir=str(tmp_path / "output"))

        with patch("claude_code_mastery.newsletter.fetch_all_updates", new_callable=AsyncMock) as mock_fetch, \
             patch("claude_code_mastery.newsletter.analyze_gaps") as mock_analyze:

            mock_fetch.return_value = mock_fetch_result
            mock_analyze.return_value = []

            result = await run_newsletter_pipeline(config=config, preview_only=True)

        assert result["success"] is True
        assert result["skipped"] is True
