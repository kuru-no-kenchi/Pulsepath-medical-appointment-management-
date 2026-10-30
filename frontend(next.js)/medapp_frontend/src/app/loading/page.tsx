"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FiActivity } from "react-icons/fi";
import { UserRole } from "@/types/user";
import { useAppInitializer } from "@/hooks/useAppInitializer";
import { userService } from "@/services/user.service";

function LoadingPageContent() {
  const router = useRouter();
  const { initialize, message, progress } = useAppInitializer();

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const currentUser = await userService.getCurrentUser();
        const role = (currentUser?.role ?? null) as UserRole | null;

        if (!isMounted) return;

        if (!role) {
          router.replace("/login");
          return;
        }

        await initialize(role);

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
      } catch (error) {
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [initialize, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-blue-50"
    >
      <div className="flex flex-col items-center">
        <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-900 to-blue-500 text-white shadow-lg shadow-blue-900/20">
          <FiActivity size={42} />
        </span>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-indigo-950">
          PulsePath
        </h1>

        <div className="w-72 h-2 bg-gray-200 rounded-full overflow-hidden mt-8">
          <div
            className="h-full bg-gradient-to-r from-indigo-900 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-gray-500">{message}</p>
        <Loader2 className="mt-10 h-10 w-10 animate-spin text-indigo-900" />
      </div>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      }
    >
      <LoadingPageContent />
    </Suspense>
  );
}
