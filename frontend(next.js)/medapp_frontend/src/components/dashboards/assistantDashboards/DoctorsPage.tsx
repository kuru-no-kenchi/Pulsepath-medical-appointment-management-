import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import DataTable from "@/components/ui/DataTable";
import DetailsDashboard from "@/components/ui/DoctorDetails";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import ErrorBoundary from "@/components/ui/Error.Boundary";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { useDoctorsByAssistant } from "@/hooks/useAssistant";
import { capitalizeName } from "@/lib/capitalizeName";
import { AssistantDoctor } from "@/types/assistant";
import { AssistantDoctorsView } from "@/types/view";
import { useState, useEffect, useMemo } from "react";

export default function AssDoctorsPage() {
  const { data: doctors = [], isLoading } = useDoctorsByAssistant();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<AssistantDoctorsView>({ mode: "list" });
  const safeDoctors = useMemo(
    () => (Array.isArray(doctors) ? doctors : []),
    [doctors],
  );
  const normalizedSearch = (
    search.trim() === "" ? "" : debouncedSearch
  ).toLowerCase();

  const searching = search.trim() !== "" && search !== debouncedSearch;
  const filteredDoctors = safeDoctors.filter((doc) => {
    return (
      doc.fullName.toLowerCase().includes(normalizedSearch) ||
      doc.specialty.toLowerCase().includes(normalizedSearch)
    );
  });
  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const shouldWaitForDebounce = searching;
  const columns = [
    {
      header: "Doctor",
      render: (doctor: AssistantDoctor) => `${capitalizeName(doctor.fullName)}`,
      sortValue: (doctor: AssistantDoctor) =>
        `${capitalizeName(doctor.fullName)}`,
    },
    {
      header: "Specialty",
      render: (doctor: AssistantDoctor) => doctor.specialty,
      sortValue: (doctor: AssistantDoctor) => doctor.specialty,
    },
    {
      header: "Email",
      render: (doctor: AssistantDoctor) => `${doctor.email}`,
      sortValue: (doctor: AssistantDoctor) => `${doctor.email}`,
    },
    {
      header: "Phone",
      render: (doctor: AssistantDoctor) => `${doctor.phone}`,
      sortValue: (doctor: AssistantDoctor) => `${doctor.phone}`,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (doctor: AssistantDoctor) => (
        <TableActions
          onView={() =>
            setView({
              mode: "details",
              doctor: doctor,
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
        doctor={view.doctor}
        onBack={() => setView({ mode: "list" })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors Page"
        description="Have a look of all visited doctors."
        search={search}
        searching={searching}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search doctors..."
      />
      {shouldWaitForDebounce ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Filtering doctors...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <EmptyStateSkeleton
            title="No doctors found"
            description="Try adjusting your search."
          />
        </div>
      ) : (
        <>
          <ErrorBoundary>
            <DataTable
              data={paginatedDoctors}
              columns={columns}
              keyExtractor={(doctor) => doctor.id}
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
