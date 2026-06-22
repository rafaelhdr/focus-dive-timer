import { apiUrl } from "@focusdive/config";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./__generated__/openapi";
import { getAccessToken } from "@focusdive/auth-token";

type CustomFetch = (request: Request) => Promise<Response>;

const authFetch: CustomFetch = async (request) => {
  const token: string | null = await getAccessToken();

  const headers = new Headers(request.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const nextRequest = new Request(request, {
    headers,
    credentials: "include",
  });

  return fetch(nextRequest);
};

export const fdFetch = createFetchClient<paths>({
  baseUrl: apiUrl,
  fetch: authFetch,
});
export const fdApi = createClient(fdFetch);

export const fdKeys = {
  me: () => fdApi.queryOptions("get", "/v1/users/me").queryKey,
  slackStatus: () => fdApi.queryOptions("get", "/v1/integrations/slack/status").queryKey,
  slackPreferences: () => fdApi.queryOptions("get", "/v1/integrations/slack/preferences").queryKey,
};
