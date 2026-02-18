import { fdFetch } from "@focusdive/api-client";
import { Preferences } from "../types";
import { fromSettingsApi, toSettingsApiPatch } from "../mappers";

export async function fetchSettings(): Promise<Preferences> {
  const { data, error } = await fdFetch.GET("/v1/preferences")

  if (error) {
    throw new Error("Failed to fetch preferences");
  }

  return fromSettingsApi(data);
}

export async function updateSettings(
  patch: Preferences
): Promise<Preferences> {
  const { data, error } = await fdFetch.PUT("/v1/preferences", {
    body: toSettingsApiPatch(patch),
  });

  if (error) {
    throw new Error("Failed to save preferences");
  }

  return fromSettingsApi(data);
}
