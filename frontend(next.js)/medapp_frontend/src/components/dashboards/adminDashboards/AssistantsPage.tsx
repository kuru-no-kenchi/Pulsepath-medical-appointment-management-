import { useEffect, useMemo, useState } from "react";
import { Assistant, assistantFields } from "@/types/assistant";
import { FiDownload, FiPlus } from "react-icons/fi";
import { useAssistantsByAdmin } from "@/hooks/useAdmin";
import { useAssistantByAdminMutations } from "@/mutations/useAdminMutations";
import { capitalizeName } from "@/lib/capitalizeName";
import DataTableBulkActions from "@/components/ui/DataTableBulkActions";
import TableFilters from "@/components/ui/TableFilter";
import { exportToCsv } from "@/lib/exportCSV";
import AssistantForm from "@/components/forms/AssistantForm";
import AreaContentSkeleton from "@/components/ui/AreaContentSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import { EmptyStateSkeleton } from "@/components/ui/EmptyStateSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TableActions from "@/components/ui/TableActions";
import { AssistantsView } from "@/types/view";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DetailsDashboard from "@/components/ui/DetailsDashboard";
import AssignedDoctorsCard from "@/components/ui/AssignedDoctorCard";
import ErrorBoundary from "@/components/ui/Error.Boundary";

type SortDirection = "asc" | "desc";
type SortableColumn = {
  key?: keyof Assistant;
  header: string;
  sortable?: boolean;
  render: (assistant: Assistant) => React.ReactNode;
  className?: string;
};

export default function AssistantsPage() {
  const { data: assistants = [], isLoading } = useAssistantsByAdmin();
  const queryClient = useQueryClient();
  const {
    updateAssistant,
    restoreAssistant,
    deleteAssistant,
    hardDeleteAssistant,
    bulkActivateAssistants,
    bulkDeactivateAssistants,
    bulkDeleteAssistants,
  } = useAssistantByAdminMutations();
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>(
    [],
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [, setSelectedAssistant] = useState<Assistant | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState(false);
  const [bulkActivateOpen, setBulkActivateOpen] = useState(false);
  const [assistantToReactivate, setAssistantToReactivate] =
    useState<Assistant | null>(null);
  const [assistantToDeactivate, setAssistantToDeactivate] =
    useState<Assistant | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [view, setView] = useState<AssistantsView>({ mode: "list" });
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortKey, setSortKey] = useState<keyof Assistant | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const safeAssistants = useMemo(
    () => (Array.isArray(assistants) ? assistants : []),
    [assistants],
  );
  const filteredAssistants = safeAssistants.filter((ass) => {
    const fullName = `${ass.firstName} ${ass.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(normalizedSearch) ||
      ass.email.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && ass.active) ||
      (statusFilter === "inactive" && !ass.active);

    return matchesSearch && matchesStatus;
  });
  const normalizedSearch = (
    search.trim() === "" ? "" : debouncedSearch
  ).toLowerCase();

  const searching = search.trim() !== "" && search !== debouncedSearch;
  const sortedAssistants = useMemo(() => {
    const result = [...filteredAssistants];
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
  }, [filteredAssistants, sortKey, sortDirection]);
  const totalPages = Math.ceil(sortedAssistants.length / pageSize) || 1;
  const paginatedAssistants = sortedAssistants.slice(
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

  const handleSort = (key: keyof Assistant) => {
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
    setSortKey(null);
    setSortDirection("desc");
    setPage(1);
  };

  const handleBulkActivate = async () => {
    if (!selectedAssistantIds.length) return;
    try {
      toast.promise(bulkActivateAssistants.mutateAsync(selectedAssistantIds), {
        loading: "Activating Assistant...",
        success: "Assistant activated successfully.",
        error: "Unable to activate Assistant.",
      });

      setSelectedAssistantIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!selectedAssistantIds.length) return;

    try {
      toast.promise(
        bulkDeactivateAssistants.mutateAsync(selectedAssistantIds),
        {
          loading: "Deactivating Assistant...",
          success: "Assistant deactivated successfully.",
          error: "Unable to deactivate Assistant.",
        },
      );

      setSelectedAssistantIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedAssistantIds.length) return;
    try {
      toast.promise(bulkDeleteAssistants.mutateAsync(selectedAssistantIds), {
        loading: "Deleting Assistant...",
        success: "Assistant deleted successfully.",
        error: "Unable to delete Assistant.",
      });
      setSelectedAssistantIds([]);
      setBulkDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  const handleExportfilteredAssistants = () => {
    if (!filteredAssistants.length) {
      toast.warning("There are no assistants to export.");
      return;
    }
    const exportData = filteredAssistants.map((assistant) => ({
      FirstName: assistant.firstName,
      LastName: assistant.lastName,
      Email: assistant.email,
      Phone: assistant.phone,
      Status: assistant.active ? "Active" : "Inactive",
    }));

    const exportPromise = new Promise<void>((resolve, reject) => {
      try {
        exportToCsv("assistants.csv", exportData);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(exportPromise, {
      loading: "Exporting assistants...",
      success: `CSV download started — ${filteredAssistants.length} assistants.`,
      error: "Unable to export assistants.",
    });
  };

  if (isLoading) {
    return <AreaContentSkeleton />;
  }

  if (view.mode === "details") {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <DetailsDashboard
          title="Assistant Details"
          entity={view.assistant}
          fields={assistantFields}
          onBack={() => setView({ mode: "list" })}
          onSave={async (updatedAssistant) => {
            toast.promise(
              updateAssistant.mutateAsync({
                id: view.assistant.id,
                assistant: updatedAssistant,
              }),
              {
                loading: "Updating assistant...",
                success: "Assistant updated successfully.",
                error: "Unable to update assistant.",
              },
            );
            const refreshedAssistant = queryClient
              .getQueryData<Assistant[]>(["assistants"])
              ?.find((d) => d.id === view.assistant.id);

            if (refreshedAssistant) {
              setView({
                mode: "details",
                assistant: refreshedAssistant,
              });
            } else {
              setView({ mode: "list" });
            }
          }}
          onDelete={async () => {
            toast.promise(hardDeleteAssistant.mutateAsync(view.assistant.id), {
              loading: "Deleting assistant...",
              success: "Assistant deleted successfully.",
              error: "Unable to delete assistant.",
            });
            setView({ mode: "list" });
          }}
          extraSection={(editing) => (
            <AssignedDoctorsCard
              assistantId={view.assistant.id}
              editing={editing}
            />
          )}
        />
      </div>
    );
  }

  const columns: SortableColumn[] = [
    {
      key: "firstName",
      header: "Assistant",
      sortable: true,
      render: (assistant) => `${assistant.firstName} ${assistant.lastName}`,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (assistant) => assistant.email,
    },

    {
      key: "phone",
      header: "Phone",
      sortable: false,
      render: (assistant) => assistant.phone,
    },

    {
      key: "active",
      header: "Status",
      sortable: true,
      render: (assistant) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            assistant.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {assistant.active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      header: "Actions",
      sortable: false,
      className: "text-right",
      render: (assistant) => (
        <TableActions
          onView={() =>
            setView({
              mode: "details",
              assistant,
            })
          }
          onEdit={() =>
            setView({
              mode: "edit",
              assistant,
            })
          }
          onDelete={
            assistant.active
              ? () => setAssistantToDeactivate(assistant)
              : undefined
          }
          onRestore={
            !assistant.active
              ? () => setAssistantToReactivate(assistant)
              : undefined
          }
        />
      ),
    },
  ];

  return (
    <>
      <ConfirmDialog
        open={assistantToReactivate !== null}
        title="Reactivate assistant"
        description={`Are you sure you want to reactivate Dr. ${capitalizeName(assistantToReactivate?.firstName)} ${capitalizeName(assistantToReactivate?.lastName)}?`}
        variant="success"
        confirmLabel="Reactivate"
        loading={loadingAction}
        onCancel={() => setAssistantToReactivate(null)}
        onConfirm={async () => {
          if (!assistantToReactivate) return;
          try {
            setLoadingAction(true);
            toast.promise(
              restoreAssistant.mutateAsync(assistantToReactivate.id),
              {
                loading: "Reactivating assistant...",
                success: "assistant reactivated successfully.",
                error: "Unable to reactivate assistant.",
              },
            );

            setAssistantToReactivate(null);
          } finally {
            setLoadingAction(false);
          }
        }}
      />
      <ConfirmDialog
        open={assistantToDeactivate !== null}
        title="Deactivate assistant"
        description={`Are you sure you want to deactivate ${capitalizeName(assistantToDeactivate?.firstName)} ${capitalizeName(assistantToDeactivate?.lastName)}?`}
        variant="warning"
        confirmLabel="Deactivate"
        loading={loadingAction}
        onCancel={() => setAssistantToDeactivate(null)}
        onConfirm={async () => {
          if (!assistantToDeactivate) return;
          try {
            setLoadingAction(true);
            toast.promise(
              deleteAssistant.mutateAsync(assistantToDeactivate.id),
              {
                loading: "Deactiving assistant...",
                success: "assistant deactivated successfully.",
                error: "Unable to deactivate assistant.",
              },
            );
            setAssistantToDeactivate(null);
          } finally {
            setLoadingAction(false);
          }
        }}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Assistants"
        description={`Are you sure you want to permanently delete ${selectedAssistantIds.length} assistants? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        loading={hardDeleteAssistant.isPending}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
      <ConfirmDialog
        open={bulkDeactivateOpen}
        title="Deactivate Assistants"
        description={`Are you sure you want to deactivate ${selectedAssistantIds.length} assistants?`}
        variant="warning"
        confirmLabel="Deactivate"
        loading={bulkDeactivateAssistants.isPending}
        onCancel={() => setBulkDeactivateOpen(false)}
        onConfirm={handleBulkDeactivate}
      />
      <ConfirmDialog
        open={bulkActivateOpen}
        title="Activate Assistants"
        description={`Are you sure you want to activate ${selectedAssistantIds.length} assistants?`}
        variant="success"
        confirmLabel="Activate"
        loading={bulkActivateAssistants.isPending}
        onCancel={() => setBulkActivateOpen(false)}
        onConfirm={handleBulkActivate}
      />
      <div className="space-y-6">
        <PageHeader
          title="Assistants Page"
          description="Have a look of all registered appointments."
          search={search}
          searching={searching}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search assistants..."
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Export to CSV file"
                onClick={handleExportfilteredAssistants}
                disabled={filteredAssistants.length === 0}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiDownload aria-hidden="true" />
                Export CSV
              </button>

              <button
                type="button"
                aria-label="Add Assistant"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-900 to-blue-500 px-4 py-2 text-white transition hover:from-indigo-800 hover:to-blue-600"
                onClick={() => {
                  setView({ mode: "create" });
                }}
              >
                <FiPlus aria-hidden="true" />
                Add Assistant
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
          ]}
          onClear={() => {
            setStatusFilter("all");
            setPage(1);
          }}
        />
        <AssistantForm
          open={isFormOpen}
          assistant={view.mode === "edit" ? view.assistant : undefined}
          onClose={() => {
            setView({ mode: "list" });
            setSelectedAssistant(null);
          }}
          onSuccess={async () => {
            setView({ mode: "list" });
            setSelectedAssistant(null);
          }}
        />
        {shouldWaitForDebounce ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Filtering assistants...
          </div>
        ) : !isFormOpen && filteredAssistants.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <EmptyStateSkeleton
              title="No assistants found"
              description="Try adjusting your search."
              onAction={() => setView({ mode: "create" })}
            />
          </div>
        ) : (
          !isFormOpen && (
            <>
              <DataTableBulkActions
                selectedCount={selectedAssistantIds.length}
                onClear={() => setSelectedAssistantIds([])}
                onActivate={() => handleBulkActivate()}
                onDeactivate={() => handleBulkDeactivate()}
                onDelete={() => handleBulkDelete()}
              />
              <ErrorBoundary>
                <DataTable
                  data={paginatedAssistants}
                  columns={columns}
                  keyExtractor={(assistant) => assistant.id}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onClear={handleResetSorting}
                  selectable
                  selectedIds={selectedAssistantIds}
                  onSelectionChange={setSelectedAssistantIds}
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
