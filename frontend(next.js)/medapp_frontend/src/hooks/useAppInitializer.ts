import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAssistant } from "./useAssistant";
import { useDoctor } from "./useDoctor";
import { currentUserQueryKey } from "./useCurrentUser";
import { userService } from "@/services/user.service";
import { notificationService } from "@/services/notification.service";
import { notificationKeys } from "./useNotifications";
import {
  adminAppointmentService,
  adminAssistantService,
  adminDashboardService,
  adminDoctorService,
  adminPatientService,
} from "@/services/admin.service";

type Role = "ADMIN" | "DOCTOR" | "ASSISTANT" | "PATIENT";

const noAuthRetry = (failureCount: number, error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status === 401 || status === 403) return false;
  return failureCount < 1;
};

export function useAppInitializer() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("Authenticating...");
  const [progress, setProgress] = useState(0);

  const initializeAdmin = useCallback(async () => {
    setMessage("Loading your profile...");
    setProgress(10);

    await queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: adminDashboardService.getProfile,
      staleTime: 1000 * 60 * 10,
      retry: noAuthRetry,
    });

    setMessage("Loading dashboard...");
    setProgress(20);

    await queryClient.prefetchQuery({
      queryKey: ["dashboard"],
      queryFn: adminDashboardService.getStats,
      staleTime: 1000 * 60 * 5,
      retry: noAuthRetry,
    });

    await queryClient.prefetchQuery({
      queryKey: notificationKeys.unreadCount(),
      queryFn: notificationService.getUnreadCount,
      retry: noAuthRetry,
    });

    setMessage("Loading doctors...");
    setProgress(45);

    await queryClient.prefetchQuery({
      queryKey: ["doctors"],
      queryFn: adminDoctorService.getAllDoctors,
      staleTime: 1000 * 60 * 5,
      retry: noAuthRetry,
    });

    setMessage("Loading assistants...");
    setProgress(60);

    await queryClient.prefetchQuery({
      queryKey: ["assistants"],
      queryFn: adminAssistantService.getAssistants,
      staleTime: 1000 * 60 * 5,
      retry: noAuthRetry,
    });

    setMessage("Loading patients...");
    setProgress(75);

    await queryClient.prefetchQuery({
      queryKey: ["patients"],
      queryFn: adminPatientService.getPatients,
      staleTime: 1000 * 60 * 5,
      retry: noAuthRetry,
    });

    setMessage("Loading appointments...");
    setProgress(90);

    await queryClient.prefetchQuery({
      queryKey: ["appointments"],
      queryFn: adminAppointmentService.getAppointments,
      staleTime: 1000 * 60 * 5,
      retry: noAuthRetry,
    });
  }, [queryClient]);

  const initializeDoctor = useCallback(async () => {
    setMessage("Loading your profile...");
    setProgress(10);

    await queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: useDoctor,
      staleTime: 1000 * 60 * 10,
      retry: noAuthRetry,
    });

    setMessage("Loading your appointments...");
    setProgress(50);
  }, [queryClient]);

  const initializeAssistant = useCallback(async () => {
    setMessage("Loading your profile...");
    setProgress(10);

    await queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: useAssistant,
      staleTime: 1000 * 60 * 10,
      retry: noAuthRetry,
    });

    setMessage("Loading your workspace...");
    setProgress(50);
  }, [queryClient]);

  const initializePatient = useCallback(async () => {
    setMessage("Loading your medical records...");
    setProgress(50);
  }, []);

  const initialize = useCallback(
    async (role: Role | null) => {
      const start = Date.now();

      try {
        setProgress(0);
        setMessage("Retrieving data...");

        await queryClient.prefetchQuery({
          queryKey: currentUserQueryKey,
          queryFn: userService.getCurrentUser,
          staleTime: 1000 * 60 * 10,
          retry: noAuthRetry,
        });

        setProgress(20);

        switch (role) {
          case "ADMIN":
            await initializeAdmin();
            break;
          case "DOCTOR":
            await initializeDoctor();
            break;
          case "ASSISTANT":
            await initializeAssistant();
            break;
          case "PATIENT":
            await initializePatient();
            break;
          default:
            throw new Error("Missing or invalid user role");
        }

        setMessage("Preparing your workspace...");
        setProgress(100);

        const elapsed = Date.now() - start;
        const minimum = 2100;

        if (elapsed < minimum) {
          await new Promise((resolve) =>
            setTimeout(resolve, minimum - elapsed),
          );
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [
      initializeAdmin,
      initializeAssistant,
      initializeDoctor,
      initializePatient,
      queryClient,
    ],
  );

  return {
    initialize,
    message,
    progress,
  };
}
