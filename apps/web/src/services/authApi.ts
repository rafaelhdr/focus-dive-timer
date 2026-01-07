export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('focus_dive_access_token');
  return !!accessToken;
};
