import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import ErrorBoundary from "@/components/ui/Error.Boundary";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import DetailsDashboard from "@/components/ui/PatientDoctorDetails";
import TableActions from "@/components/ui/TableActions";
import { useDoctorsByPatient } from "@/hooks/usePatients";
import { capitalizeName } from "@/lib/capitalizeName";
import { PatientDoctorView } from "@/types/patients";
import { PatientDoctorsView } from "@/types/view";
import { useState, useEffect, useMemo } from "react";

export default function PatDoctorsPage() {
  const { data: doctors = [], isLoading } = useDoctorsByPatient();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<PatientDoctorsView>({ mode: "list" });

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
      doc.firstName.toLowerCase().includes(normalizedSearch) ||
      doc.lastName.toLowerCase().includes(normalizedSearch) ||
      doc.specialty.toLowerCase().includes(normalizedSearch)
    );
  });
  const shouldWaitForDebounce = searching;
  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const columns = [
    {
      header: "Doctor",
      render: (doctor: PatientDoctorView) =>
        `${capitalizeName(doctor.firstName)} ${capitalizeName(doctor.lastName)}`,
      sortValue: (doctor: PatientDoctorView) =>
        `${capitalizeName(doctor.firstName)} ${capitalizeName(doctor.lastName)}`,
    },
    {
      header: "Specialty",
      render: (doctor: PatientDoctorView) => doctor.specialty,
      sortValue: (doctor: PatientDoctorView) => doctor.specialty,
    },
    {
      header: "Email",
      render: (doctor: PatientDoctorView) => `${doctor.email}`,
      sortValue: (doctor: PatientDoctorView) => `${doctor.email}`,
    },
    {
      header: "Phone",
      render: (doctor: PatientDoctorView) => `${doctor.phone}`,
      sortValue: (doctor: PatientDoctorView) => `${doctor.phone}`,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (doctor: PatientDoctorView) => (
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
