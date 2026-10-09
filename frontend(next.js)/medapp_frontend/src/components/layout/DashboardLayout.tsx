"use client";

import { useState, useSyncExternalStore } from "react";
import { dashboardConfig, DashboardSection } from "@/config/DashboardConfig";
import { UserRole } from "@/types/user";
import DashboardContent from "../ui/DashboardContent";
import Sidebar from "../ui/SideBar";

interface Props {
  role: UserRole;
}

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobileViewport(onChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getIsMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerIsMobile() {
  return false;
}

export default function DashboardLayout({ role }: Props) {
  const items = dashboardConfig[role];
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("dashboard");
  const [reloadKey, setReloadKey] = useState(0);
  const isMobile = useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobile,
    getServerIsMobile,
  );
  const [sidebarOpenOverride, setSidebarOpenOverride] = useState<
    boolean | null
  >(null);
  const isSidebarOpen = sidebarOpenOverride ?? !isMobile;
  const setIsSidebarOpen = setSidebarOpenOverride;

  const handleSetActiveSection = (section: DashboardSection) => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsSidebarOpen(false);
    }

    if (section === activeSection) {
      // clicking the same section — force remount of content
      setReloadKey((k) => k + 1);
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
          className="fixed right-4 top-4 z-30 rounded-md bg-slate-50 px-4 py-2 text-indigo-500   shadow-lg md:hidden"
        >
          <span aria-hidden="true">☰</span>
        </button>
      )}

      {isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/20 shadow-[0_0_24px_rgba(15,23,42,0.18)] md:hidden"
        />
      )}

      <Sidebar
        items={items}
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <main
        className={`
        min-w-0
        flex-1
        p-4
        sm:p-6
        transition-all
        bg-gradient-to-r
        from-slate-100
        via-white
        to-white
        duration-300
        ${!isSidebarOpen ? "shadow-2x1" : "shadow-lg"}
    `}
      >
        <DashboardContent
          key={`${activeSection}-${reloadKey}`}
          section={activeSection}
          role={role}
          setActiveSection={handleSetActiveSection}
        />
      </main>
    </div>
  );
}
