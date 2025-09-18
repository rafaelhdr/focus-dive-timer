import { useState } from "react";
import { Timer } from '@focusdive/ui';
import { Button } from "@focusdive/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings, LogOut, Zap, Play, RotateCcw, Coffee, Target } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [userEmail] = useState(() => localStorage.getItem("focusdive_email") || "");
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("focusdive_token");
    localStorage.removeItem("focusdive_email");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
    onLogout();
  };

  // placeholders
  const formattedTime = "25:00";
  const mode = "focus"; // or "break"
  const isActive = false;
  const handleAddFocusMinutes = () => console.log

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-1">Focus Dive</h1>
        </div>
        <ThemeToggle />
      </div>

      <Timer 
        time={formattedTime} 
        mode={mode} 
        isActive={isActive}
        onAddFocusMinutes={handleAddFocusMinutes}
      />

      {/* Timer Controls */}
      <div className="flex gap-2 mb-4">
        <Button variant="default" className="px-4 flex-1">
          <Play className="w-4 h-4 mr-2" />
          Start
        </Button>
        <Button variant="default" className="px-4">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button variant="secondary" className="px-4">
          <Coffee className="w-4 h-4 mr-2" />
          Switch to Break
        </Button>
      </div>

      <div className="pt-3 border-t border-border">
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
