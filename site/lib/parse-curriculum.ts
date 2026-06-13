import fs from "fs";
import path from "path";
import type { CurriculumData, Week, Appendix } from "./types";

/**
 * Look for curriculum.md in several locations.
 * Priority: local copy first (for Vercel), then parent (for local dev).
 */
function findCurriculumPath(): string {
  const candidates = [
    path.join(process.cwd(), "curriculum.md"),
    path.join(process.cwd(), "..", "curriculum.md"),
    path.join(process.cwd(), "..", "..", "curriculum.md"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `curriculum.md not found. Searched:\n${candidates.join("\n")}`
  );
}

function readCurriculum(): string {
  return fs.readFileSync(findCurriculumPath(), "utf-8");
}

/**
 * Parse the curriculum markdown into structured data.
 *
 * The curriculum follows this structure:
 *   # Title
 *   ## Edition
 *   ## Phase I/II/III: Name (Weeks X-Y)
 *   ### WEEK N: Title
 *     **Subtitle:** ...
 *     **Objective:** ...
 *     **Topics:** (bullet list)
 *     **Activities:** (bullet list)
 *     **Deliverable:** ...
 *     **Skills:** ...
 *     #### Sub-sections (updates, exercises, references)
 *   ## Appendices
 *   ### Appendix X: Title
 *
 * Result is cached at module level — curriculum.md is 177KB and only
 * changes at deploy time, so there is no need to re-parse on every request.
 */
let _cache: CurriculumData | null = null;

export function parseCurriculum(): CurriculumData {
  if (_cache) return _cache;
  const raw = readCurriculum();
  const lines = raw.split("\n");

  const data: CurriculumData = {
    title: "",
    edition: "",
    duration: "12 Weeks",
    goal: "From zero coding knowledge to Claude Code expert",
    phases: [],
    appendices: [],
  };

  // Extract header info
  for (const line of lines.slice(0, 10)) {
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      data.title = line.replace("# ", "").trim();
    }
    if (line.startsWith("## ") && line.includes("Edition")) {
      data.edition = line.replace("## ", "").trim();
    }
    if (line.startsWith("**Duration:**")) {
      data.duration = line.replace("**Duration:**", "").trim();
    }
    if (line.startsWith("**Goal:**")) {
      data.goal = line.replace("**Goal:**", "").trim();
    }
  }

  // Split content into major sections by ## headers
  const sections = splitByH2(raw);

  // Map phase names
  const phaseMap: Record<number, { name: string; weekRange: string }> = {
    1: { name: "Foundation", weekRange: "Weeks 1–3" },
    2: { name: "Building", weekRange: "Weeks 4–8" },
    3: { name: "Mastery", weekRange: "Weeks 9–12" },
  };

  // Parse phases and weeks
  for (const section of sections) {
    const phaseMatch = section.match(
      /^## Phase (I{1,3}|IV|V):\s*(.+?)(?:\s*\((.+?)\))?\s*$/m
    );
    if (phaseMatch) {
      const romanToNum: Record<string, number> = {
        I: 1,
        II: 2,
        III: 3,
      };
      const phaseNum = romanToNum[phaseMatch[1]] || 1;
      const info = phaseMap[phaseNum] || {
        name: phaseMatch[2],
        weekRange: phaseMatch[3] || "",
      };

      const weeks = parseWeeksFromSection(section, phaseNum, info.name);
      data.phases.push({
        number: phaseNum,
        name: info.name,
        weekRange: info.weekRange,
        weeks,
      });
    }

    // Parse appendices
    if (section.match(/^## Appendices/m)) {
      data.appendices = parseAppendices(section);
    }
  }

  _cache = data;
  return _cache;
}

function splitByH2(content: string): string[] {
  const sections: string[] = [];
  const lines = content.split("\n");
  let current: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Track fenced code blocks so we don't split on ## inside them
    if (line.match(/^```/)) {
      inCodeBlock = !inCodeBlock;
    }
    if (!inCodeBlock && line.match(/^## /) && current.length > 0) {
      sections.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) {
    sections.push(current.join("\n"));
  }
  return sections;
}

function parseWeeksFromSection(
  section: string,
  phaseNum: number,
  phaseName: string
): Week[] {
  const weeks: Week[] = [];
  const weekBlocks = section.split(/(?=^### WEEK \d+:)/m);

  for (const block of weekBlocks) {
    const weekMatch = block.match(/^### WEEK (\d+):\s*(.+)$/m);
    if (!weekMatch) continue;

    const weekNum = parseInt(weekMatch[1], 10);
    const title = weekMatch[2].trim();

    const week: Week = {
      number: weekNum,
      title,
      subtitle: extractField(block, "Subtitle"),
      objective: extractField(block, "Objective"),
      phase: phaseNum,
      phaseName,
      topics: extractList(block, "Topics"),
      activities: extractList(block, "Activities"),
      deliverable: extractField(block, "Deliverable"),
      skills: extractField(block, "Skills"),
      content: extractContentAfterCore(block),
    };

    weeks.push(week);
  }

  return weeks;
}

function extractField(block: string, field: string): string {
  const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, "i");
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

function extractList(block: string, field: string): string[] {
  const lines = block.split("\n");
  const items: string[] = [];
  let capturing = false;

  for (const line of lines) {
    if (line.match(new RegExp(`^\\*\\*${field}:\\*\\*`, "i"))) {
      capturing = true;
      continue;
    }
    if (capturing) {
      if (line.match(/^- /)) {
        items.push(line.replace(/^- /, "").trim());
      } else if (line.trim() === "" || line.match(/^\*\*/)) {
        capturing = false;
      }
    }
  }
  return items;
}

function extractContentAfterCore(block: string): string {
  // Everything after **Skills:** line and any remaining content
  const lines = block.split("\n");
  let afterSkills = false;
  const contentLines: string[] = [];

  for (const line of lines) {
    if (afterSkills) {
      contentLines.push(line);
    }
    if (line.match(/^\*\*Skills:\*\*/)) {
      afterSkills = true;
    }
  }

  return contentLines.join("\n").trim();
}

function parseAppendices(section: string): Appendix[] {
  const appendices: Appendix[] = [];
  const blocks = section.split(/(?=^### Appendix [A-Z]:)/m);

  for (const block of blocks) {
    const match = block.match(/^### Appendix ([A-Z]):\s*(.+)$/m);
    if (!match) continue;

    // Get everything after the header line
    const headerEnd = block.indexOf("\n");
    const content = headerEnd > -1 ? block.slice(headerEnd + 1).trim() : "";

    appendices.push({
      letter: match[1],
      title: match[2].trim(),
      content,
    });
  }

  return appendices;
}

// --- Public helpers ---

export function getAllWeeks(): Week[] {
  const data = parseCurriculum();
  return data.phases.flatMap((p) => p.weeks);
}

export function getWeek(number: number): Week | undefined {
  return getAllWeeks().find((w) => w.number === number);
}

export function getAllAppendices(): Appendix[] {
  return parseCurriculum().appendices;
}

export function getAppendix(letter: string): Appendix | undefined {
  return getAllAppendices().find(
    (a) => a.letter.toLowerCase() === letter.toLowerCase()
  );
}
