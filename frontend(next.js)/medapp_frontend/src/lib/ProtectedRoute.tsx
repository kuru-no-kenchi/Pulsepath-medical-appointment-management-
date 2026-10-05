"use client";

import FullScreenLoader from "@/components/ui/FullScreenloader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoutes({ children, allowedRoles }: Props) {
  const { auth, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!auth.role || !allowedRoles.includes(auth.role)) {
      router.replace("/unauthorized");
    }
  }, [loading, isAuthenticated, auth.role, allowedRoles, router]);

  if (loading) {
    return (
      <FullScreenLoader
        title="Checking session"
        description="Verifying your credentials..."
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return null;
  }

  return <>{children}</>;
}
