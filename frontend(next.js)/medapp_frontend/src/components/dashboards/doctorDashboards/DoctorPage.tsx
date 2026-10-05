
import {
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiUser,
} from "react-icons/fi";
import { CiUnread } from "react-icons/ci";
import SchedulePage from "./SchedulePage";
import {
  useAppointmentsByDoctor,
  useAssignedAssistant,
  useDashboardStats,
} from "@/hooks/useDoctor";
import { Appointment } from "@/types/appointment";
import { capitalizeName } from "@/lib/capitalizeName";
import AppointmentStatusBadge from "@/components/ui/AppointmentStatusBadge";
import AssignedCard from "@/components/ui/AssignedCard";
import DashboardStats, { Stats } from "@/components/ui/DashboardStats";
import PageHeader from "@/components/ui/PageHeader";
import QuickActionCard from "@/components/ui/QuickActions";
import RecentAppointmentCard from "@/components/ui/RecentAppointmentCard";
import StatsPageSkeleton from "@/components/ui/StatsPageSkeleton";
import { DashboardSection } from "@/config/DashboardConfig";
import { useState } from "react";
import DocAppointmentsPage from "./AppointmentsPage";

interface Props {
  setActiveSection: (section: DashboardSection) => void;
}

export default function DoctorView({ setActiveSection }: Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useAppointmentsByDoctor();
  const { data: assistant = [], isLoading: assistantLoading } =
    useAssignedAssistant();
  const {
    data: stats = [
      {
        todayAppointments: 0,
        completedAppointments: 0,
        remainingAppointments: 0,
        totalPatients: 0,
      },
    ],
    isLoading: statsLoading,
  } = useDashboardStats();
  const isLoading = appointmentsLoading || statsLoading || assistantLoading;
  const doctorActions = [
    {
      label: "View Schedule",
      icon: FiClipboard,
      onClick: () => setActiveSection("schedule"),
    },
    {
      label: "Manage Appointments",
      icon: FiCalendar,
      onClick: () => setActiveSection("appointments"),
    },
    {
      label: "View Patients",
      icon: FiUsers,
      onClick: () => setActiveSection("patients"),
    },
  ];

  const doctorStats: Stats[] = [
    {
      key: "today",
      label: "Today's Appointments",
      value: stats.todayAppointments,
      icon: <FiCalendar />,
      color: "blue",
    },
    {
      key: "completed",
      label: "Appointments Completed",
      value: stats.completedAppointments,
      icon: <FiCheckCircle />,
      color: "green",
    },
    {
      key: "left",
      label: "Appointments left",
      value: stats.remainingAppointments,
      icon: <CiUnread />,
      color: "red",
    },
    {
      key: "patients",
      label: "Patients",
      value: stats.totalPatients,
      icon: <FiUsers />,
      color: "purple",
    },
  ];
  if (isLoading) {
    return <StatsPageSkeleton />;
  }
  return (
    <div className="space-y-6">
      {selectedAction === "schedule" && <SchedulePage />}
      {selectedAction === "appointments" && <DocAppointmentsPage />}
      <PageHeader
        title="Dashboard"
        description="Overview of today's activity."
      />
      {!selectedAction && (
        <>
          <DashboardStats stats={doctorStats} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <RecentAppointmentCard
                children={
                  appointments.length === 0 ? (
                    <div className="divide-y divide-gray-200 mt-5 text-gray-500 px-8">
                      <p>No appointments for today</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {appointments
                        .slice(0, 5)
                        .map((appointment: Appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between py-4 hover:bg-gray-50 transition px-2 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {capitalizeName(appointment.patient.firstName)}{" "}
                                {capitalizeName(appointment.patient.lastName)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Dr. {capitalizeName(appointment.doctor.firstName)}{" "}
                                {capitalizeName(appointment.doctor.lastName)}
                              </p>
                            </div>
                            <div className="text-center">
                              <AppointmentStatusBadge
                                status={appointment.status}
                              />
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 mt-1">
                                {appointment.appointmentDate}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )
                }
              />
            </div>
            <QuickActionCard actions={doctorActions} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <AssignedCard
              title={"Assigned Assistant"}
              icon={FiUser}
              people={
                assistant
                  ? {
                      id: assistant.id,
                      fullName: `${capitalizeName(assistant.firstName)} ${capitalizeName(assistant.lastName)}`,
                      subtitle: assistant.phone,
                      description: assistant.email,
                      photoUrl: assistant.photoUrl,
                    }
                  : []
              }
              emptyMessage="No assigned assistants"
            />
          </div>
        </>
      )}
    </div>
  );
}
