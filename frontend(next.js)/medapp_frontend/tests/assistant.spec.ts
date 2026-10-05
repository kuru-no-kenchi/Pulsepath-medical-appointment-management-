import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { login } from "./helpers/auth";

const assistantEmail = process.env.E2E_ASSISTANT_EMAIL;
const assistantPassword = process.env.E2E_ASSISTANT_PASSWORD;

if (!assistantEmail || !assistantPassword) {
  throw new Error("Missing E2E_ASSISTANT_EMAIL, E2E_ASSISTANT_PASSWORD");
}

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function selectDoctor(page: Page) {
  await page.getByRole("button", { name: "Select doctor" }).click();
  await page
    .getByRole("option", { name: "Dr. Etoe Doctor", exact: true })
    .click();
}

async function selectPatient(page: Page) {
  await page.getByRole("button", { name: "Select patient" }).click();
  await page
    .getByRole("option", { name: "Etoe Patient", exact: true })
    .click();
}

async function selectAvailableTime(page: Page) {
  const dateInput = page.getByLabel("Select date");
  const noSlots = page.getByText("No available times for this date.", {
    exact: true,
  });
  const firstSlot = page
    .locator(".space-y-3 button")
    .filter({ hasText: /^\d{2}:\d{2}$/ })
    .first();

  for (let daysAhead = 1; daysAhead <= 14; daysAhead += 1) {
    await dateInput.fill(dateAfter(daysAhead));
    await expect(firstSlot.or(noSlots)).toBeVisible({ timeout: 10000 });

    if (await firstSlot.isVisible()) {
      await firstSlot.click();
      return;
    }
  }

  throw new Error("No available appointment times found in the next 14 days");
}

test.describe("Assistant actions", () => {
  test.beforeEach(async ({ page }) => {
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
