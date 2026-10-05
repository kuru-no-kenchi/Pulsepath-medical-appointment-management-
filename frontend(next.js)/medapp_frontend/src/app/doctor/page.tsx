'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoutes from "@/lib/ProtectedRoute";

export default function DoctorDashboard(){

    return (
        <ProtectedRoutes allowedRoles={["DOCTOR"]}>
            <DashboardLayout role="DOCTOR"/>
        </ProtectedRoutes>
    );
}