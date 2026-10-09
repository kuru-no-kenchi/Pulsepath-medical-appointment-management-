"use client";

import { DashboardSection, SidebarItem } from "@/config/DashboardConfig";
import type { IconType } from "react-icons";
import Image from "next/image";
import {
  FiHome,
  FiUser,
  FiClipboard,
  FiUsers,
  FiMenu,
  FiChevronLeft,
  FiLogOut,
  FiCalendar,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getImageUrl } from "@/services/upload.service";
import { capitalizeName } from "@/lib/capitalizeName";

interface SidebarProps {
  items: SidebarItem[];
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const iconMap: Partial<Record<DashboardSection, IconType>> = {
  dashboard: FiHome,
  doctors: FiUser,
  assistants: FiUsers,
  patients: FiUsers,
  appointments: FiClipboard,
  schedule: FiCalendar,
};

export default function Sidebar({
  items,
  activeSection,
  setActiveSection,
  isOpen,
  toggleSidebar,
}: SidebarProps) {
  const { auth, logout } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const router = useRouter();
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const photoUrl = currentUser?.photoUrl;
  const showPhoto = Boolean(photoUrl) && failedPhotoUrl !== photoUrl;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  const userFirstName = capitalizeName(currentUser?.firstName) ?? "";
  const userLastName = capitalizeName(currentUser?.lastName) ?? "";

  const displayName = `${userFirstName} ${userLastName}`.trim() || "User";

  const initials =
    `${userFirstName?.[0]?.toUpperCase() ?? ""}${userLastName?.[0]?.toUpperCase() ?? ""}` ||
    "US";

  const userRole = auth.role ?? "User";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen bg-white shadow-[0_10px_0px_rgba(0,0,0,0.08)] flex flex-col 
        md:static md:h-auto
        overflow-hidden transition-all duration-300 shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      ${isOpen ? "w-64" : "w-16"}`}
    >
      <div
        onClick={() => setActiveSection("profile")}
        className="p-3 flex items-center justify-between cursor-pointer bg-gradient-to-r from-indigo-900 to-blue-600"
      >
        {isOpen && (
          <div className="flex items-center gap-3 ">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-lg text-gray-800">
              {showPhoto && currentUser?.photoUrl ? (
                <Image
                  src={getImageUrl(photoUrl!)}
                  alt={displayName}
                  onError={() => setFailedPhotoUrl(photoUrl ?? null)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {displayName}
              </h2>
              <p className="text-xs text-white">{userRole}</p>
            </div>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          aria-label={`${isOpen ? "Back" : "Menu"}`}
          className="p-2 rounded text-white cursor-pointer"
        >
          {isOpen ? (
            <FiChevronLeft aria-hidden="true" />
          ) : (
            <FiMenu aria-hidden="true" />
          )}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1 mt-3">
        {items.map((item) => {
          const Icon = iconMap[item.value] ?? FiHome;
          return (
            <button
              key={item.value}
              onClick={() => setActiveSection(item.value)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                transition text-sm font-medium cursor-pointer
                ${
                  activeSection === item.value
                    ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                    : "text-gray-800 hover:bg-gray-100"
                }
              `}
            >
              <Icon size={18} />
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium text-gray-800 hover:bg-gray-100`}
        >
          <FiLogOut size={18} aria-hidden="true" />
          {isOpen && <span>Logout</span>}
        </button>
      </nav>
      <div className="p-3 border-t text-xs text-gray-400">
        {isOpen && <div className="mb-2">MedSystem • {userRole} Panel</div>}
      </div>
    </aside>
  );
}
