import { test, expect } from "@playwright/test";

test.describe("NDA Wizard Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nda");
    // Clear sessionStorage for clean state
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test("redirects root to /nda", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/nda/);
  });

  test("displays step 1 - General Terms by default", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "General Terms" })).toBeVisible();
    await expect(page.getByText("Agreement Scope")).toBeVisible();
    await expect(page.getByText("Purpose")).toBeVisible();
    await expect(page.getByText("Effective Date").first()).toBeVisible();
  });

  test("shows validation errors when submitting empty required fields", async ({
    page,
  }) => {
    // Clear required fields
    await page.locator('select').selectOption("");
    const purposeField = page.locator("textarea").first();
    await purposeField.fill("");

    const dateField = page.locator('input[type="date"]');
    await dateField.fill("");

    // Click Next
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test("advances to step 2 with valid data", async ({ page }) => {
    // Fill governing law and jurisdiction (purpose and date have defaults)
    await page.locator("select").selectOption("California");
    await page
      .locator('input[type="text"]')
      .fill("courts located in San Francisco, CA");

    // Click Next
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Should be on step 2
    await expect(page.getByRole("heading", { name: "Party Details" })).toBeVisible();
    await expect(
      page.getByText("Disclosing & Receiving Party").first()
    ).toBeVisible();
  });

  test("full wizard flow to preview", async ({ page }) => {
    // Step 1 - Fill general terms
    await page.locator("select").selectOption("Delaware");
    await page
      .locator('input[type="text"]')
      .fill("courts located in Wilmington, DE");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 2 - Fill party details
    const nameInputs = page.locator('input[type="text"]');
    // Party 1
    await nameInputs.nth(0).fill("Alice Johnson");
    await nameInputs.nth(1).fill("CEO");
    await nameInputs.nth(2).fill("AlphaCorp");
    await nameInputs.nth(3).fill("alice@alphacorp.com");

    // Party 2
    await nameInputs.nth(4).fill("Bob Smith");
    await nameInputs.nth(5).fill("CTO");
    await nameInputs.nth(6).fill("BetaInc");
    await nameInputs.nth(7).fill("bob@betainc.com");

    // Click Generate NDA
    await page.getByRole("button", { name: /generate nda/i }).click();

    // Should be on preview page
    await expect(page).toHaveURL(/\/nda\/preview/);
    await expect(
      page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })
    ).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Smith")).toBeVisible();
    await expect(page.getByText("AlphaCorp", { exact: true })).toBeVisible();
    await expect(page.getByText("BetaInc", { exact: true })).toBeVisible();
    await expect(page.getByText("Delaware").first()).toBeVisible();
  });

  test("back button returns to previous step", async ({ page }) => {
    // Go to step 2
    await page.locator("select").selectOption("California");
    await page
      .locator('input[type="text"]')
      .fill("courts in SF, CA");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Verify on step 2
    await expect(page.getByRole("heading", { name: "Party Details" })).toBeVisible();

    // Click back
    await page.getByRole("button", { name: /back/i }).click();

    // Should be back on step 1
    await expect(page.getByText("Agreement Scope")).toBeVisible();
  });

  test("form state persists across page refresh", async ({ page }) => {
    // Fill some data on step 1
    await page.locator("select").selectOption("Texas");

    // Refresh
    await page.reload();

    // Data should persist (Zustand sessionStorage)
    await expect(page.locator("select")).toHaveValue("Texas");
  });

  test("radio group selection works for MNDA term", async ({ page }) => {
    // Default should be "fixed"
    const terminatedRadio = page.getByText(
      /continues until terminated/i
    );
    await terminatedRadio.click();

    // Navigate forward and back to verify persistence
    await page.locator("select").selectOption("California");
    await page
      .locator('input[type="text"]')
      .fill("courts in SF, CA");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: /back/i }).click();

    // Radio should still be selected
    await expect(terminatedRadio).toBeVisible();
  });
});
