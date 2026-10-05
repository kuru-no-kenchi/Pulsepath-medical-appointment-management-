"use client";

import { FiCheck, FiBell } from "react-icons/fi";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationMutations } from "@/mutations/useNotificationMutations";

export default function NotificationCenter() {
  const { notifications, unreadCount, isLoading } = useNotifications();

  const { markAsRead, markAllAsRead } = useNotificationMutations();

  return (
    <div className="w-96 max-h-[500px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="font-semibold text-gray-900">Notifications</h2>

          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            aria-label="Mark all as read"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <FiBell size={32} className="mx-auto mb-3 text-gray-300" />

            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  markAsRead.mutate(notification.id);
                }
              }}
              className={`
                w-full text-left px-5 py-4
                border-b
                hover:bg-gray-50
                transition
                ${!notification.read ? "bg-blue-50/50" : ""}
              `}
            >
              <div className="flex gap-3">
                <div
                  className={`
                    w-9 h-9
                    rounded-full
                    flex items-center justify-center
                    shrink-0
                    ${notification.read ? "bg-gray-100" : "bg-blue-100"}
                  `}
                >
                  <FiBell
                    size={16}
                    className={
                      notification.read ? "text-gray-500" : "text-blue-600"
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3
                      className={`
                        text-sm
                        ${
                          notification.read
                            ? "font-medium text-gray-700"
                            : "font-semibold text-gray-900"
                        }
                      `}
                    >
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {notification.message}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
