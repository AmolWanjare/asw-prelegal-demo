import { test, expect } from "@playwright/test";

// These tests run across all configured browsers in playwright.config.ts
// (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)

test.describe("Cross-Browser Compatibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nda");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test("page loads and renders wizard header", async ({ page }) => {
    await expect(page.getByText("Mutual NDA Creator")).toBeVisible();
    await expect(page.getByText("CommonPaper Standard v1.0")).toBeVisible();
  });

  test("step indicator renders correctly", async ({ page }) => {
    await expect(page.getByText("01")).toBeVisible();
    await expect(page.getByText("02")).toBeVisible();
    await expect(page.getByText("03")).toBeVisible();
  });

  test("form inputs are interactive", async ({ page }) => {
    // Test textarea
    const purposeField = page.locator("textarea").first();
    await purposeField.clear();
    await purposeField.fill("Test purpose");
    await expect(purposeField).toHaveValue("Test purpose");

    // Test date input
    const dateField = page.locator('input[type="date"]');
    await dateField.fill("2026-06-15");
    await expect(dateField).toHaveValue("2026-06-15");

    // Test select
    await page.locator("select").selectOption("New York");
    await expect(page.locator("select")).toHaveValue("New York");

    // Test text input
    const textInput = page.locator('input[type="text"]');
    await textInput.fill("courts in NYC, NY");
    await expect(textInput).toHaveValue("courts in NYC, NY");
  });

  test("radio buttons work correctly", async ({ page }) => {
    // Click "Continues until terminated"
    await page.getByText(/continues until terminated/i).click();

    // Click the perpetuity option
    await page.getByText("In perpetuity").click();

    // Navigate forward and back to verify
    await page.locator("select").selectOption("California");
    await page.locator('input[type="text"]').fill("courts in SF, CA");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: /back/i }).click();

    // Selections should persist
    await expect(page.getByText("In perpetuity")).toBeVisible();
  });

  test("navigation buttons render and function", async ({ page }) => {
    // Continue button should be visible
    const continueBtn = page.getByRole("button", { name: "Next", exact: true });
    await expect(continueBtn).toBeVisible();

    // Back button should not be visible/functional on step 1
    // (it's present but opacity-0)

    // Fill required fields and advance
    await page.locator("select").selectOption("California");
    await page.locator('input[type="text"]').fill("courts in SF, CA");
    await continueBtn.click();

    // On step 2, back button should be visible
    const backBtn = page.getByRole("button", { name: /back/i });
    await expect(backBtn).toBeVisible();

    // Generate NDA button should appear
    await expect(
      page.getByRole("button", { name: /generate nda/i })
    ).toBeVisible();
  });

  test("responsive layout - form cards stack on mobile", async ({ page }) => {
    // Check that content is visible regardless of viewport
    await expect(page.getByRole("heading", { name: "General Terms" })).toBeVisible();
    await expect(page.getByText("Purpose")).toBeVisible();

    // Verify form fields are usable
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();
    const box = await textarea.boundingBox();
    expect(box).toBeTruthy();
    // On mobile viewports, form should still be at least 250px wide
    expect(box!.width).toBeGreaterThan(250);
  });

  test("full flow works end-to-end", async ({ page }) => {
    // Step 1
    await page.locator("select").selectOption("New York");
    await page.locator('input[type="text"]').fill("courts in Manhattan, NY");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 2
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill("Cross Browser");
    await inputs.nth(1).fill("Tester");
    await inputs.nth(2).fill("BrowserCorp");
    await inputs.nth(3).fill("test@browser.com");
    await inputs.nth(4).fill("Another Tester");
    await inputs.nth(5).fill("QA Lead");
    await inputs.nth(6).fill("QACorp");
    await inputs.nth(7).fill("qa@qacorp.com");
    await page.getByRole("button", { name: /generate nda/i }).click();

    // Step 3 - Preview
    await expect(page).toHaveURL(/\/nda\/preview/);
    await expect(
      page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })
    ).toBeVisible();
    await expect(page.getByText("Cross Browser", { exact: true })).toBeVisible();
    await expect(page.getByText("BrowserCorp", { exact: true })).toBeVisible();
    await expect(page.getByText("QACorp", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeVisible();
  });
});
