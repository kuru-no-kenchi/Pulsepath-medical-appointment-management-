import {
  adminAppointmentService,
  adminAssistantService,
  adminDashboardService,
  adminDoctorService,
  adminPatientService,
} from "@/services/admin.service";
import { AppointmentRequest } from "@/types/appointment";
import { AssistantRequest } from "@/types/assistant";
import { UserRequest } from "@/types/user";
import { DoctorRequest } from "@/types/doctor";
import { PatientRequest } from "@/types/patients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "@/hooks/useCurrentUser";
import { getErrorMessage } from "@/lib/error-message";
import { toast } from "sonner";

export function useAssistantByAdminMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["assistants_admin"],
    });

  const createAssistant = useMutation({
    mutationFn: adminAssistantService.createAssistant,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateAssistant = useMutation({
    mutationFn: ({
      id,
      assistant,
    }: {
      id: string;
      assistant: AssistantRequest;
    }) => adminAssistantService.updateAssistant(id, assistant),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteAssistant = useMutation({
    mutationFn: adminAssistantService.softDeleteAssistant,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const restoreAssistant = useMutation({
    mutationFn: adminAssistantService.restoreAssistant,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const hardDeleteAssistant = useMutation({
    mutationFn: adminAssistantService.hardDeleteAssistant,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  const updateAssignedDoctor = useMutation({
    mutationFn: ({
      assistant_id,
      doctor_ids,
    }: {
      assistant_id: string;
      doctor_ids: string[];
    }) => adminAssistantService.updateAssignedDoctors(assistant_id, doctor_ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  const bulkActivateAssistants = useMutation({
    mutationFn: (ids: string[]) =>
      adminAssistantService.bulkActivateAssistants(ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkDeactivateAssistants = useMutation({
    mutationFn: (ids: string[]) =>
      adminAssistantService.bulkDeactivateAssistants(ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkDeleteAssistants = useMutation({
    mutationFn: (ids: string[]) =>
      adminAssistantService.bulkDeleteAssistants(ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  return {
    createAssistant,
    updateAssistant,
    deleteAssistant,
    restoreAssistant,
    hardDeleteAssistant,
    updateAssignedDoctor,
    bulkActivateAssistants,
    bulkDeactivateAssistants,
    bulkDeleteAssistants,
  };
}
export function useDoctorByAdminMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["doctors_admin"],
    });

  const createDoctor = useMutation({
    mutationFn: adminDoctorService.createDoctor,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateDoctor = useMutation({
    mutationFn: ({ id, doctor }: { id: string; doctor: DoctorRequest }) =>
      adminDoctorService.updateDoctor(id, doctor),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDoctor = useMutation({
    mutationFn: adminDoctorService.softDeleteDoctor,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const restoreDoctor = useMutation({
    mutationFn: adminDoctorService.restoreDoctor,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const hardDeleteDoctor = useMutation({
    mutationFn: adminDoctorService.hardDeleteDoctor,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkActivateDoctors = useMutation({
    mutationFn: (ids: string[]) => adminDoctorService.bulkActivateDoctors(ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkDeactivateDoctors = useMutation({
    mutationFn: (ids: string[]) =>
      adminDoctorService.bulkDeactivateDoctors(ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkDeleteDoctors = useMutation({
    mutationFn: (ids: string[]) => adminDoctorService.bulkDeleteDoctors(ids),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    createDoctor,
    updateDoctor,
    deleteDoctor,
    restoreDoctor,
    hardDeleteDoctor,
    bulkActivateDoctors,
    bulkDeactivateDoctors,
    bulkDeleteDoctors,
  };
}

export function useAppointmentsByAdminMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["appointments_admin"],
    });

  const createAppointment = useMutation({
    mutationFn: adminAppointmentService.createAppointment,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateAppointment = useMutation({
    mutationFn: ({
      id,
      appointment,
    }: {
      id?: string;
      appointment: AppointmentRequest;
    }) => adminAppointmentService.updateAppointment(id!, appointment),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: adminAppointmentService.cancelAppointment,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  return {
    createAppointment,
    updateAppointment,
    cancelAppointment,
  };
}

export function usePatientByAdminMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["patients_admin"],
    });

  const updatePatient = useMutation({
    mutationFn: ({ id, patient }: { id: string; patient: PatientRequest }) =>
      adminPatientService.updatePatient(id, patient),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  return {
    updatePatient,
  };
}

export function useAdminMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin"],
    });

  const invalidateCurrentUser = () =>
    queryClient.invalidateQueries({
      queryKey: currentUserQueryKey,
    });

  const updateProfile = useMutation({
    mutationFn: (data: UserRequest) =>
      adminDashboardService.updateProfile(data),
    onSuccess: () => {
      invalidate();
      invalidateCurrentUser();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  return {
    updateProfile,
  };
}
