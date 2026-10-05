import { useQuery } from "@tanstack/react-query";
import { doctorService } from "@/services/doctor.service";

export function useDoctor() {
  return useQuery({
    queryKey: ["doctor"],
    queryFn: doctorService.getProfile,
  });
}

export function useAppointmentsByDoctor() {
  return useQuery({
    queryKey: ["appointments-doctor"],
    queryFn: doctorService.getAppointments,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: doctorService.getDashboard,
  });
}

export function useDashboardAppointments() {
  return useQuery({
    queryKey: ["dashboard-appointments"],
    queryFn: doctorService.getAppointmentsForToday,
  });
}

export function useAssignedAssistant() {
  return useQuery({
    queryKey: ["assigned-assistant"],
    queryFn: doctorService.getAssignedAssistant,
  });
}

export function usePatientsByDoctor() {
  return useQuery({
    queryKey: ["patients-doctor"],
    queryFn: doctorService.getPatients,
  });
}
