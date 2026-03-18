import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("shows hero section with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("It's 11pm.")).toBeVisible();
    await expect(page.getByText("Where can you actually go?")).toBeVisible();
  });

  test("shows feature highlights", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Real-time map")).toBeVisible();
    await expect(page.getByText("Crowdsourced verification")).toBeVisible();
    await expect(page.getByText("Built for late nights")).toBeVisible();
  });

  test("has Get Started and Log In buttons", async ({ page }) => {
    await page.goto("/");
    const getStarted = page.getByRole("link", { name: "Get Started" });
    const logIn = page.getByRole("link", { name: "Log In" });
    await expect(getStarted).toBeVisible();
    await expect(logIn).toBeVisible();
  });

  test("Get Started links to signup", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("Log In links to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows footer with copyright", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Where's Open?", { exact: false })).toBeVisible();
  });
});
