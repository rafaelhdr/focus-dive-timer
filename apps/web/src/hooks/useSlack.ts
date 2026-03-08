import { fdApi, fdKeys } from "@focusdive/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@focusdive/auth";

export function useSlackConnectionStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return fdApi.useQuery(
    "get",
    "/v1/integrations/slack/status",
    {},
    {
      enabled: isAuthenticated,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useSlackPreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return fdApi.useQuery(
    "get",
    "/v1/integrations/slack/preferences",
    {},
    {
      enabled: isAuthenticated,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useUpdateSlackPreferences() {
  const queryClient = useQueryClient();

  return fdApi.useMutation(
    "put",
    "/v1/integrations/slack/preferences",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: fdKeys.slackPreferences(),
        });
      },
    },
  );
}

export function useSlackTest() {
  return fdApi.useMutation(
    "post",
    "/v1/integrations/slack/test",
    {},
  );
}

export function useSlackConnect() {
  const queryClient = useQueryClient();

  return fdApi.useMutation(
    "post",
    "/v1/integrations/slack/connect",
    {
      onMutate: async () => {
        await queryClient.invalidateQueries({ queryKey: fdKeys.slackStatus() });
      },
    },
  );
}

export function useSlackDisconnect() {
  const queryClient = useQueryClient();

  return fdApi.useMutation(
    "post",
    "/v1/integrations/slack/disconnect",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: fdKeys.slackStatus(),
        });
      },
    },
  );
}
