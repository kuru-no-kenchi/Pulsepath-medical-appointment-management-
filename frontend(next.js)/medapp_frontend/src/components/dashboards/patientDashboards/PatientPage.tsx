import { useState } from "react";
import { Appointment } from "@/types/appointment";
import {
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { CiUnread } from "react-icons/ci";
import { DashboardSection } from "@/config/DashboardConfig";
import PatDoctorsPage from "./DoctorsPage";
import PatSchedulePage from "./SchedulePage";
import PatAppointmentsPage from "./AppointmentsPage";
import {
  useDashboardStats,
  useRecentVisits,
  useUpcomingAppointments,
} from "@/hooks/usePatients";
import { capitalizeName } from "@/lib/capitalizeName";
import AppointmentStatusBadge from "@/components/ui/AppointmentStatusBadge";
import DashboardStats, { Stats } from "@/components/ui/DashboardStats";
import PageHeader from "@/components/ui/PageHeader";
import QuickActionCard from "@/components/ui/QuickActions";
import RecentAppointmentCard from "@/components/ui/RecentAppointmentCard";
import StatsPageSkeleton from "@/components/ui/StatsPageSkeleton";
import UpcomingAppointments from "@/components/ui/UpcomingAppointments";
import DoctorAvailability from "@/components/ui/DoctorAvailability";

interface Props {
  setActiveSection: (section: DashboardSection) => void;
}
function formatTime(time: string | null) {
  if (!time) return "--:--";
  const date = new Date(`1970-01-01T${time}`);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function PatientPage({ setActiveSection }: Props) {
  const {
    data: stats = [
      {
        nextAppointmentDate: "",
        nextAppointmentTime: "",
        nextAppointmentDoctor: "",
        totalAppointments: 0,
        completedVisits: 0,
        pendingAppointments: 0,
      },
    ],
    isLoading: statsLoading,
  } = useDashboardStats();
  const { data: recentVisits = [], isLoading: recentVisitsLoading } =
    useRecentVisits();
  const { data: upcoming = [], isLoading: upcomingAppointmentsLoading } =
    useUpcomingAppointments();
  const [selectedAction, setSelectedAction] = useState<string>();
  const loading =
    recentVisitsLoading || upcomingAppointmentsLoading || statsLoading;
  const next = stats.nextAppointmentDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(new Date(stats.nextAppointmentDate)) +
      " • " +
      formatTime(stats.nextAppointmentTime)
    : "0";

  const patientActions = [
    {
      label: "View Doctors",
      icon: FiUser,
      onClick: () => setActiveSection("doctors"),
    },
    {
      label: "View Schedule",
      icon: FiClipboard,
      onClick: () => setActiveSection("schedule"),
    },
    {
      label: "Book Appointment",
      icon: FiCalendar,
      onClick: () => setActiveSection("appointments"),
    },
  ];
  const patientStats: Stats[] = [
    {
      key: "total",
      label: "Total Appointments",
      value: stats.totalAppointments,
      icon: <FiCalendar />,
      color: "blue",
    },
    {
      key: "completed",
      label: "Completed Visits",
      value: stats.completedVisits,
      icon: <FiCheckCircle />,
      color: "green",
    },
    {
      key: "left",
      label: "Appointments pending",
      value: stats.pendingAppointments,
      icon: <CiUnread />,
      color: "orange",
    },
    {
      key: "upcoming",
      label: "Upcoming Appointment",
      value: next,
      icon: <FiUsers />,
      color: "purple",
    },
  ];

  if (loading) {
    return <StatsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {selectedAction === "doctors" && <PatDoctorsPage />}
      {selectedAction === "schedule" && <PatSchedulePage />}
      {selectedAction === "appointments" && <PatAppointmentsPage />}
      <PageHeader
        title="Dashboard"
        description="Overview of today's activity."
      />
      {!selectedAction && (
        <>
          <DashboardStats stats={patientStats} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <RecentAppointmentCard
                title="Recent Visits"
                children={
                  recentVisits.length === 0 ? (
                    <div className="divide-y divide-gray-200 mt-5 text-gray-500 px-8">
                      <p>No appointments for today</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {recentVisits
                        .slice(0, 3)
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
                                Dr.{" "}
                                {capitalizeName(appointment.doctor.firstName)}{" "}
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
            <QuickActionCard actions={patientActions} />

          </div>
          <UpcomingAppointments
            children={
              upcoming.length === 0 ? (
                <div className="divide-y divide-gray-200 mt-5 text-gray-500 px-8">
                  <p>No upcoming visits</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcoming.slice(0, 3).map((appointment: Appointment) => (
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
                        <AppointmentStatusBadge status={appointment.status} />
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
        </>
      )}
    </div>
  );
}
