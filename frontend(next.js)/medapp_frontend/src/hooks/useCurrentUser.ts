"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

export const currentUserQueryKey = ["currentUser"];

export function useCurrentUser() {
  const { auth, loading: authLoading } = useAuth();
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: userService.getCurrentUser,
    enabled: !authLoading && !!auth.token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
