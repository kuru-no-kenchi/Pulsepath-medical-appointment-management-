import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

const doctorEmail = process.env.E2E_DOCTOR_EMAIL;

const assistantEmail = process.env.E2E_ASSISTANT_EMAIL;

if (!adminEmail || !adminPassword) {
  throw new Error("Missing Credentials");
}

test.describe("Admin user management", () => {
  test.beforeEach(async ({ page }) => {
    if (!adminEmail || !adminPassword) {
      throw new Error("Missing EMAIL or PASSWORD .");
    }
    await login(page, adminEmail, adminPassword);
    await expect(page).toHaveURL(/\/admin/, { timeout: 50000 });
  });
  test.afterEach(async ({ page }) => {
    const logoutButton = page.getByRole("button", { name: /logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("admin can create a doctor", async ({ page }) => {
    if (!doctorEmail) {
      throw new Error("Missing Credentials");
    }
    const uniqueId = Date.now();
    const phone = `06${String(uniqueId).slice(-8)}`;
    await page.getByRole("button", { name: "Doctors" }).click();
    await page.getByRole("button", { name: "Add Doctor" }).click();
    await page.getByLabel("First Name").fill("etoe");
    await page.getByLabel("Last Name").fill("Doctor");
    await page.getByLabel("Email").fill(doctorEmail);
    await page.getByLabel("Phone").fill(phone);
    await page.getByLabel("Specialty").fill("Cardiology");
    await page.getByLabel("Experience (Years)").fill("5");
    await page.getByLabel("Consultation Duration").fill("60");
    await page.getByLabel("Biography").fill("Doctor created for E2E testing.");
    await page.getByRole("button", { name: "Create Doctor" }).click();
    await expect(
      page.getByText(/doctor|created|successfully/i).first(),
    ).toBeVisible();
  });

  test("admin can create an assistant", async ({ page }) => {
    if (!assistantEmail) {
      throw new Error("Missing Credentials");
    }
    const uniqueId = Date.now();
    const phone = `06${String(uniqueId).slice(-8)}`;
    await page.getByRole("button", { name: "Assistants" }).click();
    await page.getByRole("button", { name: "Add Assistant" }).click();
    await page.getByLabel("First Name").fill("ETOE");
    await page.getByLabel("Last Name").fill("Assistant");
    await page.getByLabel("Email").fill(assistantEmail);
    await page.getByLabel("Phone").fill(phone);
    await page.getByRole("button", { name: "Create Assistant" }).click();
    await expect(
      page.getByText(/assistant|created|successfully/i).first(),
    ).toBeVisible();
  });

  test("admin can assign an assistant to a doctor", async ({ page }) => {
    if (!assistantEmail) {
      throw new Error("Missing E2E_ASSISTANT_EMAIL");
    }

    await page.getByRole("button", { name: "Assistants" }).click();
    await page.getByPlaceholder("Search assistants...").fill(assistantEmail);

    const assistantRow = page
      .getByRole("row")
      .filter({ hasText: assistantEmail });
    await expect(assistantRow).toBeVisible();
    await assistantRow.getByRole("button", { name: "View Details" }).click();

    await expect(
      page.getByRole("heading", { name: "Assistant Details" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Edit" }).click();

    const doctorCheckbox = page
      .getByRole("checkbox", { name: "Select this row" })
      .first();
    await expect(doctorCheckbox).toBeVisible();
    await doctorCheckbox.check();
    await page.getByRole("button", { name: /save assign/i }).click();
    await expect(
      page.getByText("Doctors assigned successfully", { exact: true }),
    ).toBeVisible();
    await expect(doctorCheckbox).toBeChecked();
  });
});
