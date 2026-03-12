import { test, expect } from "@playwright/test";

test.describe("SEO: Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Agent Code Academy/);
  });

  test("has meta description", async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /.+/);
  });

  test("has Open Graph title", async ({ page }) => {
    const og = page.locator('meta[property="og:title"]');
    await expect(og).toHaveAttribute("content", /Agent Code Academy/);
  });

  test("has Open Graph description", async ({ page }) => {
    const og = page.locator('meta[property="og:description"]');
    await expect(og).toHaveAttribute("content", /.+/);
  });

  test("has Open Graph URL", async ({ page }) => {
    const og = page.locator('meta[property="og:url"]');
    await expect(og).toHaveAttribute("content", /agentcodeacademy\.com/);
  });

  test("has Twitter card meta", async ({ page }) => {
    const card = page.locator('meta[name="twitter:card"]');
    await expect(card).toHaveAttribute("content", /.+/);
  });

  test("has canonical URL", async ({ page }) => {
    const link = page.locator('link[rel="canonical"]');
    await expect(link).toHaveAttribute("href", /agentcodeacademy\.com/);
  });

  test("has JSON-LD Course schema", async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const content = await jsonLd.textContent();
    expect(content).toBeTruthy();
    const data = JSON.parse(content!);
    expect(data["@type"]).toBe("Course");
    expect(data.name).toContain("Agent Code Academy");
    expect(data.isAccessibleForFree).toBe(true);
    expect(Array.isArray(data.hasCourseInstance)).toBe(true);
    expect(data.hasCourseInstance).toHaveLength(2);
    expect(data.hasCourseInstance[0].offers.price).toBe("0");
    expect(data.hasCourseInstance[1].offers.price).toBe("49");
  });
});

test.describe("SEO: Week Page (Week 1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/week/1");
  });

  test("has unique title with week number", async ({ page }) => {
    await expect(page).toHaveTitle(/Week 1.*Agent Code Academy/);
  });

  test("has meta description", async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /.+/);
  });

  test("has canonical URL for week 1", async ({ page }) => {
    const link = page.locator('link[rel="canonical"]');
    await expect(link).toHaveAttribute(
      "href",
      /agentcodeacademy\.com\/week\/1/
    );
  });

  test("has Open Graph tags", async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Week 1/);
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute("content", /\/week\/1/);
  });
});

test.describe("SEO: Appendix Page (Appendix A)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/appendix/a");
  });

  test("has unique title with appendix letter", async ({ page }) => {
    await expect(page).toHaveTitle(/Appendix A.*Agent Code Academy/);
  });

  test("has canonical URL for appendix a", async ({ page }) => {
    const link = page.locator('link[rel="canonical"]');
    await expect(link).toHaveAttribute(
      "href",
      /agentcodeacademy\.com\/appendix\/a/
    );
  });
});

test.describe("SEO: Sitemap", () => {
  test("sitemap.xml contains all expected URLs", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const content = await page.content();

    // Homepage
    expect(content).toContain("agentcodeacademy.com");

    // All 12 weeks
    for (let i = 1; i <= 12; i++) {
      expect(content).toContain(`/week/${i}`);
    }

    // All 10 appendices
    for (const letter of ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]) {
      expect(content).toContain(`/appendix/${letter}`);
    }

    // noindex pages must NOT appear in sitemap
    expect(content).not.toContain("/profile");
    expect(content).not.toContain("/certificate");
    expect(content).not.toContain("/payment/success");
  });
});

test.describe("SEO: Robots.txt", () => {
  test("robots.txt references sitemap", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await page.locator("body").textContent();
    expect(text).toContain("sitemap");
  });
});

test.describe("SEO: No Duplicate Titles", () => {
  test("week pages have unique titles", async ({ page }) => {
    // This test navigates to 12 pages sequentially — give it extra time
    test.setTimeout(120_000);
    const titles: string[] = [];
    for (let i = 1; i <= 12; i++) {
      await page.goto(`/week/${i}`, { waitUntil: "domcontentloaded" });
      titles.push(await page.title());
    }
    const unique = new Set(titles);
    expect(unique.size).toBe(12);
  });
});
