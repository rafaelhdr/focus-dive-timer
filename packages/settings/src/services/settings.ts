import { fdFetch } from "@focusdive/api-client";
import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";
import { Preferences } from "../types";
import { fromSettingsApi, toSettingsApiPatch } from "../mappers";

async function authHeaders() {
  const accessToken = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
}

export async function fetchSettings(): Promise<Preferences> {
  const { data, error } = await fdFetch.GET("/v1/preferences")

  if (error) {
    throw new Error("Failed to fetch preferences");
  }

  return fromSettingsApi(data);
}

export async function updateSettings(
  patch: Partial<Preferences>
): Promise<Preferences> {
  const res = await fetch(`${apiUrl}/preferences`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(toSettingsApiPatch(patch)),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to save settings: ${res.status}`);
  }

 return fromSettingsApi(await res.json());
}
