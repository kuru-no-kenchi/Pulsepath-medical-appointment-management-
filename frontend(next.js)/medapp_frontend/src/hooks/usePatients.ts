  import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";

export function usePatient() {
  return useQuery({
    queryKey: ["patient"],
    queryFn: patientService.getProfile,
  });
}

export function useAppointmentsByPatient() {
  return useQuery({
    queryKey: ["appointments-patient"],
    queryFn: patientService.getAppointments,
  });
}

export function useDoctorsByPatient() {
  return useQuery({
    queryKey: ["doctors-patient"],
    queryFn: patientService.getVisitedDoctors,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats-patient"],
    queryFn: patientService.getDashboard,
  });
}
export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ["upcoming-appointments"],
    queryFn: patientService.getUpcomingAppointments,
  });
}
export function useRecentVisits() {
  return useQuery({
    queryKey: ["recent-visits"],
    queryFn: patientService.getRecentVisits,
  });
}
