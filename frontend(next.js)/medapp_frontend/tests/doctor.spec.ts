import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const doctorEmail = process.env.E2E_DOCTOR_EMAIL;
const doctorPassword = process.env.E2E_DOCTOR_PASSWORD;

if (!doctorEmail || !doctorPassword) {
  throw new Error(
    "Missing E2E_DOCTOR_EMAIL or E2E_DOCTOR_PASSWORD environment variables",
  );
}

test.describe("Doctor actions", () => {
  test.beforeEach(async ({ page }) => {
    if (!doctorEmail || !doctorPassword) {
      throw new Error("Missing EMAIL or PASSWORD .");
    }
    await login(page, doctorEmail, doctorPassword);
    await expect(page).toHaveURL(/\/doctor/, { timeout: 10000 });
  });

  test.afterEach(async ({ page }) => {
    const logoutButton = page.getByRole("button", { name: /logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("doctor can access their dashboard", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });

  test("doctor can view their profile", async ({ page }) => {
    await page.locator("aside > div").first().click();
    await expect(
      page.getByRole("heading", { name: /^profile$/i }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toHaveValue(doctorEmail);
  });

  test("doctor can update their profile", async ({ page }) => {
    await page.locator("aside > div").first().click();
    await page.getByRole("button", { name: /^edit$/i }).click();

    await page
      .locator('textarea[name="bio"]')
      .fill("Updated doctor profile for E2E testing");

    await page.getByRole("button", { name: /save|update/i }).click();

    await expect(page.getByText(/updated|success/i).first()).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /^profile$/i }),
    ).toBeVisible();
    await expect(page.locator('textarea[name="bio"]')).toHaveValue(
      "Updated doctor profile for E2E testing",
    );
  });

  test("doctor can view their schedule", async ({ page }) => {
    await page.getByRole("button", { name: /^schedule$/i }).click();

    await expect(
      page.getByRole("heading", { name: /schedule/i }),
    ).toBeVisible();
  });
  /** 
  test("doctor can create a schedule", async ({ page }) => {
    await page.getByRole("link", { name: /schedule/i }).click();

    // Adapt these locators to your actual schedule form.
    await page.getByLabel(/day/i).selectOption("MONDAY");
    await page.getByLabel(/start time/i).fill("09:00");
    await page.getByLabel(/end time/i).fill("17:00");

    await page.getByRole("button", { name: /save|add|create/i }).click();

    await expect(
      page.getByText(/schedule.*created|created.*schedule|success/i)
    ).toBeVisible();
  });
**/
  test("doctor can view their appointments", async ({ page }) => {
    await page.getByRole("button", { name: /^appointments$/i }).click();

    await expect(
      page.getByRole("heading", { name: /appointments page/i }),
    ).toBeVisible();
  });

  test("doctor can view appointment details", async ({ page }) => {
    await page.getByRole("button", { name: /^appointments$/i }).click();

    // This assumes the E2E database contains an appointment
    // assigned to this doctor.
    await page
      .getByRole("button", { name: /view details/i })
      .first()
      .click();

    await expect(
      page.getByRole("heading", { name: /appointment details/i }),
    ).toBeVisible();
  });
});
