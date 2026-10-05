"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useAppInitializer } from "@/hooks/useAppInitializer";

export default function LoadingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role");
  const queryClient = useQueryClient();
  const { initialize, message, progress } = useAppInitializer();

  useEffect(() => {
    async function load() {
      await initialize(role as any);
      switch (role) {
        case "ADMIN":
          router.replace("/admin");
          break;
        case "DOCTOR":
          router.replace("/doctor");
          break;
        case "ASSISTANT":
          router.replace("/assistants");
          break;
        case "PATIENT":
          router.replace("/patient");
          break;
        default:
          router.replace("/login");
      }
    }
    load();
  }, [role]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r
        from-slate-200
        via-white
        to-white"
    >
      <div className="flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="MedApp"
          width={120}
          height={120}
          className="animate-pulse"
        />

        <h1 className="mt-8 text-3xl font-bold text-white">MedApp</h1>

        <div className="w-72 h-2 bg-gray-200 rounded-full overflow-hidden mt-8">
          <div
            className="h-full bg-gradient-to-r from-indigo-900 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-gray-500">{message}</p>
        <Loader2 className="mt-10 h-10 w-10 animate-spin text-white" />
      </div>
    </div>
  );
}
