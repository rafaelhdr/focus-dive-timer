import { fdApi } from "@focusdive/api-client";
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
