import { Button } from "@focusdive/ui";
import { Timer, TimerControls } from "@focusdive/timer";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLogout } from "@focusdive/auth";
import { LogOut } from "lucide-react";

export const Dashboard = () => {
  const { toast } = useToast();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-1">Focus Dive</h1>
        </div>
        <ThemeToggle />
      </div>

      <Timer />

      <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-6">
        <TimerControls />
      </div>

      <div className="pt-3">
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
