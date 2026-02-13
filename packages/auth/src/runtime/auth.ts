import { getAccessToken as newGetAccessToken } from "@focusdive/auth-token";

export async function getAccessToken(): Promise<string | null> {
  console.warn("Deprecation Warning: getAccessToken is deprecated. Please use the version from @focusdive/auth-token instead.");
  return newGetAccessToken();
}
