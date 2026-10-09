import { useState, useEffect, useMemo } from "react";

import { capitalizeName } from "@/lib/capitalizeName";
import AppointmentForm from "@/components/forms/AppointmentForm";
import AppointmentDetailsPage from "@/components/ui/AppointmentDetailsDashboard";
import AppointmentStatusFilter, {
  matchesAppointmentStatus,
} from "@/components/ui/AppointmentFilterStatus";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { useAppoinmentsByAdmin } from "@/hooks/useAdmin";
import { useAppointmentsByAdminMutations } from "@/mutations/useAdminMutations";
import { Appointment } from "@/types/appointment";
import { AppointmentsView } from "@/types/view";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function AppointmentsPage() {
  const pageSize = 5;
  const { data: appointments = [], isLoading } = useAppoinmentsByAdmin();
  const { cancelAppointment } = useAppointmentsByAdminMutations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<
    string[]
  >([]);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [view, setView] = useState<AppointmentsView>({
    mode: "list",
  });
  const normalizedSearch = (
    search.trim() === "" ? "" : debouncedSearch
  ).toLowerCase();

  const searching = search.trim() !== "" && search !== debouncedSearch;
  const safeAppointments = useMemo(
    () => (Array.isArray(appointments) ? appointments : []),
    [appointments],
  );
  const filteredAppointments = safeAppointments.filter((app) => {
    const matchesSearch =
      app.doctor.firstName.toLowerCase().includes(normalizedSearch) ||
      app.doctor.lastName.toLowerCase().includes(normalizedSearch) ||
      app.patient.firstName.toLowerCase().includes(normalizedSearch) ||
      app.patient.lastName.toLowerCase().includes(normalizedSearch);
    return matchesSearch && matchesAppointmentStatus(app.status, statusFilter);
  });
  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const shouldWaitForDebounce = searching;
  const isFormOpen = view.mode === "create" || view.mode === "edit";

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

  const editAppointment =
    view.mode === "edit" ? (view.appointment as Appointment) : undefined;

  if (view.mode === "details") {
    return (
      <AppointmentDetailsPage
        appointment={view.appointment}
        onBack={() => setView({ mode: "list" })}
        onDelete={async () => setAppointmentToCancel(view.appointment)}
        onUpdated={async () => {
          setView({ mode: "details", appointment: view.appointment });
        }}
      />
    );
  }
  const columns = [
    {
      header: "Patient",
      render: (appointment: Appointment) =>
        `${capitalizeName(appointment.patient.firstName)} ${capitalizeName(appointment.patient.lastName)}`,
      sortValue: (appointment: Appointment) =>
        `${capitalizeName(appointment.patient.firstName)} ${capitalizeName(appointment.patient.lastName)}`,
    },
    {
      header: "Doctor",
      render: (appointment: Appointment) =>
        `${capitalizeName(appointment.doctor.firstName)} ${capitalizeName(appointment.doctor.lastName)}`,
      sortValue: (appointment: Appointment) =>
        `${capitalizeName(appointment.doctor.firstName)} ${capitalizeName(appointment.doctor.lastName)}`,
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
          onReschedule={
            appointment.status === "CONFIRMED"
              ? () =>
                  setView({
                    mode: "reschedule",
                    appointment,
                  })
              : undefined
          }
          onCancel={
            appointment.status === "CONFIRMED"
              ? () => setAppointmentToCancel(appointment)
              : undefined
          }
        />
      ),
    },
  ];
  return (
    <>
      <ConfirmDialog
        open={appointmentToCancel !== null}
        title="Cancel appointment ?"
        description={`Are you sure you want to cancel the appointment of ${capitalizeName(appointmentToCancel?.patient.firstName)} ${capitalizeName(appointmentToCancel?.patient.lastName)} with Dr.${capitalizeName(appointmentToCancel?.doctor.firstName)} ${capitalizeName(appointmentToCancel?.doctor.lastName)}?`}
        variant="danger"
        confirmLabel="Cancel"
        loading={loadingAction}
        onCancel={() => setAppointmentToCancel(null)}
        onConfirm={async () => {
          if (!appointmentToCancel) return;
          try {
            setLoadingAction(true);
            toast.promise(
              cancelAppointment.mutateAsync(appointmentToCancel.id),
              {
                loading: "Cancelling appointment...",
                success: "Appointment successfully.",
                error: "Unable to cancel appointment.",
              },
            );
            setAppointmentToCancel(null);
          } finally {
            setLoadingAction(false);
          }
        }}
      />
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
          searchPlaceholder="Search doctors..."
          actions={
            <button
              aria-label="Add Appointment"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => {
                setView({ mode: "create" });
              }}
            >
              <FiPlus aria-hidden="true" />
              Add Appointment
            </button>
          }
        />
        <AppointmentForm
          open={isFormOpen}
          mode={view.mode}
          appointment={editAppointment}
          onClose={() => setView({ mode: "list" })}
          onSuccess={async () => {
            setView({ mode: "list" });
          }}
        />
        <AppointmentStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />
        {shouldWaitForDebounce ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Filtering appointments...
          </div>
        ) : !isFormOpen && filteredAppointments.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <EmptyStateSkeleton
              title="No appointments found"
              description="Try adjusting your search."
              onAction={() => setView({ mode: "create" })}
            />
          </div>
        ) : (
          !isFormOpen && (
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
          )
        )}
      </div>
    </>
  );
}
