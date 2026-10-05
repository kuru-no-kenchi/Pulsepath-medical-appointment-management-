'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoutes from "@/lib/ProtectedRoute";

export default function AssistantDashboard(){

    return (
        <ProtectedRoutes allowedRoles={["ASSISTANT"]}>
            <DashboardLayout role="ASSISTANT"/>
        </ProtectedRoutes>
    );
}