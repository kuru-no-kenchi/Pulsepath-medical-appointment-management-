import {
  useAppoinmentsByAssistant,
  useDashboardStats,
  useDoctorsByAssistant,
} from "@/hooks/useAssistant";
import { Appointment } from "@/types/appointment";
import { AssistantDoctor } from "@/types/assistant";
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
import { CiUnread } from "react-icons/ci";
import { FiUser, FiUsers, FiCalendar, FiCheckCircle } from "react-icons/fi";
import AssAppointmentsPage from "./AppointmentsPage";
import AssDoctorsPage from "./DoctorsPage";
import AssPatientsPage from "./PatientsPage";

interface Props {
  setActiveSection: (section: DashboardSection) => void;
}

export default function AssistantPage({ setActiveSection }: Props) {
  const [selectedAction] = useState<string>();
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useAppoinmentsByAssistant();
  const { data: doctors = [], isLoading: doctorsLoading } =
    useDoctorsByAssistant();
  const {
    data: stats = [
      {
        doctorsManaged: 0,
        todayAppointments: 0,
        remainingAppointments: 0,
        totalPatients: 0,
      },
    ],
    isLoading: statsLoading,
  } = useDashboardStats();
  const loading = doctorsLoading || appointmentsLoading || statsLoading;
  const assistantActions = [
    {
      label: "Mangage Doctors",
      icon: FiUser,
      onClick: () => setActiveSection("doctors"),
    },
    {
      label: "View Patients",
      icon: FiUsers,
      onClick: () => setActiveSection("patients"),
    },
    {
      label: "Manage Appointments",
      icon: FiCalendar,
      onClick: () => setActiveSection("appointments"),
    },
  ];
  const assistantStats: Stats[] = [
    {
      key: "today",
      label: "Doctors Manged",
      value: stats.doctorsManaged,
      icon: <FiCalendar />,
      color: "blue",
    },
    {
      key: "completed",
      label: "Today Appointments",
      value: stats.todayAppointments,
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

  if (loading) {
    return <StatsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {selectedAction === "doctors" && <AssDoctorsPage />}
      {selectedAction === "patients" && <AssPatientsPage />}
      {selectedAction === "appointments" && <AssAppointmentsPage />}
      <PageHeader
        title="Dashboard"
        description="Overview of today's activity."
      />
      {!selectedAction && (
        <>
          <DashboardStats stats={assistantStats} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <RecentAppointmentCard>
                {appointments.length === 0 ? (
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
                )}
              </RecentAppointmentCard>
            </div>
            <QuickActionCard actions={assistantActions} />
          </div>
          <AssignedCard
            title="Assigned Doctors"
            emptyMessage="No assigned Doctors"
            people={doctors.map((d: AssistantDoctor) => ({
              id: d.id,
              fullName: `Dr. ${d.fullName}`,
              subtitle: d.specialty,
              description: `${d.todayAppointments} appointments today`,
              photoUrl: d.photoUrl,
            }))}
          />
        </>
      )}
    </div>
  );
}
