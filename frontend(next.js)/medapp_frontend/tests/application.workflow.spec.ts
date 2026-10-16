import { test, expect, Page } from "@playwright/test";
import { login } from "./helpers/auth";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const assistantEmail = process.env.E2E_ASSISTANT_EMAIL;
const assistantPassword = process.env.E2E_ASSISTANT_PASSWORD;
const letters = "abcdefghijklmnopqrstuvwxyz";
const daysOfWeek = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function generateRandomName(length = 8) {
  return Array.from(
    { length },
    () => letters[Math.floor(Math.random() * letters.length)],
  ).join("");
}

function generatePhoneNumber() {
  return `06${String(Date.now() + Math.floor(Math.random() * 1000)).slice(-8)}`;
}

function localDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function createScheduleAndChooseDate(
  page: Page,
  doctorId: string,
  token: string,
) {
  for (let days = 1; days <= 14; days += 1) {
    const date = localDateAfter(days);
    const weekday = daysOfWeek[new Date(`${date}T00:00:00`).getDay()];
    const response = await page.request.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/assistant/schedule/create`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          doctorId,
          dayOfWeek: weekday,
          startTime: "08:00",
          endTime: "18:00",
        },
      },
    );

    if (response.ok()) return date;

    const responseBody = await response.text();
    if (!responseBody.includes("Schedule overlaps with existing period")) {
      throw new Error(
        `Unable to create doctor schedule (${response.status()}): ${responseBody}`,
      );
    }
  }

  throw new Error(
    "Could not find a weekday for a non-overlapping doctor schedule.",
  );
}

async function selectAvailableAppointmentTime(page: Page, date: string) {
  const availabilityResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname.includes("/availability/") &&
      url.searchParams.get("date") === date
    );
  });

  await page.locator("#appointment-date").fill(date);
  const availabilityResponse = await availabilityResponsePromise;
  expect(availabilityResponse.ok()).toBeTruthy();

  const slots: string[] = await availabilityResponse.json();
  expect(slots.length).toBeGreaterThan(0);
  const slot = slots[Math.floor(Math.random() * slots.length)].slice(0, 5);
  await page.getByRole("button", { name: slot, exact: true }).click();
  const timeInput = page.locator('input[type="time"]');
  await expect(timeInput).toHaveValue(new RegExp(`^${slot}(?::00)?$`));
  return slot;
}

test.describe("Admin workflows", () => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD",
  );

  test.beforeEach(async ({ page }) => {
    if (!adminEmail || !adminPassword) return;
    await login(page, adminEmail, adminPassword);
    await expect(page).toHaveURL(/\/admin/, { timeout: 40_000 });
    await expect(
      page.getByRole("heading", { name: /dashboard/i }).first(),
    ).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    const logoutButton = page.getByRole("button", { name: /logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("admin can create a doctor", async ({ page }) => {
    const uniqueId = `${Date.now()}.${generateRandomName(6)}`;
    const firstName = generateRandomName();
    const lastName = generateRandomName();

    expect(firstName).toMatch(/^[a-z]+$/i);
    expect(lastName).toMatch(/^[a-z]+$/i);

    await page.getByRole("button", { name: "Doctors" }).click();
    await page.getByRole("button", { name: "Add Doctor" }).click();
    await page.getByLabel("First Name").fill(firstName);
    await page.getByLabel("Last Name").fill(lastName);
    await page
      .getByLabel("Email")
      .fill(`doctor.workflow.${uniqueId}@example.test`);
    await page.getByLabel("Phone").fill(generatePhoneNumber());
    await page.getByLabel("Specialty").fill("Cardiology");
    await page.getByLabel("Experience (Years)").fill("5");
    await page.getByRole("button", { name: "30 minutes" }).click();
    await page.getByRole("option", { name: "60 minutes" }).click();
    await page
      .getByLabel("Biography")
      .fill("Doctor created for the E2E workflow test.");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/admin/create/doctor") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Create Doctor" }).click();
    expect((await responsePromise).ok()).toBeTruthy();
  });

  test("admin can create an assistant", async ({ page }) => {
    const uniqueId = `${Date.now()}.${generateRandomName(6)}`;
    const firstName = generateRandomName();
    const lastName = generateRandomName();

    expect(firstName).toMatch(/^[a-z]+$/i);
    expect(lastName).toMatch(/^[a-z]+$/i);

    await page.getByRole("button", { name: "Assistants", exact: true }).click();
    await page.getByRole("button", { name: "Add Assistant" }).click();
    await page.getByLabel("First Name").fill(firstName);
    await page.getByLabel("Last Name").fill(lastName);
    await page
      .getByLabel("Email")
      .fill(`assistant.workflow.${uniqueId}@example.test`);
    await page.getByLabel("Phone").fill(generatePhoneNumber());

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/admin/create/assistant") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Create Assistant" }).click();
    expect((await responsePromise).ok()).toBeTruthy();
  });

  test("assistant can create an appointment with a new schedule", async ({
    page,
  }) => {
    if (!assistantEmail || !assistantPassword) {
      test.skip(
        true,
        "Set E2E_ASSISTANT_EMAIL and E2E_ASSISTANT_PASSWORD to create an appointment",
      );
      return;
    }

    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await login(page, assistantEmail, assistantPassword);
    await expect(page).toHaveURL(/\/assistants/, { timeout: 40_000 });

    const token = await page.evaluate(() => localStorage.getItem("token"));
    if (!token) throw new Error("Assistant login did not store an auth token.");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const doctorsResponse = await page.request.get(
      `${apiUrl}/assistant/my/doctors`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(doctorsResponse.ok()).toBeTruthy();
    const doctors: { id: string }[] = await doctorsResponse.json();
    expect(doctors.length).toBeGreaterThan(0);

    const patientsResponse = await page.request.get(
      `${apiUrl}/assistant/my/patients`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(patientsResponse.ok()).toBeTruthy();
    const patients: { id: string }[] = await patientsResponse.json();
    expect(patients.length).toBeGreaterThan(0);

    const appointmentDate = await createScheduleAndChooseDate(
      page,
      doctors[0].id,
      token,
    );

    await page
      .getByRole("button", { name: "Appointments", exact: true })
      .click();
    await page.getByRole("button", { name: "Add Appointment" }).click();
    await expect(
      page.getByRole("heading", { name: "Create Appointment" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Select Patient" }).click();
    const patientOptions = page.getByRole("option");
    await expect(patientOptions.nth(1)).toBeVisible();
    await patientOptions.nth(1).click();

    await page.getByRole("button", { name: "Select doctor" }).click();
    const doctorOption = page.getByRole("option").nth(1);
    await expect(doctorOption).toBeVisible();
    await doctorOption.click();
    await selectAvailableAppointmentTime(page, appointmentDate);
    await page
      .locator('textarea[name="reason"]')
      .fill("Appointment created by the E2E workflow test.");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/assistant/appointment/create") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Save" }).click();
    expect((await responsePromise).ok()).toBeTruthy();
    await expect(
      page.getByText("Appointment created successfully.", { exact: true }),
    ).toBeVisible();
  });
});
