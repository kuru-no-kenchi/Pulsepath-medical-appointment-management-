"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoutes from "@/lib/ProtectedRoute";

export default function AdminPage() {

  return (
    <ProtectedRoutes allowedRoles={["ADMIN"]}>
    <DashboardLayout role="ADMIN"/>
    </ProtectedRoutes>
  );
}