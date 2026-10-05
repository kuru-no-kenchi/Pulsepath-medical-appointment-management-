import { FiClipboard } from "react-icons/fi";

interface AppointmentStatusCardProps {
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export default function AppointmentStatusCard({
  confirmed,
  completed,
  cancelled,
  no_show,
}: AppointmentStatusCardProps) {
  const total = confirmed + completed + cancelled + no_show;

  const statuses = [
    {
      label: "Confirmed",
      value: confirmed,
      className: "bg-blue-500",
    },
    {
      label: "Completed",
      value: completed,
      className: "bg-green-500",
    },
    {
      label: "Cancelled",
      value: cancelled,
      className: "bg-red-500",
    },
    {
      label: "No_Show",
      value: no_show,
      className: "bg-yellow-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-900 to-green-500 flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-1">
            <div className="w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center">
              <FiClipboard size={20} />
            </div>
          <div>
            <h2 className="font-semibold text-white text-gray-800">Appointments</h2>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mt-2 space-y-4">
          {statuses.map((status) => {
            const percentage =
              total === 0 ? 0 : Math.round((status.value / total) * 100);

            return (
              <div key={status.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">{status.label}</span>

                  <span className="font-medium">
                    {status.value} ({percentage}%)
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${status.className}`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
