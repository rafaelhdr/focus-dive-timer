
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  loginWithEmail, 
  verifyToken, 
  isAuthenticated as checkIsAuth,
  storeAuthTokens,
  clearAuthTokens,
  getAccessToken,
  AuthState
} from '@/services/authApi';

interface AuthContextType {
  auth: AuthState;
  isLoading: boolean;
  requestLoginCode: (email: string) => Promise<boolean>;
  verifyLoginCode: (email: string, token: string) => Promise<boolean>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('focus_dive_access_token');
    const refreshToken = localStorage.getItem('focus_dive_refresh_token');
    
    if (accessToken) {
      setAuth({
        isAuthenticated: true,
        accessToken,
        refreshToken,
      });
    }
    
    setIsLoading(false);
  }, []);

  // Request login code
  const requestLoginCode = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await loginWithEmail(email);
      if (response.success) {
        toast.success(response.message);
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (error) {
      toast.error('Failed to request login code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify login code
  const verifyLoginCode = async (email: string, token: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await verifyToken(email, token);
      if (response.success && response.access_token && response.refresh_token) {
        storeAuthTokens(response.access_token, response.refresh_token);
        setAuth({
          isAuthenticated: true,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        });
        toast.success('Successfully logged in!');
        return true;
      } else {
        toast.error(response.message || 'Invalid verification code');
        return false;
      }
    } catch (error) {
      toast.error('Failed to verify login code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    clearAuthTokens();
    setAuth(initialAuthState);
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        isLoading,
        requestLoginCode,
        verifyLoginCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

