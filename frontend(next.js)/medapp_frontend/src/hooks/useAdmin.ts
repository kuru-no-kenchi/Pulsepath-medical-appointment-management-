import {
  adminAppointmentService,
  adminAssistantService,
  adminDashboardService,
  adminDoctorService,
  adminPatientService,
} from "@/services/admin.service";
import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  return useQuery({
    queryKey: ["admin"],
    queryFn: adminDashboardService.getProfile,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: adminDashboardService.getStats,
    staleTime: 60 * 1000,
  });
}

export function useDashboardLastThreeAppointments() {
  return useQuery({
    queryKey: ["dashboard-last-three-appointments"],
    queryFn: adminDashboardService.getLastThreeAppointments,
  });
}

export function useDashboardLastThreeAssistants() {
  return useQuery({
    queryKey: ["dashboard-last-three-assistants"],
    queryFn: adminDashboardService.getLastThreeAssistants,
  });
}

export function useDashboardLastThreeDoctors() {
  return useQuery({
    queryKey: ["dashboard-last-three-doctors"],
    queryFn: adminDashboardService.getLastThreeDoctors,
  });
}
export function useAssistantsByAdmin() {
  return useQuery({
    queryKey: ["assistants_admin"],
    queryFn: adminAssistantService.getAssistants,
  });
}


export function useDoctorsByAdmin() {
  return useQuery({
    queryKey: ["doctors_admin"],
    queryFn: adminDoctorService.getAllDoctors,
  });
}

export function usePatientsByAdmin() {
  return useQuery({
    queryKey: ["patients_admin"],
    queryFn: adminPatientService.getPatients,
  });
}


export function useAppoinmentsByAdmin() {
  return useQuery({
    queryKey: ["appoinments_admin"],
    queryFn: adminAppointmentService.getAppointments,
  });
}

export function useAdminAssignedDoctorsByAdmin() {
  return useQuery({
    queryKey: ["assigned-doctor-admin"],
    queryFn: () => adminAssistantService.getAssignedDoctors(""),
  });
}
