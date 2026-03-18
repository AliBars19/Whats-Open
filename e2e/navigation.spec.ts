import { test, expect } from "@playwright/test";

test.describe("Navigation & Routing", () => {
  test("/ returns 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("/login returns 200", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
  });

  test("/signup returns 200", async ({ page }) => {
    const response = await page.goto("/signup");
    expect(response?.status()).toBe(200);
  });

  test("non-existent page returns 404", async ({ page }) => {
    const response = await page.goto("/this-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("PWA manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.name).toBe("Where's Open?");
    expect(manifest.start_url).toBe("/map");
    expect(manifest.display).toBe("standalone");
  });

  test("API cron endpoint rejects unauthorized requests", async ({ request }) => {
    const response = await request.get("/api/cron/cleanup");
    expect(response.status()).toBe(401);
  });
});
