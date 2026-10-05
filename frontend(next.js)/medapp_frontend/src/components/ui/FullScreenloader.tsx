"use client";

import { Loader2 } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
}

export default function FullScreenLoader({
  title = "Loading...",
  description = "Please wait while we prepare everything.",
}: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-slate-100 via-white to-slate-100">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-slate-200"></div>

          <Loader2
            className="absolute inset-0 m-auto h-12 w-12 animate-spin text-indigo-700"
          />
        </div>

        <h2 className="mt-8 text-2xl font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-2 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}