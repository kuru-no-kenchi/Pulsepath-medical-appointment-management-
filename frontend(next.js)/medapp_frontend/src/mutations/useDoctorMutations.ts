import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/services/doctor.service";
import { currentUserQueryKey } from "@/hooks/useCurrentUser";
import { getErrorMessage } from "@/lib/error-message";
import { toast } from "sonner";

export function useDoctorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["doctor"],
    });
  const updateProfile = useMutation({
    mutationFn: doctorService.updateProfile,
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
  return {
    updateProfile,
  };
}
