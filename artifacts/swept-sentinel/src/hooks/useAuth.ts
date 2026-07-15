import { useAuthMe, useAuthLogout, getAuthMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useAuthMe();
  const logout = useAuthLogout();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getAuthMeQueryKey(), null);
        navigate("/login");
      },
    });
  };

  return {
    user: error ? null : user,
    isLoading,
    isAuthenticated: !!user && !error,
    isAdmin: user?.isAdmin ?? false,
    logout: handleLogout,
  };
}
