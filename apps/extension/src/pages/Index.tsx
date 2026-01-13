import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { useMe, logout } from '@focusdive/auth';

const Index = () => {
  const { data: user, isLoading } = useMe();

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
      {!!user ? (
        <Dashboard onLogout={logout} />
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

export default Index;
