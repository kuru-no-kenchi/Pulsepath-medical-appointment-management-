import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useNotifications() {

  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: notificationService.getNotifications,
    staleTime: 30_000,
  });

  const unreadCountQuery = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    staleTime: 10_000,
  });

  return {
    notifications: notificationsQuery.data ?? [],
    unreadCount: unreadCountQuery.data ?? 0,

    isLoading:
      notificationsQuery.isLoading ||
      unreadCountQuery.isLoading,

    isError:
      notificationsQuery.isError ||
      unreadCountQuery.isError,
  };
}