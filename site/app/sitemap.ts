import type { MetadataRoute } from "next";
import { getAllWeeks, getAllAppendices } from "@/lib/parse-curriculum";
import { getNewsletterIssues } from "@/lib/newsletter";

const BASE_URL = "https://agentcodeacademy.com";

// Static dates based on content milestones — avoids identical dynamic timestamps
// that search engines learn to ignore. Update these when content actually changes.
const CONTENT_DATES = {
  homepage: "2026-03-13",
  pricing: "2026-03-01",
  newsletter: "2026-03-10",
  // Phase 1 launched first, Phase 2/3 followed
  weekLaunch: (week: number) => {
    if (week <= 4) return "2026-02-01";
    if (week <= 8) return "2026-02-15";
    return "2026-03-01";
  },
  appendix: "2026-02-15",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const weeks = getAllWeeks();
  const appendices = getAllAppendices();
  const newsletterIssues = getNewsletterIssues();

  const weekPages = weeks.map((week) => ({
    url: `${BASE_URL}/week/${week.number}`,
    lastModified: new Date(CONTENT_DATES.weekLaunch(week.number)),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const appendixPages = appendices.map((appendix) => ({
    url: `${BASE_URL}/appendix/${appendix.letter.toLowerCase()}`,
    lastModified: new Date(CONTENT_DATES.appendix),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsletterPages = newsletterIssues.map((issue) => ({
    url: `${BASE_URL}/newsletter/${issue.number}`,
    lastModified: new Date(CONTENT_DATES.newsletter),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(CONTENT_DATES.homepage),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(CONTENT_DATES.pricing),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(CONTENT_DATES.homepage),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date(CONTENT_DATES.newsletter),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...weekPages,
    ...appendixPages,
    ...newsletterPages,
  ];
}
