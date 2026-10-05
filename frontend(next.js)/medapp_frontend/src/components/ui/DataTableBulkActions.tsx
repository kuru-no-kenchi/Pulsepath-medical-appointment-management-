import { FiCheck, FiTrash2, FiX } from "react-icons/fi";

interface DataTableBulkActionsProps {
  selectedCount: number;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  onClear: () => void;
}

export default function DataTableBulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
}: DataTableBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="font-medium text-indigo-900">
          {selectedCount} selected
        </span>

        <button
          type="button"
          onClick={onClear}
          aria-label="Clear Selection"
          className="text-gray-500 hover:text-gray-700"
          title="Clear selection"
        >
          <FiX aria-hidden="true"/>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onActivate && (
          <button
            type="button"
            aria-label="Activate"
            onClick={onActivate}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-800 to-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            <FiCheck aria-hidden="true"/>
            Activate
          </button>
        )}

        {onDeactivate && (
          <button
            type="button"
            aria-label="Deactivate"
            onClick={onDeactivate}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-800 to-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition"
          >
            <FiX aria-hidden="true"/>
            Deactivate
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            aria-label="Delete"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-900 to-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            <FiTrash2 aria-hidden="true"/>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}