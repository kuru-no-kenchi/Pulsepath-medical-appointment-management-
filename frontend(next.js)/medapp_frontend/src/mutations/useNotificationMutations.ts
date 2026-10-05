import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { notificationKeys } from "../hooks/useNotifications";
import { getErrorMessage } from "@/lib/error-message";
import { toast } from "sonner";

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: notificationService.markAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });

      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: notificationService.markAllAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });

      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    markAsRead,
    markAllAsRead,
  };
}
