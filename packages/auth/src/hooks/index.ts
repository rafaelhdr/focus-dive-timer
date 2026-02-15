import { useQueryClient } from "@tanstack/react-query";
import { fdApi, fdKeys } from "@focusdive/api-client";
import { setTokens } from "../storage/auth";
import { useAuthStore } from "../store/authStore";
import { authEvents } from "../events/authEvents";
import { clearTokens } from '../storage/auth';

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return fdApi.useQuery(
    "get",
    "/v1/users/me",
    {},
    {
      enabled: isAuthenticated,
      staleTime: 60_000,
    },
  );
}

export function useRequestLoginToken() {
  return fdApi.useMutation(
    "post",
    "/v1/users/login",
    {
      onSuccess: (_, { body: { email } }) => {
        authEvents.emit("login_email_sent", { email });
      },
    },
  );
}

export function useVerifyLoginToken() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return fdApi.useMutation(
    "post",
    "/v1/users/verify",
    {
      onSuccess: async (res) => {
        if (res.access_token && res.refresh_token) {
          await setTokens(res.access_token, res.refresh_token);
          setAuthenticated(true);
          await queryClient.invalidateQueries({ queryKey: fdKeys.me() });
        }
      },
    },
  );
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
