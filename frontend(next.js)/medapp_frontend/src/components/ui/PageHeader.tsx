import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import NotificationBell from "../ui/NotificationBell";
import NotificationCenter from "../ui/NotificationCenter";

interface Props {
  title: string;
  description: string;
  search?: string;
  searching?: boolean;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  search,
  searching,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
}: Props) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              {description}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Notifications */}
          <div className="relative">
            <NotificationBell
              onClick={() => setNotificationsOpen((prev) => !prev)}
            />

            {notificationsOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50

                  w-[calc(100vw-1.5rem)]
                  max-w-sm

                  sm:w-96
                "
              >
                <NotificationCenter />
              </div>
            )}
          </div>

          {/* Page actions */}
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">{actions}</div>
          )}
        </div>
      </div>

      {/* Search */}
      {onSearchChange && (
        <div className="w-full sm:max-w-md">
          <label htmlFor="page-search" className="sr-only">
            {searchPlaceholder}
          </label>

          <div className="relative">
            {/* Search icon / loading indicator */}
            <div
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
              "
              aria-hidden="true"
            >
              {searching ? (
                <div
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-blue-600
                    border-t-transparent
                  "
                />
              ) : (
                <FiSearch size={18} className="text-gray-400" />
              )}
            </div>

            <input
              id="page-search"
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="
                w-full
                min-h-11
                rounded-xl
                border
                border-gray-300
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                transition

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                placeholder:text-gray-400
              "
            />
          </div>
        </div>
      )}
    </div>
  );
}
