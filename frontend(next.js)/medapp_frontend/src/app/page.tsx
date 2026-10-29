"use client";

import Link from "next/link";
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiUsers,
  FiBell,
} from "react-icons/fi";

const features = [
  {
    icon: FiCalendar,
    title: "Appointment Management",
    description:
      "Organize appointments and make scheduling easier for patients and healthcare professionals.",
  },
  {
    icon: FiUsers,
    title: "Team Coordination",
    description:
      "Help administrators, doctors, and assistants coordinate their daily activities.",
  },
  {
    icon: FiShield,
    title: "Secure Access",
    description:
      "Provide dedicated access to each user according to their assigned role.",
  },
  {
    icon: FiBell,
    title: "Notifications",
    description:
      "Keep users informed about appointment changes and important updates.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="border-b border-gray-100">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FiActivity size={23} />
            </span>
            <span className="text-2xl font-bold tracking-tight">
              Med<span className="text-blue-600">App</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-gray-600 transition hover:text-blue-600 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700">
              <FiCheckCircle />
              Medical appointment management
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Healthcare management,
              <span className="mt-2 block text-blue-600">made simpler.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Manage appointments, coordinate healthcare teams, and keep
              essential information organized with MedApp.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Access your account
                <FiArrowRight />
              </Link>

              <a
                href="#features"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Explore features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                Role-based access
              </span>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                Centralized scheduling
              </span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <p className="text-sm text-gray-500">Welcome to</p>
                  <h2 className="mt-1 text-xl font-bold">MedApp Dashboard</h2>
                </div>
                <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <FiActivity size={24} />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <FiCalendar className="text-blue-600" size={22} />
                  <p className="mt-4 text-sm text-gray-600">Appointments</p>
                  <p className="mt-1 font-semibold text-gray-900">Scheduling</p>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <FiUsers className="text-green-600" size={22} />
                  <p className="mt-4 text-sm text-gray-600">Healthcare team</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    Coordination
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiShield size={20} />
                  </span>
                  <div>
                    <p className="font-semibold">
                      One platform, dedicated roles
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Admin, doctor, assistant, and patient access
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-400">
                A centralized workspace for healthcare coordination
              </p>
            </div>

            <div className="absolute -bottom-5 -left-3 -z-10 h-32 w-32 rounded-full bg-blue-100 blur-2xl sm:-left-6" />
            <div className="absolute -right-3 -top-5 -z-10 h-32 w-32 rounded-full bg-indigo-100 blur-2xl sm:-right-6" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-10 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              What MedApp offers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything organized in one place
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Tools designed to simplify appointment management and daily
              coordination across the healthcare team.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Icon size={24} />
                  </span>

                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-14 rounded-2xl bg-blue-600 px-6 py-10 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to access MedApp?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Sign in to access your workspace and the features available to
              your account.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Go to login
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link href="/" className="font-semibold text-gray-800">
            MedApp
          </Link>
          <p>Medical appointment management made simpler.</p>
          <p>© {new Date().getFullYear()} MedApp</p>
        </div>
      </footer>
    </main>
  );
}
