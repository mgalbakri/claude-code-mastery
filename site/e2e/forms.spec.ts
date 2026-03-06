import { test, expect } from "@playwright/test";

test.describe("Forms: Homepage Email Signup", () => {
  test("Stay Updated form has email input and submit button", async ({
    page,
  }) => {
    await page.goto("/");

    // Scroll to the email signup section
    const section = page.locator("text=Stay Updated").first();
    await section.scrollIntoViewIfNeeded();

    // Find the form near "Stay Updated"
    const emailInput = page
      .locator('input[type="email"][placeholder*="example"]')
      .last();
    await expect(emailInput).toBeVisible();

    const submitBtn = page.locator('button:text("Subscribe")').last();
    await expect(submitBtn).toBeVisible();
  });

  test("inline CTA appears between phases", async ({ page }) => {
    await page.goto("/");

    // Check for inline CTAs
    const cta1 = page.locator("text=Enjoying the foundations").first();
    await cta1.scrollIntoViewIfNeeded();
    await expect(cta1).toBeVisible();

    const cta2 = page.locator("text=Ready for advanced topics").first();
    await cta2.scrollIntoViewIfNeeded();
    await expect(cta2).toBeVisible();
  });

  test("form submission shows success (mocked)", async ({ page }) => {
    // Mock subscribe API endpoint to return success
    await page.route("**/api/subscribe", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/");

    // Find the main email signup form (last one = footer section)
    const emailInput = page
      .locator('input[type="email"][placeholder*="example"]')
      .last();
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill("test@example.com");

    const submitBtn = page.locator('button:text("Subscribe")').last();
    await submitBtn.click();

    // Should show success message: "You're on the list!"
    await expect(
      page.locator("text=on the list")
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Forms: Week Page Email Banner", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure banner shows
    await page.goto("/week/1");
    await page.evaluate(() => {
      localStorage.removeItem("ccm-email-banner-dismissed");
      localStorage.removeItem("ccm-email-subscribed");
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("email banner is visible on week page", async ({ page }) => {
    const banner = page
      .locator("text=Free AI Coding Cheat Sheet + lesson updates")
      .first();
    await expect(banner).toBeVisible();

    const emailInput = page
      .locator('input[type="email"][placeholder*="example"]')
      .first();
    await expect(emailInput).toBeVisible();
  });

  test("email banner can be dismissed", async ({ page }) => {
    // The dismiss button has aria-label="Dismiss"
    const dismissBtn = page.locator('button[aria-label="Dismiss"]');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();

    // Banner should disappear
    await expect(
      page.locator("text=Get notified when new lessons drop").first()
    ).not.toBeVisible({ timeout: 3000 });
  });

  test("banner stays hidden after dismissal on reload", async ({ page }) => {
    // Dismiss the banner
    const dismissBtn = page.locator('button[aria-label="Dismiss"]');
    await dismissBtn.click();

    // Wait for it to disappear
    await expect(
      page.locator("text=Get notified when new lessons drop").first()
    ).not.toBeVisible({ timeout: 3000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Banner should still be hidden (localStorage remembers)
    await expect(
      page.locator("text=Get notified when new lessons drop").first()
    ).not.toBeVisible();
  });
});
