import { refreshAccessToken } from "./services";
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

let refreshPromise: Promise<string> | null = null;

function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const { accessToken, refreshToken } = await getTokens();

  if (!refreshToken) return null;

  if (accessToken && !isExpired(accessToken)) {
    return accessToken;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshToken)
      .then(async ({ access_token: newAccess, refresh_token: newRefresh }) => {
        await setTokens(newAccess, newRefresh);
        return newAccess;
      })
      .catch(async (err) => {
        await clearTokens();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
