import { useState, useEffect, useMemo } from "react";

import { useAppointmentsByDoctor } from "@/hooks/useDoctor";
import { capitalizeName } from "@/lib/capitalizeName";
import AppointmentDetailsView from "@/components/ui/AppointmentDetailsView";
import { matchesAppointmentStatus } from "@/components/ui/AppointmentFilterStatus";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { Appointment } from "@/types/appointment";
import { AppointmentsView } from "@/types/view";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function DocAppointmentsPage() {
  const { data: appointments = [], isLoading } = useAppointmentsByDoctor();
  const pageSize = 5;
  const [statusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<
    string[]
  >([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<AppointmentsView>({
    mode: "list",
  });
  const safeAppointments = useMemo(
    () => (Array.isArray(appointments) ? appointments : []),
    [appointments],
  );
  const normalizedSearch = (
    search.trim() === "" ? "" : debouncedSearch
  ).toLowerCase();

  const searching = search.trim() !== "" && search !== debouncedSearch;
  const filteredAppointments = safeAppointments.filter((app) => {
    const matchSearches =
      app.patient.firstName.toLowerCase().includes(normalizedSearch) ||
      app.patient.lastName.toLowerCase().includes(normalizedSearch) ||
      app.assistant?.firstName.toLowerCase().includes(normalizedSearch) ||
      app.assistant?.lastName.toLowerCase().includes(normalizedSearch);
    return matchSearches && matchesAppointmentStatus(app.status, statusFilter);
  });
  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const shouldWaitForDebounce = searching && search.trim() !== "";
  const columns = [
    {
      header: "Patient",
      render: (appointment: Appointment) =>
        `${capitalizeName(appointment.patient.firstName)} ${capitalizeName(appointment.patient.lastName)}`,
      sortValue: (appointment: Appointment) =>
        `${capitalizeName(appointment.patient.firstName)} ${capitalizeName(appointment.patient.lastName)}`,
    },
    {
      header: "Assistant",
      render: (appointment: Appointment) =>
        `${capitalizeName(appointment.assistant?.firstName)} ${capitalizeName(appointment.assistant?.lastName)}`,
      sortValue: (appointment: Appointment) =>
        `${capitalizeName(appointment.assistant?.firstName)} ${capitalizeName(appointment.assistant?.lastName)}`,
    },
    {
      header: "Date",
      render: (appointment: Appointment) => `${appointment.appointmentDate}`,
      sortValue: (appointment: Appointment) => `${appointment.appointmentDate}`,
    },
    {
      header: "Status",
      render: (appointment: Appointment) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            appointment.status === "CONFIRMED"
              ? "bg-blue-100 text-blue-700"
              : appointment.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : appointment.status === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : appointment.status === "NO_SHOW"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {appointment.status}
        </span>
      ),
      sortValue: (appointment: Appointment) => appointment.status,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (appointment: Appointment) => (
        <TableActions
          onView={() =>
            setView({
              mode: "details",
              appointment: appointment,
            })
          }
        />
      ),
    },
  ];
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search),
      search.trim() === "" ? 0 : 450,
    );

    return () => window.clearTimeout(timer);
  }, [search]);

  if (isLoading) {
    return <AreaContentSkeleton />;
  }

  if (view.mode === "details") {
    return (
      <AppointmentDetailsView
        appointment={view.appointment}
        onBack={() => setView({ mode: "list" })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments Page"
        description="Have a look of all your booked appointments."
        search={search}
        searching={searching}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search appointments..."
      />
      {shouldWaitForDebounce ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Filtering appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <EmptyStateSkeleton
            title="No appointments found"
            description="Try adjusting your search."
          />
        </div>
      ) : (
        <>
          <ErrorBoundary>
            <DataTable
              data={paginatedAppointments}
              columns={columns}
              keyExtractor={(appointment) => appointment.id}
              selectable
              selectedIds={selectedAppointmentIds}
              onSelectionChange={setSelectedAppointmentIds}
            />
          </ErrorBoundary>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
