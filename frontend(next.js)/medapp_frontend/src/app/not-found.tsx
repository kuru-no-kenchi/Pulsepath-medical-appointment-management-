"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-100 via-white to-slate-100 px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
        <SearchX
          size={80}
          className="mx-auto text-red-700"
        />
        <h1 className="mt-6 text-4xl font-bold">
          404
        </h1>
        <h2 className="mt-2 text-2xl font-semibold">
          Page Not Found
        </h2>
        <p className="mt-4 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-500 text-white hover:opacity-90 transition"
        >
          Go Home
        </Link>

      </div>
    </div>
  );
}