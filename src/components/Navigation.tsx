
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Settings, Link2, UserRound, LogOut, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/hooks/useTimer';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isActive, formattedTime, mode } = useTimer();
  const { auth, logout } = useAuth();
  const showTimer = location.pathname !== '/' && isActive;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="container max-w-4xl mx-auto flex justify-between items-center py-2">
        <div className="flex items-center">
          {showTimer ? (
            <div className="text-lg font-bold mr-4">
              <span className={mode === 'focus' ? "text-primary" : "text-emerald-500"}>
                {formattedTime} {mode === 'focus' ? 'Focus' : 'Break'}
              </span>
            </div>
          ) : (
            <Link to="/" className="text-lg font-bold mr-4">Focus Dive</Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Timer</span>
            </Button>
          </Link>
          <Link to="/block-distractions">
            <Button 
              variant={location.pathname === '/block-distractions' ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              variant={location.pathname === '/pricing' ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Pricing</span>
            </Button>
          </Link>
          <Link to="/settings">
            <Button 
              variant={location.pathname === '/settings' ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
          
          {auth.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <UserRound className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="flex justify-between">
                  <span className="text-muted-foreground text-xs">
                    {localStorage.getItem('focus_dive_user_email') || 'User'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button 
                variant={location.pathname === '/login' ? 'default' : 'ghost'} 
                size="sm"
                className="gap-2"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
