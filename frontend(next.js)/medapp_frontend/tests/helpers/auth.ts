import { Page } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/Email/i).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: /login/i }).click();
  await page.waitForURL(/\/loading\?role=/, { timeout: 15_000 });
}

export async function register(page:Page) {
    await page.goto("/register");
    await page.getByLabel("First Name").fill("etoe");
    await page.getByLabel("Last Name").fill("Patient");
    await page.getByLabel("Email").fill("patient.e2e@test.com");
    await page.getByLabel("Phone").fill("0612345678");
    await page.getByRole("textbox", { name: "Password" }).fill("Password123!");;
    await page.getByRole("button", { name: "Create Account" }).click();
}