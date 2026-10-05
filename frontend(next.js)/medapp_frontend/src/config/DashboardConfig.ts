import { UserRole } from "@/types/user";

export type DashboardSection =
  | "dashboard"
  | "doctors"
  | "assistants"
  | "patients"
  | "schedule"
  | "appointments"
  | "profile";

export interface SidebarItem {
  label: string;
  value: DashboardSection;
}

export const dashboardConfig: Record<UserRole, SidebarItem[]> = {
  ADMIN: [
    { label: "Dashboard", value: "dashboard" },
    { label: "Doctors", value: "doctors" },
    { label: "Assistants", value: "assistants" },
    { label : "Patients", value : "patients"},
    { label: "Appointments", value: "appointments" },
  ],

  DOCTOR: [
    { label: "Dashboard", value: "dashboard" },
    { label: "Schedule", value: "schedule" },
    { label: "Appointments", value: "appointments" },
    { label: "Patients", value : "patients"}
  ],

  ASSISTANT: [
    { label: "Dashboard", value: "dashboard" },
    { label: "Doctors", value: "doctors" },
    { label : "Schedule", value: "schedule"},
    { label : "Patients", value :"patients"},
    { label: "Appointments", value: "appointments" },
  ],

  PATIENT: [
    { label: "Dashboard", value: "dashboard" },
    { label: "Doctors", value: "doctors" },
    { label: "Schedule", value: "schedule"},
    { label: "Appointments", value: "appointments" },
  ],
};