import { test, expect } from "@playwright/test";

const externalLinks = [
  {
    name: "Anthropic Claude",
    url: "https://www.anthropic.com/claude",
  },
  {
    name: "Anthropic Console",
    url: "https://console.anthropic.com/",
  },
  {
    name: "Cursor IDE",
    url: "https://www.cursor.com/",
  },
  {
    name: "VS Code",
    url: "https://code.visualstudio.com/",
  },
  {
    name: "GitHub",
    url: "https://github.com/",
  },
  {
    name: "Vercel",
    url: "https://vercel.com/",
  },
];

test.describe("External Links", () => {
  for (const link of externalLinks) {
    test(`${link.name} (${link.url}) is reachable`, async ({ request }) => {
      const response = await request.get(link.url, {
        maxRedirects: 5,
        timeout: 30_000,
      });

      // Use soft assertion — one broken link shouldn't fail the whole suite
      expect.soft(
        response.status(),
        `${link.name} returned ${response.status()}`
      ).toBeLessThan(400);
    });
  }
});

test.describe("Internal Navigation Links", () => {
  test("homepage Start Learning links to week 1", async ({ page }) => {
    await page.goto("/");
    const startBtn = page.locator('a:text("Start Learning")');
    await expect(startBtn).toHaveAttribute("href", "/week/1");
  });

  test("homepage View Curriculum links to #curriculum", async ({ page }) => {
    await page.goto("/");
    const viewBtn = page.locator('a:text("View Curriculum")');
    await expect(viewBtn).toHaveAttribute("href", "#curriculum");
  });

  test("week page has prev/next navigation", async ({ page }) => {
    await page.goto("/week/6");

    // Use nav element to scope to the prev/next nav (not sidebar)
    const nav = page.locator("article nav");
    await expect(nav.getByText("Previous")).toBeVisible();
    await expect(nav.getByText("Next")).toBeVisible();
  });

  test("appendix page has prev/next navigation", async ({ page }) => {
    await page.goto("/appendix/c");

    // Use nav element to scope to the prev/next nav (not sidebar)
    const nav = page.locator("article nav");
    await expect(nav.getByText("Previous")).toBeVisible();
    await expect(nav.getByText("Next")).toBeVisible();
  });
});
