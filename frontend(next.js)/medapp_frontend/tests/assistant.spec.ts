import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const assistantEmail = process.env.E2E_ASSISTANT_EMAIL;
const assistantPassword = process.env.E2E_ASSISTANT_PASSWORD;

test.describe("Assistant actions", () => {
  test.skip(
    !assistantEmail || !assistantPassword,
    "Set E2E_ASSISTANT_EMAIL and E2E_ASSISTANT_PASSWORD to run assistant tests",
  );
  test.beforeEach(async ({ page }) => {
    if (!assistantEmail || !assistantPassword) {
      test.skip();
      return;
    }
    await login(page, assistantEmail, assistantPassword);
    await expect(page).toHaveURL(/\/assistants/, { timeout: 30000 });
  });

  test.afterEach(async ({ page }) => {
    const logoutButton = page.getByRole("button", { name: /logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("assistant can access their dashboard", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });

  test("assistant can view their profile", async ({ page }) => {
    if (!assistantEmail || !assistantPassword) {
      test.skip();
      return;
    }
    await page.locator("aside > div").first().click();
    await expect(
      page.getByRole("heading", { name: /^profile$/i }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toHaveValue(
      assistantEmail,
    );
  });

  test("assistant can view appointments", async ({ page }) => {
    await page.getByRole("button", { name: /^Appointments$/i }).click();
    await expect(
      page.getByRole("heading", { name: /appointments page/i }),
    ).toBeVisible();
  });
  /*
  test("assistant can create an appointment", async ({ page }) => {
    await page.getByRole("button", { name: /^appointments$/i }).click();
    await page.getByRole("button", { name: "Add Appointment" }).click();
    await expect(
      page.getByRole("heading", { name: "Create Appointment" }),
    ).toBeVisible();
    await selectPatient(page);
    await selectDoctor(page);
    await page
      .locator('textarea[name="reason"]')
      .fill("Assistant E2E appointment");
    await selectAvailableTime(page);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Appointment created successfully.", { exact: true }),
    ).toBeVisible();
  });

  test("assistant can reschedule a confirmed appointment", async ({ page }) => {
    await page.getByRole("button", { name: /^appointments$/i }).click();

    // The E2E database must contain a confirmed appointment for this assistant.
    await page.getByRole("button", { name: "Reschedule" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Reschedule Appointment" }),
    ).toBeVisible();

    await selectAvailableTime(page);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Appointment rescheduled successfully.", { exact: true }),
    ).toBeVisible();
  }); */
});
