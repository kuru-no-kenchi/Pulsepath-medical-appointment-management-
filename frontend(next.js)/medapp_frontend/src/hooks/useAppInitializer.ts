import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAssistant } from "./useAssistant";
import {
  useAdmin,
  useAppoinmentsByAdmin,
  useAssistantsByAdmin,
  useDashboardStats,
  useDoctorsByAdmin,
  usePatientsByAdmin,
} from "./useAdmin";
import { useDoctor } from "./useDoctor";
import { currentUserQueryKey } from "./useCurrentUser";
import { userService } from "@/services/user.service";
import { notificationService } from "@/services/notification.service";
import { notificationKeys } from "./useNotifications";

type Role = "ADMIN" | "DOCTOR" | "ASSISTANT" | "PATIENT";

export function useAppInitializer() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("Authenticating...");
  const [progress, setProgress] = useState(0);

  const initializeAdmin = useCallback(async () => {
    setMessage("Loading your profile...");
    setProgress(10);
    await queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: useAdmin,
      staleTime: 1000 * 60 * 10,
    });

    setMessage("Loading dashboard...");
    setProgress(20);
    await queryClient.prefetchQuery({
      queryKey: ["dashboard"],
      queryFn: useDashboardStats,
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: notificationKeys.unreadCount(),
      queryFn: notificationService.getUnreadCount,
    });

    setMessage("Loading doctors...");
    setProgress(45);
    await queryClient.prefetchQuery({
      queryKey: ["doctors"],
      queryFn: useDoctorsByAdmin,
      staleTime: 1000 * 60 * 5,
    });

    setMessage("Loading assistants...");
    setProgress(60);
    await queryClient.prefetchQuery({
      queryKey: ["assistants"],
      queryFn: useAssistantsByAdmin,
      staleTime: 1000 * 60 * 5,
    });

    setMessage("Loading patients...");
    setProgress(75);
    await queryClient.prefetchQuery({
      queryKey: ["patients"],
      queryFn: usePatientsByAdmin,
      staleTime: 1000 * 60 * 5,
    });

    setMessage("Loading appointments...");
    setProgress(90);
    await queryClient.prefetchQuery({
      queryKey: ["appointments"],
      queryFn: useAppoinmentsByAdmin,
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient, setMessage, setProgress]);

  const initializeDoctor = useCallback(async () => {
    setMessage("Loading your profile...");
    setProgress(10);
    await queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: useDoctor,
      staleTime: 1000 * 60 * 10,
    });

    setMessage("Loading your appointments...");
    setProgress(50);

    // Prefetch doctor-specific queries here
  }, [queryClient, setMessage, setProgress]);

  const initializeAssistant = useCallback(async () => {
    setMessage("Loading your profile...");
    setProgress(10);
    await queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: useAssistant,
      staleTime: 1000 * 60 * 10,
    });
    setMessage("Loading your workspace...");
    setProgress(50);

    // Prefetch assistant-specific queries here
  }, [queryClient, setMessage, setProgress]);

  const initializePatient = useCallback(async () => {
    setMessage("Loading your medical records...");
    setProgress(50);

    // Prefetch patient-specific queries here
  }, [setMessage, setProgress]);

  const initialize = useCallback(async (role: Role | null) => {
    const start = Date.now();
    try {
      setProgress(0);
      setMessage("Retreiving data...");
      await queryClient.prefetchQuery({
        queryKey: currentUserQueryKey,
        queryFn: userService.getCurrentUser,
        staleTime: 1000 * 60 * 10,
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
      }
      setMessage("Preparing your workspace...");
      setProgress(100);

      const elapsed = Date.now() - start;
      const minimum = 2100;
      if (elapsed < minimum) {
        await new Promise((resolve) => setTimeout(resolve, minimum - elapsed));
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [
    initializeAdmin,
    initializeAssistant,
    initializeDoctor,
    initializePatient,
    queryClient,
    setMessage,
    setProgress,
  ]);

  return {
    initialize,
    message,
    progress,
  };
}
