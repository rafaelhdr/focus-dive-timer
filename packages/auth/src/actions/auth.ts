import { clearTokens } from '../storage/auth';

export const logout = () => {
  clearTokens();
}
