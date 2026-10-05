import {
  FiEdit2,
  FiEye,
  FiTrash2,
  FiRotateCcw,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;

  viewDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  restoreDisabled?: boolean;
  rescheduleDisabled?: boolean;
  cancelDisabled?: boolean;
}

export default function TableActions({
  onView,
  onEdit,
  onDelete,
  onRestore,
  onReschedule,
  onCancel,
  viewDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  restoreDisabled = false,
  rescheduleDisabled = false,
  cancelDisabled = false,
}: TableActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      {onView && (
        <button
          onClick={onView}
          aria-label="View Details"
          disabled={viewDisabled}
          className="p-2 cursor-pointer rounded-lg text-violet-700 hover:bg-green-50 transition disabled:opacity-40"
          title="View"
        >
          <FiEye size={18} aria-hidden="true"/>
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit"
          disabled={editDisabled}
          className="p-2 cursor-pointer rounded-lg text-blue-600 hover:bg-blue-50 transition disabled:opacity-40"
          title="Edit"
        >
          <FiEdit2 size={18} aria-hidden="true"/>
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Disable"
          disabled={deleteDisabled}
          className="p-2 cursor-pointer rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-40"
          title="Delete"
        >
          <FiTrash2 size={18} aria-hidden="true"/>
        </button>
      )}

      {onRestore && (
        <button
          onClick={onRestore}
          aria-label="Restore"
          disabled={restoreDisabled}
          title="Restore"
          className="p-2 cursor-pointer rounded-lg text-green-600 hover:bg-emerald-50 transition disabled:opacity-40"
        >
          <FiRotateCcw size={18} aria-hidden="true"/>
        </button>
      )}

      {onReschedule && (
        <button
          onClick={onReschedule}
          aria-label="Reschedule"
          disabled={rescheduleDisabled}
          title="Reschedule"
          className="p-2 cursor-pointer rounded-lg text-yellow-600 hover:bg-emerald-50 transition disabled:opacity-40"
        >
          <FiClock size={18} aria-hidden="true"/>
        </button>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          aria-label="Cancel"
          disabled={cancelDisabled}
          title="Cancel"
          className="p-2 cursor-pointer rounded-lg text-red-600 hover:bg-emerald-50 transition disabled:opacity-40"
        >
          <FiXCircle size={18} aria-hidden="true"/>
        </button>
      )}
    </div>
  );
}
