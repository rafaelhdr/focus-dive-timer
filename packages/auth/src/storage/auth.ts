import { get, set, remove } from "@focusdive/storage";

export async function getTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    get("focus_dive_access_token"),
    get("focus_dive_refresh_token"),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}

export async function setTokens(
  accessToken: string,
  refreshToken: string
) {
  await Promise.all([
    set("focus_dive_access_token", accessToken),
    set("focus_dive_refresh_token", refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    remove("focus_dive_access_token"),
    remove("focus_dive_refresh_token"),
  ]);
}

