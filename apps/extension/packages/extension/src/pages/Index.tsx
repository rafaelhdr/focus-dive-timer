import { useState, useEffect } from "react";
import { LoginScreen } from "../components/LoginScreen";
import { Dashboard } from "../components/Dashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear any previous extension state and check authentication
    try {
      const token = localStorage.getItem("focusdive_token");
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error("Storage access error:", error);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default Index;