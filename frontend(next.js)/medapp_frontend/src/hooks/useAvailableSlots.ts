import { appointmentService } from "@/services/appointment.service";
import { useQuery } from "@tanstack/react-query";

export const useAvailableSlots = (
  doctorId: string | undefined,
  date: string | undefined,
) => {
  return useQuery({
    queryKey: ["available-slots", doctorId, date],
    queryFn: () => appointmentService.getAvailableSlots(doctorId!, date!),
    enabled: Boolean(doctorId && date),
    staleTime: 30 * 1000,
  });
};
