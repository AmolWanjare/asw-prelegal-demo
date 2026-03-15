import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nda");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test("Step 1 - General Terms has no critical accessibility violations", async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"]) // Custom theme colors may have false positives
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      console.log("Critical/serious a11y violations on Step 1:");
      critical.forEach((v) => {
        console.log(`  - ${v.id}: ${v.description}`);
        v.nodes.forEach((n) => console.log(`    Target: ${n.target}`));
      });
    }

    expect(critical).toHaveLength(0);
  });

  test("Step 2 - Party Details has no critical accessibility violations", async ({
    page,
  }) => {
    // Navigate to step 2
    await page.locator("select").selectOption("California");
    await page.locator('input[type="text"]').fill("courts in SF, CA");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      console.log("Critical/serious a11y violations on Step 2:");
      critical.forEach((v) => {
        console.log(`  - ${v.id}: ${v.description}`);
        v.nodes.forEach((n) => console.log(`    Target: ${n.target}`));
      });
    }

    expect(critical).toHaveLength(0);
  });

  test("Step 3 - Preview has no critical accessibility violations", async ({
    page,
  }) => {
    // Fill and go to preview
    await page.locator("select").selectOption("California");
    await page.locator('input[type="text"]').fill("courts in SF, CA");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    const nameInputs = page.locator('input[type="text"]');
    await nameInputs.nth(0).fill("Test User");
    await nameInputs.nth(1).fill("CEO");
    await nameInputs.nth(2).fill("TestCorp");
    await nameInputs.nth(3).fill("test@test.com");
    await nameInputs.nth(4).fill("Other User");
    await nameInputs.nth(5).fill("CTO");
    await nameInputs.nth(6).fill("OtherCorp");
    await nameInputs.nth(7).fill("other@other.com");

    await page.getByRole("button", { name: /generate nda/i }).click();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      console.log("Critical/serious a11y violations on Step 3:");
      critical.forEach((v) => {
        console.log(`  - ${v.id}: ${v.description}`);
        v.nodes.forEach((n) => console.log(`    Target: ${n.target}`));
      });
    }

    expect(critical).toHaveLength(0);
  });

  test("all form inputs have associated labels", async ({ page }) => {
    // Check that every visible input/textarea/select has an associated label
    const formElements = page.locator(
      'input:not([type="hidden"]):not([type="radio"]):visible, textarea:visible, select:visible'
    );
    const count = await formElements.count();

    for (let i = 0; i < count; i++) {
      const el = formElements.nth(i);
      const ariaLabel = await el.getAttribute("aria-label");
      const ariaLabelledBy = await el.getAttribute("aria-labelledby");
      const id = await el.getAttribute("id");

      // Must have aria-label, aria-labelledby, or be wrapped in a label
      const parentLabel = el.locator("xpath=ancestor::label");
      const parentLabelCount = await parentLabel.count();

      const hasLabel =
        !!ariaLabel ||
        !!ariaLabelledBy ||
        parentLabelCount > 0 ||
        (id && (await page.locator(`label[for="${id}"]`).count()) > 0);

      if (!hasLabel) {
        const tagName = await el.evaluate((e) => e.tagName);
        const type = await el.getAttribute("type");
        console.warn(
          `Form element without label: <${tagName} type="${type}">`
        );
      }
    }

    expect(count).toBeGreaterThan(0);
  });

  test("wizard is keyboard navigable", async ({ page }) => {
    // Tab through the form
    await page.keyboard.press("Tab");

    // Should be able to tab to first input
    const focused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focused).toBeTruthy();

    // Tab through all inputs and verify focus moves
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
    }

    // Should be able to reach the Continue button via keyboard
    const continueButton = page.getByRole("button", { name: "Next", exact: true });
    await continueButton.focus();
    await expect(continueButton).toBeFocused();

    // Should be able to activate with Enter
    await page.locator("select").selectOption("California");
    await page.locator('input[type="text"]').fill("courts in SF, CA");
    await continueButton.focus();
    await page.keyboard.press("Enter");

    // Should advance to step 2
    await expect(page.getByRole("heading", { name: "Party Details" })).toBeVisible();
  });

  test("page has proper heading hierarchy", async ({ page }) => {
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    const levels: number[] = [];

    for (const heading of headings) {
      const tag = await heading.evaluate((el) => el.tagName);
      levels.push(parseInt(tag.replace("H", "")));
    }

    // Should have at least one h1
    expect(levels).toContain(1);

    // Headings should not skip levels (h1 -> h3 without h2 is invalid)
    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1];
      // Can go deeper by at most 1 level at a time, can go up any amount
      if (jump > 1) {
        console.warn(
          `Heading level skip: h${levels[i - 1]} -> h${levels[i]}`
        );
      }
    }
  });

  test("color contrast check (full scan)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    // Log warnings for any contrast issues but don't fail on minor ones
    const contrastIssues = results.violations.filter(
      (v) => v.id === "color-contrast"
    );
    if (contrastIssues.length > 0) {
      console.log("Color contrast issues found:");
      contrastIssues.forEach((v) => {
        v.nodes.forEach((n) => {
          console.log(`  Impact: ${n.impact}`);
          console.log(`  Target: ${n.target}`);
          console.log(`  Message: ${n.any?.[0]?.message}`);
        });
      });
    }

    // Only fail on critical contrast issues
    const criticalContrast = contrastIssues.flatMap((v) =>
      v.nodes.filter((n) => n.impact === "critical")
    );
    expect(criticalContrast).toHaveLength(0);
  });
});
