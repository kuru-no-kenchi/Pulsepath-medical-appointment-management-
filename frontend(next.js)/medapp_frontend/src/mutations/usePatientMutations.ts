import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import { currentUserQueryKey } from "@/hooks/useCurrentUser";
import { getErrorMessage } from "@/lib/error-message";
import { toast } from "sonner";

export function usePatientMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["patient"],
    });
  const updateProfile = useMutation({
    mutationFn: patientService.updateProfile,
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
  const bookAppointment = useMutation({
    mutationFn: patientService.bookAppointment,
    onSuccess: invalidate,
  });
  return {
    updateProfile,
    bookAppointment,
  };
}
