import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

const doctorEmail = process.env.E2E_DOCTOR_EMAIL;
const doctorPassword = process.env.E2E_DOCTOR_PASSWORD;

test("invalid credentials are rejected", async ({ page }) => {
  if (!doctorEmail || !doctorPassword) {
    throw new Error("Missing EMAIL or PASSWORD .");
  }
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(doctorEmail);
  await page
    .getByRole("textbox", { name: "Password" })
    .fill("WrongPassword123!");

  await page.getByRole("button", { name: /login/i }).click();

  await expect(page).toHaveURL(/\/login/);

  // Adjust this locator to your actual error/toast.
  await expect(
    page.getByText(/invalid|incorrect|credentials|password/i).first(),
  ).toBeVisible();
});

test("unauthenticated user cannot access dashboard", async ({ page }) => {
  const response = await page.goto("/dashboard");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/dashboard/);
});

test("user can logout", async ({ page }) => {
  if (!adminEmail || !adminPassword) {
    throw new Error("Missing EMAIL or PASSWORD .");
  }
  await login(page, adminEmail, adminPassword);

  await page.getByRole("button", { name: /logout/i }).click();

  await expect(page).toHaveURL(/\/login/);

  const response = await page.goto("/dashboard");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/dashboard/);
});
