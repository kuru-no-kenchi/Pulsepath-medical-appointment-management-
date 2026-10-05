import { useQuery } from "@tanstack/react-query";
import { assistantService } from "@/services/assistant.service";


export function useAssistantQuery() {
  return useQuery({
    queryKey: ["assistant"],
    queryFn: assistantService.getProfile,
  });
}

export function useAssistant() {
  return useAssistantQuery();
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: assistantService.getDashboard,
  });
}

export function usePatientsByAssistant() {
  return useQuery({
    queryKey: ["patients-assistant"],
    queryFn: assistantService.getPatients,
  });
}

export function useDoctorsByAssistantQuery() {
  return useQuery({
    queryKey: ["doctors-assistant"],
    queryFn: assistantService.getManagedDoctors,
  });
}

export function useDoctorsByAssistant() {
  return useDoctorsByAssistantQuery();
}
export function useAppoinmentsByAssistant() {
  return useQuery({
    queryKey: ["appointments-assistant"],
    queryFn: assistantService.getAppointments,
  });
}
