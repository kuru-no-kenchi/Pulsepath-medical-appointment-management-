import { test as setup, type APIRequestContext } from "@playwright/test";

// Runs once, before the browser projects (see `dependencies` in
// playwright.config.ts). Creates the accounts the workflow spec logs in with.
// Idempotent: an account that can already log in is left alone, so it also
// works against a local database that keeps its data between runs.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Role = "admin" | "doctor" | "assistant" | "patient";
type Credentials = { email: string; password: string };

function credentials(role: Role): Credentials {
  const key = role.toUpperCase();
  const email = process.env[`E2E_${key}_EMAIL`];
  const password = process.env[`E2E_${key}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`E2E_${key}_EMAIL and E2E_${key}_PASSWORD must be set`);
  }
  return { email, password };
}

// Returns an access token, or null when the credentials are rejected.
async function tryLogin(
  request: APIRequestContext,
  { email, password }: Credentials,
): Promise<string | null> {
  // TODO: adapt the endpoint and the token field to your login API
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.token ?? body.accessToken ?? null;
}

async function create(
  request: APIRequestContext,
  path: string,
  data: Record<string, unknown>,
  token?: string,
) {
  const res = await request.post(`${API_URL}${path}`, {
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok()) {
    // The request body is deliberately not printed (it contains a password).
    throw new Error(`POST ${path} failed: ${res.status()} ${await res.text()}`);
  }
}

setup("create e2e accounts", async ({ request }) => {
  // CI creates the admin account; use it to authorize staff creation.
  const adminToken = await tryLogin(request, credentials("admin"));
  if (!adminToken) {
    throw new Error("Could not log in with the CI-created E2E admin account.");
  }

  const phoneFor = (offset: number) =>
    `06${String(Date.now() + offset).slice(-8)}`;

  // Create a doctor with the fields required by DoctorRequest.
  const doctor = credentials("doctor");
  if (!(await tryLogin(request, doctor))) {
    await create(
      request,
      "/admin/create/doctor",
      {
        firstName: "E2E",
        lastName: "Doctor",
        ...doctor,
        phone: phoneFor(1),
        specialty: "Cardiology",
        experienceYears: 5,
        bio: "Doctor created for E2E testing.",
        consultationDuration: 30,
      },
      adminToken,
    );
  }

  // AssistantRequest uses the common user fields; no doctor-specific fields.
  const assistant = credentials("assistant");
  if (!(await tryLogin(request, assistant))) {
    await create(
      request,
      "/admin/create/assistant",
      {
        firstName: "E2E",
        lastName: "Assistant",
        ...assistant,
        phone: phoneFor(2),
      },
      adminToken,
    );
  }

  // Patients self-register and do not need the admin token.
  const patient = credentials("patient");
  if (!(await tryLogin(request, patient))) {
    await create(request, "/auth/register", {
      firstName: "E2E",
      lastName: "Patient",
      ...patient,
      phone: phoneFor(3),
    });
  }
});
