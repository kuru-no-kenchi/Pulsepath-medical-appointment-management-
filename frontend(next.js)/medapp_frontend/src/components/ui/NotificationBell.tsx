"use client";

import { FiBell } from "react-icons/fi";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  onClick: () => void;
}

export default function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      className="relative p-2 rounded-full hover:bg-gray-100 transition"
    >
      <FiBell size={22} className="text-gray-700" aria-hidden="true"/>

      {unreadCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            min-w-5 h-5
            px-1
            flex items-center justify-center
            rounded-full
            bg-red-500
            text-white
            text-xs
            font-semibold
          "
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
