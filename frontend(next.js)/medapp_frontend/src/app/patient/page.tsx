'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoutes from "@/lib/ProtectedRoute";

export default function PatientDashboard(){

    return (
        <ProtectedRoutes allowedRoles={["PATIENT"]}>
            <DashboardLayout role={"PATIENT"}/>
        </ProtectedRoutes>
    );
}