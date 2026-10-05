type AppointmentStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface Props {
    status: AppointmentStatus;
}

export default function AppointmentStatusBadge({ status }: Props) {
    const colors: Record<AppointmentStatus, string> = {
        CONFIRMED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
        NO_SHOW: "bg-orange-100 text-orange-700",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
            {status}
        </span>
    );
}