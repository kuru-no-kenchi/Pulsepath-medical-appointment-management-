import { assistantService } from "@/services/assistant.service";
import { AppointmentRescheduleRequest } from "@/types/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "@/hooks/useCurrentUser";
import { getErrorMessage } from "@/lib/error-message";
import { toast } from "sonner";

export function useAssistantMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["assistant"],
    });
  const updateProfile = useMutation({
    mutationFn: assistantService.updateProfile,
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: currentUserQueryKey,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  return { updateProfile };
}

export function useAppointmentsByAssistantMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["appointments-assistant"],
    });

  const createAppointmentByAssistant = useMutation({
    mutationFn: assistantService.createAppointment,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const rescheduleAppointment = useMutation({
    mutationFn: ({
      id,
      appointment,
    }: {
      id?: string;
      appointment: AppointmentRescheduleRequest;
    }) => assistantService.rescheduleAppointment(id!, appointment),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const cancelAppointmentByAssistant = useMutation({
    mutationFn: assistantService.cancelAppointment,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const markComplete = useMutation({
    mutationFn: assistantService.markComplete,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const markNoShow = useMutation({
    mutationFn: assistantService.markNoShow,
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
  return {
    createAppointmentByAssistant,
    rescheduleAppointment,
    cancelAppointmentByAssistant,
    markComplete,
    markNoShow,
  };
}
