export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('focus_dive_access_token'),
    refreshToken: localStorage.getItem('focus_dive_refresh_token'),
  };
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('focus_dive_access_token', accessToken);
  localStorage.setItem('focus_dive_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("focus_dive_access_token");
  localStorage.removeItem("focus_dive_refresh_token");
}
