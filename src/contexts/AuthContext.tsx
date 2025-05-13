
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  loginWithEmail, 
  verifyToken, 
  refreshAccessToken,
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

// Function to parse JWT token and extract expiration time
const getTokenExpiration = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error parsing token:', error);
    return 0;
  }
};

// Function to check if token is expired or about to expire (within 1 minute)
const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  const expTime = getTokenExpiration(token);
  // Return true if token expires within the next minute
  return expTime - Date.now() < 60000;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingToken, setRefreshingToken] = useState(false);

  // Function to handle token refresh
  const handleTokenRefresh = async () => {
    if (!auth.refreshToken || refreshingToken) return false;
    
    setRefreshingToken(true);
    try {
      const response = await refreshAccessToken(auth.refreshToken);
      
      if (response.success && response.access_token) {
        const newRefreshToken = response.refresh_token || auth.refreshToken;
        
        // Update local storage and state
        storeAuthTokens(
          response.access_token, 
          newRefreshToken, 
          localStorage.getItem('focus_dive_user_email') || ''
        );
        
        setAuth({
          isAuthenticated: true,
          accessToken: response.access_token,
          refreshToken: newRefreshToken,
        });
        
        return true;
      } else {
        // If refresh fails, log the user out
        clearAuthTokens();
        setAuth(initialAuthState);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    } finally {
      setRefreshingToken(false);
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('focus_dive_access_token');
    const refreshToken = localStorage.getItem('focus_dive_refresh_token');
    
    if (accessToken && refreshToken) {
      // Check if token is expired or about to expire
      if (isTokenExpired(accessToken) && !refreshingToken) {
        // Token is expired, attempt to refresh
        handleTokenRefresh().then(success => {
          if (!success) {
            // If refresh failed, clear tokens
            clearAuthTokens();
          }
          setIsLoading(false);
        });
      } else {
        // Token is still valid
        setAuth({
          isAuthenticated: true,
          accessToken,
          refreshToken,
        });
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Set up interval to check token expiration and refresh if needed
  useEffect(() => {
    if (!auth.accessToken || !auth.refreshToken) return;
    
    const checkTokenInterval = setInterval(() => {
      if (auth.accessToken && isTokenExpired(auth.accessToken)) {
        console.log('Token expired or about to expire, refreshing...');
        handleTokenRefresh();
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(checkTokenInterval);
    };
  }, [auth.accessToken, auth.refreshToken]);

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
        storeAuthTokens(response.access_token, response.refresh_token, email);
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
