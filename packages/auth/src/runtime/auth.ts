import { refreshAccessToken } from "../services/auth";
import { getTokens, setTokens } from "../storage/auth";

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
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
