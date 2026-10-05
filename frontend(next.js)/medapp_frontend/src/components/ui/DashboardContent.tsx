"use client";

import DoctorsPage from "@/components/dashboards/adminDashboards/DoctorsPage";
import AssistantsPage from "@/components/dashboards/adminDashboards/AssistantsPage";
import { DashboardSection } from "@/config/DashboardConfig";
import { UserRole } from "@/types/user";
import AdminView from "@/components/dashboards/adminDashboards/AdminPage";
import AdminProfile from "@/components/profile/AdminProfile";
import AppointmentsPage from "@/components/dashboards/adminDashboards/AppointmentsPage";
import DocAppointmentsPage from "../dashboards/doctorDashboards/AppointmentsPage";
import PatientsPage from "@/components/dashboards/adminDashboards/PatientsPage";
import DoctorView from "../dashboards/doctorDashboards/DoctorPage";
import SchedulePage from "../dashboards/doctorDashboards/SchedulePage";
import DoctorProfile from "../profile/DoctorProfile";
import DocPatientsPage from "../dashboards/doctorDashboards/PatientsPage";
import AssistantPage from "../dashboards/assistantDashboards/AssistantPage";
import AssDoctorsPage from "../dashboards/assistantDashboards/DoctorsPage";
import AssPatientsPage from "../dashboards/assistantDashboards/PatientsPage";
import AssAppointmentsPage from "../dashboards/assistantDashboards/AppointmentsPage";
import AssSchedulePage from "../dashboards/assistantDashboards/SchedulePage";
import AssistantProfile from "../profile/AssistantProfile";
import PatientPage from "../dashboards/patientDashboards/PatientPage";
import PatDoctorsPage from "../dashboards/patientDashboards/DoctorsPage";
import PatAppointmentsPage from "../dashboards/patientDashboards/AppointmentsPage";
import PatSchedulePage from "../dashboards/patientDashboards/SchedulePage";
import PatientProfile from "../profile/PatientProfile";

interface Props {
  section: DashboardSection;
  role: UserRole;
  setActiveSection?: (section: DashboardSection) => void;
}

export default function DashboardContent({
  section,
  role,
  setActiveSection,
}: Props) {
  const handleSetActiveSection = setActiveSection ?? (() => undefined);

  // ADMIN views
  if (role === "ADMIN") {
    switch (section) {
      case "doctors":
        return <DoctorsPage />;
      case "assistants":
        return <AssistantsPage />;
      case "patients":
        return <PatientsPage />;
      case "appointments":
        return <AppointmentsPage />;
      case "profile":
        return <AdminProfile />;
      default:
        return <AdminView setActiveSection={handleSetActiveSection} />;
    }
  }

  // DOCTOR views
  if (role === "DOCTOR") {
    switch (section) {
      case "schedule":
        return <SchedulePage />;
      case "appointments":
        return <DocAppointmentsPage />;
      case "profile":
        return <DoctorProfile />;
      case "patients":
        return <DocPatientsPage />;
      default:
        return <DoctorView setActiveSection={handleSetActiveSection} />;
    }
  }

  // ASSISTANT views
  if (role === "ASSISTANT") {
    switch (section) {
      case "doctors":
        return <AssDoctorsPage />;
      case "patients":
        return <AssPatientsPage />;
      case "appointments":
        return <AssAppointmentsPage />;
      case "schedule":
        return <AssSchedulePage />;
      case "profile":
        return <AssistantProfile />;
      default:
        return <AssistantPage setActiveSection={handleSetActiveSection} />;
    }
  }

  // PATIENT views
  if (role === "PATIENT") {
    switch (section) {
      case "doctors":
        return <PatDoctorsPage />;
      case "schedule":
        return <PatSchedulePage />
      case "appointments":
        return <PatAppointmentsPage />;
      case "profile":
        return <PatientProfile />;
      default:
        return <PatientPage setActiveSection={handleSetActiveSection} />;
    }
  }

  return <h1>Unknown role</h1>;
}
