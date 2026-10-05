"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function UnknownRolePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-lg text-center">

        <TriangleAlert
          className="mx-auto text-yellow-500"
          size={72}
        />

        <h1 className="text-3xl font-bold mt-6">
          Unknown Account Type
        </h1>

        <p className="text-gray-500 mt-3">
          Your account role is not recognized.
        </p>

        <p className="text-gray-400 mt-1">
          Please contact your administrator.
        </p>

        <Link
          href="/login"
          className="inline-flex mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-500 text-white"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}