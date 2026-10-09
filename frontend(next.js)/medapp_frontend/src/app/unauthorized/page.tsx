"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-lg text-center">

        <ShieldX
          className="mx-auto text-red-600"
          size={72}
        />

        <h1 className="text-3xl font-bold mt-6">
          Access Denied
        </h1>

        <p className="text-gray-500 mt-3">
          You don&apos;t have permission to access this page.
        </p>

        <Link
          href="/login"
          className="inline-flex mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-500 text-white"
        >
          Return to Login
        </Link>

      </div>

    </div>
  );
}