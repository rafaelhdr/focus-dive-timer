import React, { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { clearTokens } from '@focusdive/auth';

interface AuthContextType {
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Logout
  const logout = () => {
    clearTokens();
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
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
