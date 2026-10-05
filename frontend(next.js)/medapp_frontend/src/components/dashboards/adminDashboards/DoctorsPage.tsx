import { useEffect, useMemo, useState } from "react";
import { Doctor, doctorFields } from "@/types/doctor";
import { FiDownload, FiPlus } from "react-icons/fi";
import { useDoctorsByAdmin } from "@/hooks/useAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { useDoctorByAdminMutations } from "@/mutations/useAdminMutations";
import { capitalizeName } from "@/lib/capitalizeName";
import DataTableBulkActions from "@/components/ui/DataTableBulkActions";
import TableFilters from "@/components/ui/TableFilter";
import { exportToCsv } from "@/lib/exportCSV";
import DoctorForm from "@/components/forms/DoctorForm";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { DoctorsView } from "@/types/view";
import { toast } from "sonner";
import DetailsDashboard from "@/components/ui/DetailsDashboard";
import ErrorBoundary from "@/components/ui/Error.Boundary";

type SortDirection = "asc" | "desc";
type SortableColumn = {
  key?: keyof Doctor;
  header: string;
  sortable?: boolean;
  render: (doctor: Doctor) => React.ReactNode;
  className?: string;
};

export default function DoctorsPage() {
  const { data: doctors = [], isLoading } = useDoctorsByAdmin();
  const queryClient = useQueryClient();
  const {
    updateDoctor,
    restoreDoctor,
    deleteDoctor,
    hardDeleteDoctor,
    bulkActivateDoctors,
    bulkDeactivateDoctors,
    bulkDeleteDoctors,
  } = useDoctorByAdminMutations();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState<DoctorsView>({ mode: "list" });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState(false);
  const [bulkActivateOpen, setBulkActivateOpen] = useState(false);
  const [doctorToReactivate, setDoctorToReactivate] = useState<Doctor | null>(
    null,
  );
  const [doctorToDeactivate, setDoctorToDeactivate] = useState<Doctor | null>(
    null,
  );
  const [loadingAction, setLoadingAction] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Doctor | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const safeDoctors = Array.isArray(doctors) ? doctors : [];
  const normalizedSearch = debouncedSearch.toLowerCase();
  const filteredDoctors = safeDoctors.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(normalizedSearch) ||
      doc.email.toLowerCase().includes(normalizedSearch) ||
      doc.specialty?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && doc.active) ||
      (statusFilter === "inactive" && !doc.active);

    const matchesSpecialty =
      specialtyFilter === "all" || doc.specialty === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });
  const sortedDoctors = useMemo(() => {
    const result = [...filteredDoctors];
    if (!sortKey) {
      return result;
    }
    result.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (valueA === null || valueA === undefined) {
        return 1;
      }
      if (valueB === null || valueB === undefined) {
        return -1;
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      const comparison = String(valueA).localeCompare(
        String(valueB),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [filteredDoctors, sortKey, sortDirection]);
  const totalPages = Math.ceil(sortedDoctors.length / pageSize) || 1;
  const paginatedDoctors = sortedDoctors.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const shouldWaitForDebounce = searching && search.trim() !== "";
  const isFormOpen = view.mode === "create" || view.mode === "edit";
  const specialties = useMemo(() => {
    return Array.from(
      new Set(safeDoctors.map((doctor) => doctor.specialty).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [safeDoctors]);

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
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const handleSort = (key: keyof Doctor) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setPage(1);
  };

  const handleResetSorting = () => {
    setStatusFilter("all");
    setSpecialtyFilter("all");
    setSortKey(null);
    setSortDirection("desc");
    setPage(1);
  };

  const handleBulkActivate = async () => {
    if (!selectedDoctorIds.length) return;
    try {
      toast.promise(bulkActivateDoctors.mutateAsync(selectedDoctorIds), {
        loading: "Activating doctors...",
        success: "Doctors activated successfully.",
        error: "Unable to activate doctors.",
      });

      setSelectedDoctorIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!selectedDoctorIds.length) return;

    try {
      toast.promise(bulkDeactivateDoctors.mutateAsync(selectedDoctorIds), {
        loading: "Deactivating doctors...",
        success: "Doctors deactivated successfully.",
        error: "Unable to deactivate doctors.",
      });

      setSelectedDoctorIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedDoctorIds.length) return;
    try {
      toast.promise(bulkDeleteDoctors.mutateAsync(selectedDoctorIds), {
        loading: "Deleting doctors...",
        success: "Doctors deleted successfully.",
        error: "Unable to delete doctors.",
      });
      setSelectedDoctorIds([]);
      setBulkDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportDoctors = () => {
    if (!filteredDoctors.length) {
      toast.warning("There are no doctors to export.");
      return;
    }
    const exportData = filteredDoctors.map((doctor) => ({
      FirstName: doctor.firstName,
      LastName: doctor.lastName,
      Email: doctor.email,
      Phone: doctor.phone,
      Specialty: doctor.specialty,
      ExperienceYears: doctor.experienceYears,
      ConsultationDuration: doctor.consultationDuration,
      Status: doctor.active ? "Active" : "Inactive",
    }));

    const exportPromise = new Promise<void>((resolve, reject) => {
      try {
        exportToCsv("doctors.csv", exportData);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(exportPromise, {
      loading: "Exporting doctors...",
      success: `CSV download started — ${filteredDoctors.length} doctors.`,
      error: "Unable to export doctors.",
    });
  };

  if (isLoading) {
    return <AreaContentSkeleton />;
  }
  if (view.mode === "details") {
    return (
      <DetailsDashboard
        title="Doctor Details"
        entity={view.doctor}
        fields={doctorFields}
        onBack={() => setView({ mode: "list" })}
        onSave={async (updatedDoctorData) => {
          toast.promise(
            updateDoctor.mutateAsync({
              id: view.doctor.id,
              doctor: updatedDoctorData,
            }),
            {
              loading: "Updating doctor...",
              success: "Doctor updated successfully.",
              error: "Unable to update doctor.",
            },
          );
          const refreshedDoctor = queryClient
            .getQueryData<Doctor[]>(["doctors"])
            ?.find((d) => d.id === view.doctor.id);

          if (refreshedDoctor) {
            setView({
              mode: "details",
              doctor: refreshedDoctor,
            });
          } else {
            setView({ mode: "list" });
          }
        }}
        onDelete={async () => {
          toast.promise(hardDeleteDoctor.mutateAsync(view.doctor.id), {
            loading: "Deleting doctor...",
            success: "Doctor deleted successfully.",
            error: "Unable to delete doctor.",
          });

          setView({ mode: "list" });
        }}
      />
    );
  }
  const columns: SortableColumn[] = [
    {
      key: "firstName",
      header: "Doctor",
      sortable: true,
      render: (doctor) => `${doctor.firstName} ${doctor.lastName}`,
    },

    {
      key: "specialty",
      header: "Specialty",
      sortable: true,
      render: (doctor) => doctor.specialty,
    },

    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (doctor) => doctor.email,
    },

    {
      key: "phone",
      header: "Phone",
      sortable: false,
      render: (doctor) => doctor.phone,
    },

    {
      key: "active",
      header: "Status",
      sortable: true,
      render: (doctor) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            doctor.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {doctor.active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      header: "Actions",
      sortable: false,
      className: "text-right",
      render: (doctor) => (
        <TableActions
          onView={() =>
            setView({
              mode: "details",
              doctor,
            })
          }
          onEdit={() =>
            setView({
              mode: "edit",
              doctor,
            })
          }
          onDelete={
            doctor.active ? () => setDoctorToDeactivate(doctor) : undefined
          }
          onRestore={
            !doctor.active ? () => setDoctorToReactivate(doctor) : undefined
          }
        />
      ),
    },
  ];
  return (
    <>
      <ConfirmDialog
        open={doctorToReactivate !== null}
        title="Reactivate Doctor"
        description={`Are you sure you want to reactivate Dr. ${capitalizeName(doctorToReactivate?.firstName)} ${capitalizeName(doctorToReactivate?.lastName)}?`}
        variant="success"
        confirmLabel="Reactivate"
        loading={loadingAction}
        onCancel={() => setDoctorToReactivate(null)}
        onConfirm={async () => {
          if (!doctorToReactivate) return;
          try {
            setLoadingAction(true);
            toast.promise(restoreDoctor.mutateAsync(doctorToReactivate.id), {
              loading: "Reactivating doctor...",
              success: "Doctor reactivated successfully.",
              error: "Unable to reactivate doctor.",
            });
            setDoctorToReactivate(null);
          } finally {
            setLoadingAction(false);
          }
        }}
      />
      <ConfirmDialog
        open={doctorToDeactivate !== null}
        title="Deactivate Doctor"
        description={`Are you sure you want to deactivate Dr. ${capitalizeName(doctorToDeactivate?.firstName)} ${capitalizeName(doctorToDeactivate?.lastName)}?`}
        variant="warning"
        confirmLabel="Deactivate"
        loading={loadingAction}
        onCancel={() => setDoctorToDeactivate(null)}
        onConfirm={async () => {
          if (!doctorToDeactivate) return;
          try {
            setLoadingAction(true);
            toast.promise(deleteDoctor.mutateAsync(doctorToDeactivate.id), {
              loading: "Deactiving doctor...",
              success: "Doctor deactivated successfully.",
              error: "Unable to deactivate doctor.",
            });
            setDoctorToDeactivate(null);
          } finally {
            setLoadingAction(false);
          }
        }}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Doctors"
        description={`Are you sure you want to permanently delete ${selectedDoctorIds.length} doctors? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        loading={hardDeleteDoctor.isPending}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
      <ConfirmDialog
        open={bulkDeactivateOpen}
        title="Deactivate Doctors"
        description={`Are you sure you want to deactivate ${selectedDoctorIds.length} doctors?`}
        variant="warning"
        confirmLabel="Deactivate"
        loading={bulkDeactivateDoctors.isPending}
        onCancel={() => setBulkDeactivateOpen(false)}
        onConfirm={handleBulkDeactivate}
      />
      <ConfirmDialog
        open={bulkActivateOpen}
        title="Activate Doctors"
        description={`Are you sure you want to activate ${selectedDoctorIds.length} doctors?`}
        variant="success"
        confirmLabel="Activate"
        loading={bulkActivateDoctors.isPending}
        onCancel={() => setBulkActivateOpen(false)}
        onConfirm={handleBulkActivate}
      />
      <div className="space-y-6">
        <PageHeader
          title="Doctors Management"
          description="Manage all registered doctors"
          search={search}
          searching={searching}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search doctors..."
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Export to CSV file"
                onClick={handleExportDoctors}
                disabled={filteredDoctors.length === 0}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiDownload aria-hidden="true"/>
                Export CSV
              </button>

              <button
                type="button"
                aria-label="Add Doctor"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-900 to-blue-500 px-4 py-2 text-white transition hover:from-indigo-800 hover:to-blue-600"
                onClick={() => {
                  setView({ mode: "create" });
                }}
              >
                <FiPlus aria-hidden="true"/>
                Add Doctor
              </button>
            </div>
          }
        />
        <TableFilters
          filters={[
            {
              label: "Status",
              value: statusFilter,
              options: [
                {
                  label: "Active",
                  value: "active",
                },
                {
                  label: "Inactive",
                  value: "inactive",
                },
              ],
              onChange: (value) => {
                setStatusFilter(value as "all" | "active" | "inactive");
                setPage(1);
              },
            },
            {
              label: "Specialty",
              value: specialtyFilter,
              options: specialties.map((specialty) => ({
                label: specialty,
                value: specialty,
              })),
              onChange: (value) => {
                setSpecialtyFilter(value);
                setPage(1);
              },
            },
          ]}
          onClear={() => {
            setStatusFilter("all");
            setSpecialtyFilter("all");
            setPage(1);
          }}
        />
        <DoctorForm
          open={isFormOpen}
          doctor={view.mode === "edit" ? view.doctor : undefined}
          onClose={() => {
            setView({ mode: "list" });
            setSelectedDoctor(null);
          }}
          onSuccess={async () => {
            setView({ mode: "list" });
            setSelectedDoctor(null);
          }}
        />
        {shouldWaitForDebounce ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Filtering doctors...
          </div>
        ) : !isFormOpen && filteredDoctors.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <EmptyStateSkeleton
              title="No doctors found"
              description="Try adjusting your search."
              onAction={() => setView({ mode: "create" })}
            />
          </div>
        ) : (
          !isFormOpen && (
            <>
              <DataTableBulkActions
                selectedCount={selectedDoctorIds.length}
                onClear={() => setSelectedDoctorIds([])}
                onActivate={() => handleBulkActivate()}
                onDeactivate={() => handleBulkDeactivate()}
                onDelete={() => handleBulkDelete()}
              />
              <ErrorBoundary>
              <DataTable
                data={paginatedDoctors}
                columns={columns}
                keyExtractor={(doctor) => doctor.id}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                onClear={handleResetSorting}
                selectable
                selectedIds={selectedDoctorIds}
                onSelectionChange={setSelectedDoctorIds}
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
