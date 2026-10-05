
import {
  useDashboardLastThreeAppointments,
  useDashboardLastThreeAssistants,
  useDashboardLastThreeDoctors,
  useDashboardStats,
} from "@/hooks/useAdmin";
import { AssistantDoctor } from "@/types/assistant";
import { capitalizeName } from "@/lib/capitalizeName";
import AppointmentsChart from "@/components/ui/AppointmentsChart";
import AppointmentStatusCard from "@/components/ui/AppointmentStatusCard";
import DashboardStats, { Stats } from "@/components/ui/DashboardStats";
import PageHeader from "@/components/ui/PageHeader";
import RecentAssistantCard from "@/components/ui/RecentAssistantsCard";
import RecentDoctorCard from "@/components/ui/RecentDoctorsCard";
import StatsPageSkeleton from "@/components/ui/StatsPageSkeleton";
import { DashboardSection } from "@/config/DashboardConfig";
import { useState } from "react";
import { FiUserPlus, FiUsers, FiCalendar, FiUserCheck } from "react-icons/fi";
import AppointmentsPage from "./AppointmentsPage";
import AssistantsPage from "./AssistantsPage";
import DoctorsPage from "./DoctorsPage";

interface Props {
  setActiveSection: (section: DashboardSection) => void;
}
export default function AdminView({ setActiveSection }: Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { data: doctors = [], isLoading: doctorsLoading } =
    useDashboardLastThreeDoctors();
  const { data: assistants = [], isLoading: assistantsLoading } =
    useDashboardLastThreeAssistants();
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useDashboardLastThreeAppointments();
  const { data, isLoading: statsLoading } = useDashboardStats();
  const loading =
    doctorsLoading || appointmentsLoading || assistantsLoading || statsLoading;

  if (loading) {
    return <StatsPageSkeleton />;
  }
  const adminActions = [
    {
      label: "Manage Doctors",
      icon: FiUserPlus,
      onClick: () => setActiveSection("doctors"),
    },
    {
      label: "Manage Assistants",
      icon: FiUsers,
      onClick: () => setActiveSection("assistants"),
    },
    {
      label: "View Appointments",
      icon: FiCalendar,
      onClick: () => setActiveSection("appointments"),
    },
  ];
  const dashboardStats: Stats[] = [
    {
      key: "doctors",
      label: "Doctors",
      value: data.doctors,
      icon: <FiUserCheck size={20} />,
      color: "blue",
    },
    {
      key: "assistants",
      label: "Assistants",
      value: data.assistants,
      icon: <FiUsers size={20} />,
      color: "purple",
    },
    {
      key: "patients",
      label: "Patients",
      value: data.patients,
      icon: <FiUsers size={20} />,
      color: "green",
    },
    {
      key: "appointments",
      label: "Appointments",
      value: data.appointments,
      icon: <FiCalendar size={20} />,
      color: "orange",
    },
  ];
  return (
    <div className="space-y-6">
      {selectedAction === "addDoctor" && <DoctorsPage />}
      {selectedAction === "addAssistant" && <AssistantsPage />}
      {selectedAction === "appointments" && <AppointmentsPage />}
      <PageHeader
        title="Dashboard"
        description="Overview of today's activity."
      />
      {!selectedAction && (
        <>
          <DashboardStats stats={dashboardStats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AppointmentsChart data={data.appointmentsByDay} />
            <AppointmentStatusCard
              confirmed={data.appointmentStats.confirmed}
              completed={data.appointmentStats.completed}
              cancelled={data.appointmentStats.cancelled}
              no_show={data.appointmentStats.no_show}
            />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentDoctorCard
              title="Recent Doctors"
              icon={FiUserCheck}
              children={
                <div className="divide-y divide-gray-200">
                  {(Array.isArray(doctors) ? doctors.slice(0, 5) : []).map(
                    (d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between py-4 hover:bg-gray-50 transition px-2 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {capitalizeName(d.firstName)}{" "}
                            {capitalizeName(d.lastName)}
                          </p>
                          <p className="text-xs text-gray-500">{d.specialty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-2">
                            {d.email}
                          </p>
                          <p className="text-xs text-gray-400">{d.phone}</p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              }
            />
            <RecentAssistantCard
              title="Recent Assistants"
              icon={FiUsers}
              children={(Array.isArray(assistants)
                ? assistants.slice(0, 5)
                : []
              ).map((ass) => (
                <div
                  key={ass.id}
                  className="flex items-center justify-between py-4 hover:bg-gray-50 transition px-2 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {capitalizeName(ass.firstName)}{" "}
                      {capitalizeName(ass.lastName)}
                    </p>

                    <div className="text-xs text-gray-500 mt-1">
                      {ass.doctors?.length ? (
                        ass.doctors.map((doc: AssistantDoctor, i: number) => (
                          <span key={doc.id}>
                            Dr {doc.fullName}
                            {i !== ass.doctors.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        <span>No doctors assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-2">{ass.email}</p>
                    <p className="text-xs text-gray-400">{ass.phone}</p>
                  </div>
                </div>
              ))}
            />
          </div>
        </>
      )}
    </div>
  );
}
