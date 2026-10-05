interface Props {
  value: string;
  onChange: (status: string) => void;
}

const statuses = ["ALL", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
export function matchesAppointmentStatus(status: string, selected: string) {
  return selected === "ALL" || status === selected;
}
export default function AppointmentStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          aria-label={`${status}`}
          onClick={() => onChange(status)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
              ${
                value === status
                  ? "bg-gradient-to-r from-indigo-900 to-blue-500 text-white shadow"
                  : "bg-white border hover:bg-gray-50"
              }
          `}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
