import { fdFetch } from "@focusdive/api-client";
import { Preferences } from "../types";
import { fromPreferencesApi, toPreferencesApiPatch } from "../mappers";

export async function fetchPreferences(): Promise<Preferences> {
  const { data, error } = await fdFetch.GET("/v1/preferences")

  if (error) {
    throw new Error("Failed to fetch preferences");
  }

  return fromPreferencesApi(data);
}

export async function updatePreferences(
  patch: Preferences
): Promise<Preferences> {
  const { data, error } = await fdFetch.PUT("/v1/preferences", {
    body: toPreferencesApiPatch(patch),
  });

  if (error) {
    throw new Error("Failed to save preferences");
  }

  return fromPreferencesApi(data);
}
