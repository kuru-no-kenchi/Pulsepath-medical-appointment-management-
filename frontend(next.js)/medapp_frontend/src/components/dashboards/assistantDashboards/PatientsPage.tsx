
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import ErrorBoundary from "@/components/ui/Error.Boundary";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import DetailsDashboard from "@/components/ui/PatientDetails";
import TableActions from "@/components/ui/TableActions";
import { usePatientsByAssistant } from "@/hooks/useAssistant";
import { capitalizeName } from "@/lib/capitalizeName";
import { Patient } from "@/types/patients";
import { AssistantPatientsView } from "@/types/view";
import { useState, useEffect } from "react";

export default function AssPatientsPage() {
  const { data: patients = [], isLoading } = usePatientsByAssistant();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selecteablePatientIds, setSelectablePatientIds] = useState<string[]>(
    [],
  );
  const [view, setView] = useState<AssistantPatientsView>({ mode: "list" });
  const safePatients = Array.isArray(patients) ? patients : [];
  const filteredPatients = safePatients.filter((pat) => {
    const searchValue = search.toLowerCase();
    return (
      pat.firstName.toLowerCase().includes(searchValue) ||
      pat.lastName.toLowerCase().includes(searchValue)
    );
  });
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const shouldWaitForDebounce = searching && search.trim() !== "";
  const columns = [
    {
      header: "Patient",
      render: (patient: Patient) =>
        `${capitalizeName(patient.firstName)} ${capitalizeName(patient.lastName)}`,
      sortValue: (patient: Patient) =>
        `${capitalizeName(patient.firstName)} ${capitalizeName(patient.lastName)}`,
    },
    {
      header: "Email",
      render: (patient: Patient) => `${patient.email}`,
      sortValue: (patient: Patient) => `${patient.email}`,
    },
    {
      header: "Phone",
      render: (patient: Patient) => `${patient.phone}`,
      sortValue: (patient: Patient) => `${patient.phone}`,
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
        />
      ),
    },
  ];

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

  if (isLoading) return <AreaContentSkeleton />;
  if (view.mode === "details") {
    return (
      <DetailsDashboard
        patient={view.patient}
        onBack={() => setView({ mode: "list" })}
      />
    );
  }
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
      {shouldWaitForDebounce ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Filtering patients...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <EmptyStateSkeleton
            title="No patients found"
            description="Try adjusting your search."
          />
        </div>
      ) : (
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
      )}
    </div>
  );
}
