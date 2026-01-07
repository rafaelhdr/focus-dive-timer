import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  AuthState
} from '@/services/authApi';
import { clearTokens, getAccessToken } from '@focusdive/auth';

interface AuthContextType {
  auth: AuthState;
  isLoading: boolean;
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

  const checkAuth = async () => {
    const token = await getAccessToken();
    if (token) {
      setAuth({
        isAuthenticated: true,
        accessToken: token,
        refreshToken: localStorage.getItem('focus_dive_refresh_token'),
      });
    }
  }

  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false));
  }, []);

  // Logout
  const logout = () => {
    clearTokens();
    setAuth(initialAuthState);
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        isLoading,
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
