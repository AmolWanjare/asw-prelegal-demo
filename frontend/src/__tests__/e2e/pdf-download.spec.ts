import { test, expect } from "@playwright/test";

test.describe("PDF Download", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nda");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  async function fillAndNavigateToPreview(page: import("@playwright/test").Page) {
    // Step 1
    await page.locator("select").selectOption("California");
    await page.locator('input[type="text"]').fill("courts in SF, CA");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 2
    const nameInputs = page.locator('input[type="text"]');
    await nameInputs.nth(0).fill("Test User");
    await nameInputs.nth(1).fill("CEO");
    await nameInputs.nth(2).fill("TestCorp");
    await nameInputs.nth(3).fill("test@testcorp.com");
    await nameInputs.nth(4).fill("Other User");
    await nameInputs.nth(5).fill("CTO");
    await nameInputs.nth(6).fill("OtherCorp");
    await nameInputs.nth(7).fill("other@othercorp.com");

    await page.getByRole("button", { name: /generate nda/i }).click();
    await expect(page).toHaveURL(/\/nda\/preview/);
  }

  test("download button is visible on preview page", async ({ page }) => {
    await fillAndNavigateToPreview(page);
    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeVisible();
  });

  test("clicking download triggers PDF generation", async ({ page }) => {
    test.setTimeout(60000);
    await fillAndNavigateToPreview(page);

    const downloadBtn = page.getByRole("button", { name: /download pdf/i });
    await expect(downloadBtn).toBeVisible();

    // Click and verify generating state
    await downloadBtn.click();
    await expect(
      page.getByRole("button", { name: /generating/i })
    ).toBeVisible({ timeout: 5000 });

    // Wait for generation to complete (button returns to Download PDF)
    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeVisible({ timeout: 45000 });
  });

  test("download button shows loading state", async ({ page }) => {
    await fillAndNavigateToPreview(page);

    // Click download and check for loading state
    await page.getByRole("button", { name: /download pdf/i }).click();

    // Should show generating state
    await expect(
      page.getByRole("button", { name: /generating/i })
    ).toBeVisible();
  });

  test("preview page renders all NDA sections", async ({ page }) => {
    await fillAndNavigateToPreview(page);

    // Check cover page sections
    await expect(page.getByText("Purpose").first()).toBeVisible();
    await expect(page.getByText("Effective Date").first()).toBeVisible();
    await expect(page.getByText("MNDA Term").first()).toBeVisible();
    await expect(page.getByText("Term of Confidentiality").first()).toBeVisible();
    await expect(page.getByText("Governing Law").first()).toBeVisible();

    // Check standard terms sections
    await expect(page.getByText("Standard Terms").first()).toBeVisible();
    await expect(page.getByText("1. Introduction.")).toBeVisible();
    await expect(
      page.getByText("2. Use and Protection of Confidential Information.")
    ).toBeVisible();
    await expect(page.getByText("11. General.")).toBeVisible();
  });

  test("preview shows user-entered values highlighted", async ({ page }) => {
    await fillAndNavigateToPreview(page);

    // The governing law should appear in the document body
    const californiaSpans = page.locator("span", {
      hasText: "California",
    });
    expect(await californiaSpans.count()).toBeGreaterThan(0);
  });

  test("preview redirects to /nda if no form data", async ({ page }) => {
    // Navigate directly to preview without filling the form
    await page.evaluate(() => sessionStorage.clear());
    await page.goto("/nda/preview");

    // Should redirect back to the form
    await expect(page).toHaveURL(/\/nda$/);
  });
});
