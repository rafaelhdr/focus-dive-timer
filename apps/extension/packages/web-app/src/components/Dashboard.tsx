import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, useToast, ThemeToggle } from "@shared/components";
import { Timer, Settings, LogOut, Zap, Play, RotateCcw, Coffee, Target } from "lucide-react";

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Focus Dive</h1>
          <p className="text-muted-foreground">Welcome back, {userEmail}</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Timer */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <CardContent className="p-8 text-center relative">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Focus Session
                </Badge>
              </div>
              <div className="mb-6">
                <div className="text-8xl font-bold tracking-tight mb-2">25:00</div>
                <p className="text-white/80 text-lg">Focus Time Remaining</p>
              </div>
              
              {/* Timer Controls */}
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
                <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
                <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Coffee className="w-5 h-5 mr-2" />
                  Break
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Focus Sessions</span>
                    <span>3/8</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '37.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Focus Time</span>
                    <span>75 min</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">7</div>
                <p className="text-sm text-muted-foreground">Days in a row</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};