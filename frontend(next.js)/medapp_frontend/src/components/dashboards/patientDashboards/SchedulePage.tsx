import { useState } from "react";

import { useAppointmentsByPatient } from "@/hooks/usePatients";
import AppointmentDetails from "@/components/ui/AppointmentDetails";
import PageHeader from "@/components/ui/PageHeader";
import ScheduleCalendar from "@/components/ui/ScheduleCalendar";
import SchedulePageSkeleton from "@/components/ui/SchedulePageSkeleton";
import { Appointment } from "@/types/appointment";
import ErrorBoundary from "@/components/ui/Error.Boundary";

export default function PatSchedulePage() {
  const {data:appointments=[],isLoading}=useAppointmentsByPatient();
  const [selected, setSelected] = useState<Appointment | null>();
  if (isLoading) {
    return <SchedulePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        description="Check your schedule."
      />
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
