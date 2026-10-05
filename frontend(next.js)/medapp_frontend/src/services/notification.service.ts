import API from "@/lib/axios";
import { Notification } from "@/types/notification";

export const notificationService = {

  async getNotifications(): Promise<Notification[]> {
    const response = await API.get("/notifications");
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await API.get("/notifications/unread-count");
    return response.data.unreadCount;
  },

  async markAsRead(id: string): Promise<void> {
    await API.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await API.patch("/notifications/read-all");
  },
};