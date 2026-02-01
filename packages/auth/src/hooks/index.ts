import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginWithEmail, verifyToken } from "../services/auth";
import { setTokens } from "../storage/auth";
import { authKeys } from '../queryKeys';
import { me } from '../services/auth';
import { useAuthStore } from "../store/authStore";
import { authEvents } from "../events/authEvents";
import { clearTokens } from '../storage/auth';

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: me,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useRequestLoginToken() {
  return useMutation({
    mutationFn: (email: string) => loginWithEmail(email),
    onSuccess: (_, email) => {
      authEvents.emit("login_email_sent", { email });
    }
  });
}

export function useVerifyLoginToken() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      verifyToken(email, token),
    onSuccess: async (res) => {
      if (res?.success && res.access_token && res.refresh_token) {
        await setTokens(res.access_token, res.refresh_token);
        setAuthenticated(true);
        await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return () => {
    void clearTokens();
    setAuthenticated(false);

    queryClient.clear();
  };
}

export async function initAuth() {
  await useAuthStore.getState().hydrate();
}
