import { useState, useEffect, useMemo } from "react";
import { Appointment } from "@/types/appointment";
import { AppointmentsView } from "@/types/view";
import AppointmentForm from "../../forms/AppointmentForm";
import { toast } from "sonner";
import { useAppoinmentsByAssistant } from "@/hooks/useAssistant";
import { useAppointmentsByAssistantMutations } from "@/mutations/useAssistantMutations";
import { capitalizeName } from "@/lib/capitalizeName";
import AppointmentStatusFilter, {
  matchesAppointmentStatus,
} from "@/components/ui/AppointmentFilterStatus";
import AssistantAppointmentDetails from "@/components/ui/AppointmentsDetails";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { FiPlus } from "react-icons/fi";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function AssAppointmentsPage() {
  const { data: appointments = [], isLoading } = useAppoinmentsByAssistant();
  const { cancelAppointmentByAssistant, markComplete, markNoShow } =
    useAppointmentsByAssistantMutations();
  const pageSize = 5;
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
  const rescheduleAppointment =
    view.mode === "reschedule" ? (view.appointment as Appointment) : undefined;
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
      app.doctor.firstName.toLowerCase().includes(normalizedSearch) ||
      app.doctor.lastName.toLowerCase().includes(normalizedSearch) ||
      app.patient.firstName.toLowerCase().includes(normalizedSearch) ||
      app.patient.lastName.toLowerCase().includes(normalizedSearch);
    return matchSearches && matchesAppointmentStatus(app.status, statusFilter);
  });
  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const shouldWaitForDebounce = searching;
  const isFormOpen =
    view.mode === "assistant_create" || view.mode === "reschedule";
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
      <AssistantAppointmentDetails
        appointment={view.appointment}
        onBack={() => setView({ mode: "list" })}
        onCancel={async () => setAppointmentToCancel(view.appointment)}
        onReschedule={async () => {
          try {
            setView({
              mode: "reschedule",
              appointment: view.appointment,
            });
          } catch (error) {
            console.error(error);
          }
        }}
        onComplete={async () => {
          try {
            toast.promise(markComplete.mutateAsync(view.appointment.id), {
              loading: "Marking appointment as complete...",
              success: "Appointment marked as complete successfully.",
              error: "Unable to mark appointment as complete.",
            });
            setView({ mode: "list" });
          } catch (error) {
            console.error(error);
          }
        }}
        onNoShow={async () => {
          try {
            toast.promise(markNoShow.mutateAsync(view.appointment.id), {
              loading: "Marking appointment as no show...",
              success: "Appointment marked as no show successfully.",
              error: "Unable to mark appointment as no show.",
            });
            setView({ mode: "list" });
          } catch (error) {
            console.error(error);
          }
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
      sortValue: (apppointment: Appointment) => apppointment.status,
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
              cancelAppointmentByAssistant.mutateAsync(appointmentToCancel.id),
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
          searchPlaceholder="Search appointments..."
          actions={
            <button
              aria-label="Add Appointment"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => {
                setView({ mode: "assistant_create" });
              }}
            >
              <FiPlus aria-hidden="true" />
              Add Appontment
            </button>
          }
        />
        <AppointmentForm
          open={isFormOpen}
          mode={view.mode}
          appointment={rescheduleAppointment}
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
