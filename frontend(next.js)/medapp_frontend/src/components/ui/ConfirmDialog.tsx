import { useEffect } from "react";
import {
  FiAlertTriangle,
  FiTrash2,
  FiCheckCircle,
  FiHelpCircle,
  FiX,
} from "react-icons/fi";

type ConfirmVariant = "danger" | "warning" | "success" | "primary";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    icon: FiTrash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    headerStyle:
      "rounded-2x1 text-white bg-gradient-to-r from-red-900 to-red-500 flex items-center justify-between border-b px-6 py-4",
    button:
      "bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white",
  },

  warning: {
    icon: FiAlertTriangle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    headerStyle:
      "rounded-2x1 text-white bg-gradient-to-r from-amber-900 to-orange-500 flex items-center justify-between border-b px-6 py-4",
    button:
      "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white",
  },

  success: {
    icon: FiCheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    headerStyle:
      "rounded-2x1 text-white bg-gradient-to-r from-emerald-900 to-green-500 flex items-center justify-between border-b px-6 py-4",
    button:
      "bg-gradient-to-r from-green-700 to-green-500 hover:from-green-800 hover:to-green-600 text-white",
  },

  primary: {
    icon: FiHelpCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    headerStyle:
      "rounded-2x1 text-white bg-gradient-to-r from-inigo-900 to-blue-500 flex items-center justify-between border-b px-6 py-4",
    button:
      "bg-gradient-to-r from-indigo-900 to-blue-500 hover:from-indigo-950 hover:to-blue-600 text-white",
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, loading, onCancel]);

  if (!open) return null;
  const style = variantStyles[variant];
  const Icon = style.icon;
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-scaleIn overflow-hidden"
      >
        {/* Header */}
        <div className={`${style.headerStyle}`}>
          <h2 className="font-semibold text-lg">{title}</h2>
          {!loading && (
            <button
              onClick={onCancel}
              className="rounded-lg p-2 transition"
              aria-label={`${title}`}
            >
              <FiX aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-8 flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${style.iconBg}`}
          >
            <Icon className={`text-3xl ${style.iconColor}`} />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{title}</h3>
          <p className="mt-3 text-gray-500">{description}</p>
        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            disabled={loading}
            aria-label={`${cancelLabel}`}
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border hover:bg-gray-100 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            disabled={loading}
            aria-label={`${loading ? "Processing..." : confirmLabel}`}
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg transition disabled:opacity-60 ${style.button}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
