import { useState } from "react";
import { Appointment } from "@/types/appointment";
import AppointmentDetails from "@/components/ui/AppointmentDetails";
import { useAppoinmentsByAssistant } from "@/hooks/useAssistant";
import ScheduleCalendar from "@/components/ui/ScheduleCalendar";
import SchedulePageSkeleton from "@/components/ui/SchedulePageSkeleton";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function AssSchedulePage() {
  const { data: appointments = [], isLoading } = useAppoinmentsByAssistant();
  const [selected, setSelected] = useState<Appointment | null>();

  if (isLoading) {
    return <SchedulePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weekly Schedule</h1>

        <p className="text-gray-500">View all booked appointments this week.</p>
      </div>
      <ErrorBoundary>
      <ScheduleCalendar appointments={appointments} onSelected={setSelected} />
      </ErrorBoundary>
      {selected && (
        <AppointmentDetails
          appointment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
