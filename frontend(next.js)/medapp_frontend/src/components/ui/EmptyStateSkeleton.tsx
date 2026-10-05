import { FiPlus } from "react-icons/fi";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export function EmptyStateSkeleton({
  title,
  description,
  actionLabel = "Create",
  onAction,
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white border rounded-xl">

      {/* TITLE */}
      <h3 className="text-lg font-semibold text-gray-700">
        {title}
      </h3>

      {/* DESCRIPTION */}
      {description && (
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      )}

      {/* ACTION BUTTON */}
      {showAction && onAction && (
        <button
          onClick={onAction}
          aria-label={`${actionLabel}`}
          className="mt-4 flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlus aria-hidden="true"/>
          {actionLabel}
        </button>
      )}
    </div>
  );
}