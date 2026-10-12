import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const workflows = [
  {
    role: "admin",
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
    path: /\/admin$/,
    sections: ["Dashboard", "Doctors", "Assistants", "Patients", "Appointments"],
  },
  {
    role: "doctor",
    email: process.env.E2E_DOCTOR_EMAIL,
    password: process.env.E2E_DOCTOR_PASSWORD,
    path: /\/doctor$/,
    sections: ["Dashboard", "Schedule", "Appointments", "Patients"],
  },
  {
    role: "assistant",
    email: process.env.E2E_ASSISTANT_EMAIL,
    password: process.env.E2E_ASSISTANT_PASSWORD,
    path: /\/assistants$/,
    sections: ["Dashboard", "Doctors", "Schedule", "Patients", "Appointments"],
  },
  {
    role: "patient",
    email: process.env.E2E_PATIENT_EMAIL,
    password: process.env.E2E_PATIENT_PASSWORD,
    path: /\/patient$/,
    sections: ["Dashboard", "Doctors", "Schedule", "Appointments"],
  },
] as const;

for (const workflow of workflows) {
  test(`${workflow.role} can navigate their application workflow`, async ({
    page,
  }) => {
    const { email, password } = workflow;

    test.skip(
      !email || !password,
      `Set E2E_${workflow.role.toUpperCase()}_EMAIL and E2E_${workflow.role.toUpperCase()}_PASSWORD`,
    );
    if (!email || !password) return;

    await login(page, email, password);
    await expect(page).toHaveURL(workflow.path, { timeout: 40_000 });
    await expect(
      page.getByRole("heading", { name: /dashboard/i }).first(),
    ).toBeVisible();

    for (const section of workflow.sections) {
      const sectionButton = page.getByRole("button", {
        name: section,
        exact: true,
      });

      await expect(sectionButton).toBeVisible();
      await sectionButton.click();

      await expect(
        page.getByRole("main").getByRole("heading").first(),
      ).toBeVisible();
    }

    // The sidebar's user block opens the profile section.
    await page.locator("aside > div").first().click();
    await expect(
      page.getByRole("heading", { name: /^profile$/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
}