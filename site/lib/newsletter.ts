import fs from "fs";
import path from "path";

export interface NewsletterIssue {
  number: number;
  title: string;
  filename: string;
  date: string;
}

/**
 * Scan public/newsletter/ for issue HTML files and extract metadata.
 * Returns issues sorted by number (newest first).
 */
export function getNewsletterIssues(): NewsletterIssue[] {
  const dir = path.join(process.cwd(), "public", "newsletter");

  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("issue-") && f.endsWith(".html"));

  const issues: NewsletterIssue[] = files.map((filename) => {
    const number = parseInt(filename.replace("issue-", "").replace(".html", ""), 10);
    const filepath = path.join(dir, filename);
    const html = fs.readFileSync(filepath, "utf-8");

    // Extract title from <title> tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1] : `Issue #${number}`;
    // Strip "Agent Code Academy — Weekly Dispatch #N" prefix if present
    const title = rawTitle
      .replace(/Agent Code Academy\s*[—–-]\s*/i, "")
      .replace(/Weekly Dispatch #\d+\s*/i, "")
      .trim() || `Weekly Dispatch #${number}`;

    // Try to extract date from content (e.g. "Mar 3 – Mar 9, 2026")
    const dateMatch = html.match(
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s*[–—-]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{1,2},?\s*\d{4}/i
    );
    const stat = fs.statSync(filepath);
    const date = dateMatch ? dateMatch[0] : stat.mtime.toISOString().split("T")[0];

    return { number, title, filename, date };
  });

  return issues.sort((a, b) => b.number - a.number);
}

export function getNewsletterIssue(issueNumber: number): NewsletterIssue | null {
  const issues = getNewsletterIssues();
  return issues.find((i) => i.number === issueNumber) || null;
}

export function getNewsletterHtml(issueNumber: number): string | null {
  const filepath = path.join(
    process.cwd(),
    "public",
    "newsletter",
    `issue-${issueNumber}.html`
  );
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath, "utf-8");
}

/**
 * Extract embeddable content from a newsletter HTML document.
 * Returns scoped CSS + body HTML that can be rendered inline
 * instead of in an iframe — making content crawlable by Google.
 *
 * All CSS is wrapped inside a `.newsletter-embed { }` nesting block
 * so every rule — element selectors, class selectors, etc. — is
 * automatically scoped to the container. This avoids the fragile
 * regex-based selector replacement that previously only handled
 * body/html/* selectors and missed everything else.
 *
 * CSS nesting is supported in Chrome 120+, Firefox 117+, Safari 17.2+.
 */
export function getNewsletterContent(issueNumber: number): {
  styles: string;
  body: string;
} | null {
  const html = getNewsletterHtml(issueNumber);
  if (!html) return null;

  // Extract <style> blocks
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  let css = styleMatches
    .map((s) => s.replace(/<\/?style[^>]*>/gi, ""))
    .join("\n");

  // Strip body/html selectors since they don't apply inline —
  // the nesting block already scopes everything to .newsletter-embed.
  // Only replace at the start of a rule (selector position), not inside
  // property values or comments, by matching selector-like patterns.
  css = css.replace(/^(\s*)body\s*\{/gm, "$1& {");
  css = css.replace(/^(\s*)html\s*\{/gm, "$1& {");

  // Wrap ALL rules inside a nesting block so every selector
  // (element, class, id, pseudo, etc.) is scoped automatically.
  css = `.newsletter-embed {\n${css}\n}`;

  // Extract body content (between <body> and </body>) — use greedy
  // match to capture everything including nested content that might
  // contain </body> in scripts or comments.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : "";

  return { styles: css, body };
}
