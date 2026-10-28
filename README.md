# Medical Application

A role-based medical appointment application with a Next.js frontend, a Spring
Boot REST API, and PostgreSQL storage. The application supports administrators,
doctors, assistants, and patients.

## Contents

- [Project structure](#project-structure)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Run the whole application with Docker](#run-the-whole-application-with-docker)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Tests](#tests)
- [CI workflow](#ci-workflow)
- [Application features](#application-features)
- [API overview](#api-overview)
- [Data and scheduling notes](#data-and-scheduling-notes)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)

## Project structure

```text
.
├── backend(springboot)/medapp_backend/  Spring Boot API and backend tests
├── frontend(next.js)/medapp_frontend/   Next.js application and Playwright tests
└── .github/workflows/ci.yml             GitHub Actions workflow
```

The frontend and backend are independent applications. Run each in its own
terminal during local development.

## Technology stack

### Backend

- Java 21 (the CI workflow currently uses Java 22)
- Spring Boot 4
- Spring MVC, Spring Security, Spring Data JPA, and Jakarta Bean Validation
- PostgreSQL
- Flyway and Hibernate
- JWT authentication
- Maven Wrapper (`mvnw` / `mvnw.cmd`)

### Frontend

- Node.js 22 (used by CI)
- Next.js 16, React 19, and TypeScript
- Tailwind CSS
- TanStack Query and Axios for API access
- React Hook Form and Zod for forms and validation
- Playwright for browser-based end-to-end tests

## Requirements

- Git
- JDK 21 or newer
- Node.js 22 and npm
- Docker with Docker Compose, or an accessible PostgreSQL server
- A PostgreSQL client for creating databases used by the test profiles

The Maven Wrapper downloads Maven as needed; a separate Maven installation is
not required.

## Run the whole application with Docker

The root `docker-compose.yml` runs the complete application as three services:

| Service | Container | Host address | Purpose |
| --- | --- | --- | --- |
| `postgres` | `medapp-postgres` | `localhost:5332` | PostgreSQL database `medapp` |
| `backend` | `medapp-backend` | `http://localhost:8080` | Spring Boot REST API |
| `frontend` | `medapp-frontend` | `http://localhost:3000` | Next.js web application |

Docker Compose builds the backend and frontend images from their Dockerfiles.
The backend waits for PostgreSQL's health check before starting. The frontend
uses `NEXT_PUBLIC_API_URL` at build time; when accessing the app in a browser
on the same machine, set it to `http://localhost:8080`.

### 1. Configure Docker Compose

Create a `.env` file in the repository root, next to `docker-compose.yml`:

```dotenv
APP_NAME=MedApp
DB_PASSWORD=replace_with_a_local_database_password
JWT_SECRET=replace_with_a_private_signing_secret
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Compose reads these variables to configure the database and backend and to
build the frontend. `.env` is ignored by Git; do not commit actual secrets.
Generate a strong, private JWT secret rather than using the example value.

### 2. Build and start all services

Run these commands from the repository root:

```powershell
docker compose up --build -d
docker compose ps
```

The first start builds both application images and may take a few minutes.
Once all services are running, open `http://localhost:3000`. The API is
available at `http://localhost:8080`, with Swagger UI at
`http://localhost:8080/swagger-ui/index.html`.

The database is empty on its first start. Docker Compose does not create
application users; restore your database backup or create accounts using the
application's registration/admin workflow before logging in.

To follow logs:

```powershell
docker compose logs -f
```

To follow logs for one service:

```powershell
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f frontend
```

Stop the containers but preserve the database:

```powershell
docker compose down
```

Start them again without rebuilding:

```powershell
docker compose up -d
```

Rebuild after changing application source or Docker configuration:

```powershell
docker compose up --build -d
```

### Database volume and backups

PostgreSQL stores its data in the named volume `medapp_postgres18_data`, mounted
at `/var/lib/postgresql/` for the PostgreSQL 18 image. Stopping or removing the
containers with `docker compose down` does not remove this volume, so the
database persists across restarts and rebuilds.

List and inspect Docker volumes:

```powershell
docker volume ls
docker volume inspect medapp_postgres18_data
```

To remove the Compose stack **and its database volume**, use:

```powershell
docker compose down -v
```

This permanently deletes the database data in that volume. Do not use `-v`
unless you intentionally want to erase the database.

Create a custom-format PostgreSQL backup without sending binary output through
PowerShell redirection:

```powershell
docker exec medapp-postgres pg_dump -U phantom -d medapp -Fc -f /tmp/medapp.dump
docker cp medapp-postgres:/tmp/medapp.dump .\medapp_backup.dump
```

Restore a valid custom-format dump into the Compose database:

```powershell
docker cp .\medapp_backup.dump medapp-postgres:/tmp/medapp_backup.dump
docker exec medapp-postgres pg_restore --format=custom --exit-on-error --no-owner --no-privileges -U phantom -d medapp /tmp/medapp_backup.dump
```

`pg_restore` is for PostgreSQL archive formats such as custom (`pg_dump -Fc`)
and tar (`pg_dump -Ft`). A plain SQL dump must instead be restored with
`psql -v ON_ERROR_STOP=1 -f`. Restore into a suitable database; restoring over
an already-populated schema may cause conflicts. Keep a separate copy of the
backup and verify it before changing or deleting any existing database volume.

### Docker troubleshooting

- **A container name is already in use:** this Compose file assigns fixed
  container names. Inspect the existing container before removing or renaming
  it. Removing a container without `-v` preserves named volumes, but do not
  remove a container that belongs to another running stack without checking it.
- **PostgreSQL is unhealthy:** inspect `docker compose logs postgres` and
  `docker inspect medapp-postgres`. PostgreSQL 18 uses a versioned data
  directory below `/var/lib/postgresql/`; this Compose file mounts the volume
  at that parent directory. An older volume created with a different
  PostgreSQL major version may require a database dump/restore or a proper
  `pg_upgrade`; simply mounting it at a different path does not upgrade it.
- **Frontend cannot reach the API:** from a browser on the host,
  `NEXT_PUBLIC_API_URL` should be `http://localhost:8080`, not the Compose
  service hostname. Because this value is baked into the frontend build, rebuild
  the frontend after changing it:

  ```powershell
  docker compose build frontend
  docker compose up -d frontend
  ```

## Run locally

The Docker Compose workflow above is the simplest way to run the full app.
Alternatively, run the backend and frontend from source while using Compose
only for PostgreSQL.

### 1. Start PostgreSQL

Create the root `.env` file described above, then run only the database
service from the repository root:

```powershell
docker compose up -d postgres
```

The database is available on host port `5332`. Use `DB_PASSWORD` from the root
`.env` file and database username `phantom` in the backend `.env.local` file.
Keep this development database and its credentials local.

To stop the database container while preserving its data:

```bash
docker compose down
```

To remove the database volume as well (this permanently deletes its data):

```bash
docker compose down -v
```

### 2. Configure and start the backend

The backend reads application configuration from environment variables and
optionally imports `backend(springboot)/medapp_backend/.env.local`. This file is
ignored by Git. Create it in the backend directory with values for your local
PostgreSQL instance:

```properties
APP_NAME=MedApp
DB_URL=jdbc:postgresql://localhost:5332/medapp
DB_USERNAME=phantom
DB_PASSWORD=your_local_database_password
JWT_SECRET=replace_with_a_private_signing_secret
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
```

Keep the JWT secret private. Then start the API:

```bash
cd "backend(springboot)/medapp_backend"
./mvnw spring-boot:run
```

On Windows PowerShell, use the wrapper script:

```powershell
cd "backend(springboot)\medapp_backend"
.\mvnw.cmd spring-boot:run
```

The API listens on `http://localhost:8080`. Open
`http://localhost:8080/swagger-ui/index.html` for the generated API reference
when the backend is running.

### 3. Configure and start the frontend

Create `frontend(next.js)/medapp_frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the Next.js development server in another terminal:

```bash
cd "frontend(next.js)/medapp_frontend"
npm ci
npm run dev
```

On Windows PowerShell, the `cd` path can use backslashes:

```powershell
cd "frontend(next.js)\medapp_frontend"
npm ci
npm run dev
```

Open `http://localhost:3000`.

The database starts empty unless you have explicitly seeded it. Create an
administrator and application users through your approved development setup
before attempting to sign in. Do not use production patient data for local
testing.

## Configuration

### Backend profiles

Configuration is split across Spring profiles:

| Profile | Properties file | Purpose | Database behavior |
| --- | --- | --- | --- |
| Default | `src/main/resources/application.properties` | Local application | Hibernate updates the schema; Flyway is enabled |
| `test` | `src/test/resources/application-test.properties` | Backend integration tests | Hibernate recreates and drops the test schema |
| `e2e` | `src/e2e/resources/application-e2e.properties` | Browser tests and CI | Hibernate updates the E2E schema |

Profile settings can optionally be loaded from `.env.local`, `.env.test`, and
`.env.e2e` in the backend directory. These files are local configuration and
must not contain committed or shared credentials.

For the backend integration-test profile, create the database named in
`TEST_DB_URL` on a PostgreSQL instance and provide a backend
`backend(springboot)/medapp_backend/.env.test` file, for example:

```properties
APP_NAME=MedApp
TEST_DB_URL=jdbc:postgresql://localhost:5432/medapp_test_db
TEST_DB_USERNAME=your_test_database_user
TEST_DB_PASSWORD=your_test_database_password
TEST_JWT_SECRET=replace_with_a_private_test_signing_secret
TEST_JWT_EXPIRATION=900000
TEST_JWT_REFRESH_EXPIRATION=604800000
```

The database must exist before Maven starts. Ensure this is a disposable,
isolated database: the test profile drops and recreates its schema.

### Frontend environment

The frontend reads `NEXT_PUBLIC_API_URL` to find the backend. Playwright also
loads `frontend(next.js)/medapp_frontend/.env.e2e` when it exists. Do not put
secrets in variables prefixed with `NEXT_PUBLIC_`; Next.js exposes those values
to browser code.

### Common environment variables

| Variable | Used by | Description |
| --- | --- | --- |
| `APP_NAME` | Backend | Spring application name |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Default backend profile | Local PostgreSQL connection |
| `JWT_SECRET`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION` | Default backend profile | JWT signing secret and token lifetimes in milliseconds |
| `TEST_DB_URL`, `TEST_DB_USERNAME`, `TEST_DB_PASSWORD` | Backend `test` profile | Isolated backend test database |
| `TEST_JWT_SECRET`, `TEST_JWT_EXPIRATION`, `TEST_JWT_REFRESH_EXPIRATION` | Backend `test` profile | JWT configuration for integration tests |
| `E2E_DB_URL`, `E2E_DB_USERNAME`, `E2E_DB_PASSWORD` | Backend `e2e` profile | Isolated browser-test database |
| `E2E_JWT_SECRET`, `E2E_JWT_EXPIRATION`, `E2E_JWT_REFRESH_EXPIRATION` | Backend `e2e` profile | JWT configuration for browser tests |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Playwright workflow | E2E administrator login |
| `E2E_ASSISTANT_EMAIL`, `E2E_ASSISTANT_PASSWORD` | Playwright workflow | E2E assistant login |
| `E2E_APPOINTMENT_DATE` | Appointment workflow test | Date for which the CI seed creates a doctor schedule |

The E2E workflow in GitHub Actions generates test account credentials and
exports them to subsequent steps. Local Playwright runs need suitable E2E
accounts in the configured E2E database and matching credentials available to
the frontend test process.

## Tests

### Backend integration tests

Backend tests use the Spring `test` profile and require a PostgreSQL database
that can be safely recreated. Configure `TEST_DB_*` and `TEST_JWT_*` as shown
above before running tests. **Do not point `TEST_DB_URL` at a database with
valuable data:** the test profile uses `create-drop`.

Run the workflow integration test:

```bash
cd "backend(springboot)/medapp_backend"
./mvnw -Dtest=ApplicationWorkFlowIntegrationTest test
```

Windows PowerShell:

```powershell
cd "backend(springboot)\medapp_backend"
.\mvnw.cmd -Dtest=ApplicationWorkFlowIntegrationTest test
```

Run the complete backend test suite with `./mvnw test` (or
`.\mvnw.cmd test` on Windows).

Current integration-test areas include authentication, user operations,
doctors, assistants, appointments, uploads, and a doctor-assistant workflow.
Test sources live under `backend(springboot)/medapp_backend/src/test/java`.

### Frontend lint and production build

From `frontend(next.js)/medapp_frontend`:

```bash
npm ci
npm run lint
npm run build
```

### Playwright end-to-end tests

Install the Chromium browser once:

```bash
npx playwright install chromium
```

The Playwright configuration starts `npm run dev` automatically, uses
`http://localhost:3000`, and configures the frontend API URL as
`http://localhost:8080`. Start the backend with its `e2e` profile and configure
an isolated E2E database before running tests.

For a local E2E run, create the E2E database, then configure
`backend(springboot)/medapp_backend/.env.e2e` with the variables below:

```properties
APP_NAME=MedApp
E2E_DB_URL=jdbc:postgresql://localhost:5432/medapp_e2e_db
E2E_DB_USERNAME=your_e2e_database_user
E2E_DB_PASSWORD=your_e2e_database_password
E2E_JWT_SECRET=replace_with_a_private_e2e_signing_secret
E2E_JWT_EXPIRATION=900000
E2E_JWT_REFRESH_EXPIRATION=604800000
```

Start the backend with the E2E profile:

```bash
cd "backend(springboot)/medapp_backend"
./mvnw spring-boot:run -Dspring-boot.run.profiles=e2e
```

The Playwright configuration loads `.env.e2e` from the frontend directory.
Create `frontend(next.js)/medapp_frontend/.env.e2e` with credentials that match
users in the E2E database:

```dotenv
E2E_ADMIN_EMAIL=local-admin@example.test
E2E_ADMIN_PASSWORD=replace_with_the_admin_password
E2E_ASSISTANT_EMAIL=local-assistant@example.test
E2E_ASSISTANT_PASSWORD=replace_with_the_assistant_password
E2E_APPOINTMENT_DATE=2026-12-01
```

Use a future `E2E_APPOINTMENT_DATE` whose weekday has a schedule for the
assistant's assigned doctor. The database must contain the corresponding
administrator, assistant, doctor, patient, and assistant-doctor assignment.
Create those records and the doctor's weekly schedule before running the
appointment workflow. The repository currently performs this relational
seeding in the GitHub Actions **Seed the database** step; it does not provide
a separate local seed command. The sample date above is only an example and
must be replaced with a suitable future date.

In a second terminal, start the frontend and run the browser test:

```bash
cd "frontend(next.js)/medapp_frontend"
npm ci
npx playwright install chromium
npx playwright test tests/application.workflow.spec.ts --project=chromium
```

Playwright starts the frontend dev server automatically. Keep the backend and
database running while the tests execute.

Run the CI workflow test on Chromium:

```bash
npx playwright test tests/application.workflow.spec.ts --project=chromium
```

Run all frontend browser tests on Chromium:

```bash
npx playwright test --project=chromium
```

Run a single browser test by title:

```bash
npx playwright test tests/application.workflow.spec.ts --project=chromium -g "assistant can create an appointment"
```

The Playwright suite is under `frontend(next.js)/medapp_frontend/tests`. The
application workflow spec contains separate doctor creation, assistant
creation, and appointment scenarios. The appointment scenario depends on E2E
database seed data: an assistant, an assigned doctor, a patient, a doctor
schedule, credentials, and `E2E_APPOINTMENT_DATE`.

Playwright writes its report to `playwright-report/` and test artifacts to
`test-results/`. Both are generated output and are ignored by Git.

## CI workflow

The GitHub Actions workflow is `.github/workflows/ci.yml`. It runs on pushes
and pull requests targeting `main` and has two jobs:

1. **Backend Integration Tests** starts PostgreSQL, creates a test database,
   then runs `ApplicationWorkFlowIntegrationTest`.
2. **Frontend Tests** starts a separate PostgreSQL service and the Spring
   backend with the `e2e` profile. Its **Seed the database** step creates E2E
   administrator, doctor, assistant, and patient accounts; assigns the doctor
   to the assistant; creates a schedule; and exports generated credentials and
   the appointment date to later workflow steps. It then installs frontend
   dependencies and Chromium, runs lint and the production build, and executes
   the Chromium application workflow spec.

The jobs use separate PostgreSQL databases. Keep the signing keys and any
production credentials in GitHub Secrets. The test-only identities generated
by the E2E seed step do not need to be stored as GitHub Secrets.

## Application features

The application provides role-based experiences:

- **Administrators** manage doctors, assistants, patients, and appointments,
  view dashboards, and manage assistant-doctor assignments.
- **Assistants** manage assigned doctors' schedules and appointments and can
  coordinate patient bookings.
- **Doctors** view their schedule, appointments, and patient information.
- **Patients** view doctors and their own appointments and can book available
  appointment times.

Authentication uses JWTs. The frontend stores the session token and role in the
browser and sends the token with API requests. The backend enforces role access
through Spring Security.

## API overview

The backend API is served from `http://localhost:8080`. Most endpoints require
a bearer token; `/auth/**`, token refresh, uploads, and API documentation have
public access as configured by Spring Security.

| Route prefix | Main responsibility |
| --- | --- |
| `/auth` | Registration, login, logout, and password reset |
| `/token` | Refresh an access token |
| `/users` | Current-user information |
| `/admin` | Administrator dashboards and management |
| `/assistant` | Assistant profile, assigned doctors, schedules, and appointments |
| `/doctor` | Doctor profile, schedule, appointments, and patients |
| `/patient` | Patient profile, doctors, bookings, and appointments |
| `/availability` | Available appointment slots for a doctor and date |
| `/notifications` | Notification information |
| `/upload` | File upload operations |

Use Swagger UI at `/swagger-ui/index.html` for request and response schemas and
the complete endpoint list.

## Data and scheduling notes

- A user account has a role: `ADMIN`, `DOCTOR`, `ASSISTANT`, or `PATIENT`.
- Doctor, assistant, and patient profiles are associated with user accounts.
- An assistant may be assigned to multiple doctors; assignments are required
  for assistant schedule and appointment management.
- Doctor schedules are weekly recurring periods associated with a weekday,
  not one-off date records.
- Availability is calculated for a doctor and a calendar date from the
  schedule for that date's weekday, the doctor's consultation duration, and
  existing non-cancelled appointments.
- Appointment creation requires a patient, doctor, assistant (in administrator
  flows), date, available start time, and reason.
- Keep development, integration-test, and E2E databases separate. In
  particular, never use the backend test profile against a shared database.

## Troubleshooting

### Frontend cannot reach the API

- Confirm the backend is listening on port `8080`.
- Set `NEXT_PUBLIC_API_URL=http://localhost:8080`.
- Check the backend logs for database connection or startup errors.

### Backend cannot connect to PostgreSQL

- Confirm the PostgreSQL service is running and the port, database name,
  username, and password match the backend environment.
- The included local Compose service maps the database to host port `5332`;
  CI uses its own PostgreSQL service on port `5432`.

### Playwright login reports “User not found”

The credentials supplied to Playwright must correspond to users in the
configured E2E database. For CI, check that **Seed the database** completed
before the Playwright step and exported the E2E login variables. For local
runs, create the required accounts in the E2E database and configure the
matching variables in the frontend test environment.

### Appointment availability is empty

Confirm that the selected doctor has a schedule for the weekday of the chosen
date, that the assistant is assigned to that doctor, and that the selected
date/time is not already occupied by a non-cancelled appointment. The schedule
seeded by CI is recurring weekly.

### Playwright reports an invalid time

The availability API may return times with seconds (for example, `08:00:00`),
while the appointment form validates `HH:mm`. Normalize selected slot values
to hours and minutes before putting them in the form.

## Security notes

- Do not commit `.env.local`, `.env.test`, `.env.e2e`, or other files containing
  credentials. Environment files are ignored by Git.
- Do not use real patient information in test data.
- Keep JWT signing secrets and production database credentials in a secret
  manager or CI Secrets.
- Treat generated CI credentials as test-only and never reuse them in a
  deployed environment.
