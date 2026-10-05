
import DataTable from "@/components/ui/DataTable";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePatientsByAdmin } from "@/hooks/useAdmin";
import { usePatientByAdminMutations } from "@/mutations/useAdminMutations";
import { capitalizeName } from "@/lib/capitalizeName";
import PatientForm from "@/components/forms/PatientForm";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { Patient, patientFields } from "@/types/patients";
import { PatientsView } from "@/types/view";
import { useState, useEffect } from "react";
import DetailsDashboard from "@/components/ui/DetailsDashboard";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function PatientsPage() {
  const { data: patients = [], isLoading } = usePatientsByAdmin();
  const queryClient = useQueryClient();
  const { updatePatient } = usePatientByAdminMutations();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<PatientsView>({ mode: "list" });
  const [searching, setSearching] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientIds, setSelecteedPatientIds] = useState<string[]>([]);

  const shouldWaitForDebounce = searching && search.trim() !== "";
  const isFormOpen = view.mode === "edit";
  const safePatients = Array.isArray(patients) ? patients : [];
  const normalizedSearch = debouncedSearch.toLowerCase();
  const filteredPatients = safePatients.filter((ass) => {
    return (
      ass.firstName.toLowerCase().includes(normalizedSearch) ||
      ass.lastName.toLowerCase().includes(normalizedSearch) ||
      ass.email.toLowerCase().includes(normalizedSearch)
    );
  });
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  useEffect(() => {
    if (search.trim() === "") {
      setDebouncedSearch("");
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setSearching(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [search]);

  if (isLoading) {
    return <AreaContentSkeleton />;
  }

  if (view.mode === "details") {
    return (
      <DetailsDashboard
        title="Patient Details"
        entity={view.patient}
        fields={patientFields}
        onBack={() => setView({ mode: "list" })}
        onSave={async (updatedPatient) => {
          toast.promise(
            updatePatient.mutateAsync({
              id: view.patient.id,
              patient: updatedPatient,
            }),
            {
              loading: "Updating patient...",
              success: "Patient updated successfully.",
              error: "Unable to update patient.",
            },
          );
          const refreshedPatient = queryClient
            .getQueryData<Patient[]>(["patients"])
            ?.find((d) => d.id === view.patient.id);

          if (refreshedPatient) {
            setView({
              mode: "details",
              patient: refreshedPatient,
            });
          } else {
            setView({ mode: "list" });
          }
        }}
        onDelete={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
      />
    );
  }
  const columns = [
    {
      header: "Patient",
      render: (patient: Patient) => `${capitalizeName(patient.firstName)} ${capitalizeName(patient.lastName)}`,
      sortValue:(patient: Patient) => `${capitalizeName(patient.firstName)} ${capitalizeName(patient.lastName)}`,
    },
    {
      header: "Email",
      render: (patient: Patient) => `${patient.email}`,
      sortValue:(patient: Patient) => `${patient.email}`,
    },
    {
      header: "Phone",
      render: (patient: Patient) => `${patient.phone}`,
      sortValue:(patient: Patient) => `${patient.phone}`,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (patient: Patient) => (
        <TableActions
          onView={() =>
            setView({
              mode: "details",
              patient: patient,
            })
          }
          onEdit={() =>
            setView({
              mode: "edit",
              patient: patient,
            })
          }
        />
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients Page"
        description="Have a look of all registered patients."
        search={search}
        searching={searching}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search patients..."
      />
      <PatientForm
        open={view.mode === "edit"}
        patient={view.mode === "edit" ? view.patient : undefined}
        onClose={() => {
          setView({ mode: "list" });
          setSelectedPatient(null);
        }}
        onSuccess={async () => {
          setView({ mode: "list" });
          setSelectedPatient(null);
        }}
      />
      {shouldWaitForDebounce ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Filtering patients...
        </div>
      ) : !isFormOpen && filteredPatients.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <EmptyStateSkeleton
            title="No patients found"
            description="Try adjusting your search."
          />
        </div>
      ) : (
        !isFormOpen && (
          <>
          <ErrorBoundary>
            <DataTable
              data={paginatedPatients}
              columns={columns}
              keyExtractor={(patient) => patient.id}
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
  );
}
