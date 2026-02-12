import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";
import { Settings } from "../types";
import { fromSettingsApi, toSettingsApiPatch } from "../mappers";

async function authHeaders() {
  const accessToken = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
}

export async function fetchSettings(): Promise<Settings> {
  const res = await fetch(`${apiUrl}/preferences`, {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-cache",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.status}`);
  }

  return fromSettingsApi(await res.json());
}

export async function updateSettings(
  patch: Partial<Settings>
): Promise<Settings> {
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
