import { useEffect, useMemo, useState } from "react";
import { Patient } from "@/types/patients";
import { usePatientsByDoctor } from "@/hooks/useDoctor";
import { capitalizeName } from "@/lib/capitalizeName";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { PatientsView } from "@/types/view";
import DetailsDashboard from "@/components/ui/DoctorPatientDetails";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function DocPatientsPage() {
  const { data: patients = [], isLoading } = usePatientsByDoctor();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [view, setView] = useState<PatientsView>({ mode: "list" });

  const safePatients = useMemo(
    () => (Array.isArray(patients) ? patients : []),
    [patients],
  );
  const normalizedSearch = (
    search.trim() === "" ? "" : debouncedSearch
  ).toLowerCase();

  const searching = search.trim() !== "" && search !== debouncedSearch;
  const filteredPatients = safePatients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      fullName.includes(normalizedSearch) ||
      p.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const shouldWaitForDebounce = searching;
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
              selectable
              selectedIds={selectedPatientIds}
              onSelectionChange={setSelectedPatientIds}
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
