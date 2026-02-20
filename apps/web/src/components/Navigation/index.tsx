import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Settings, Link2, UserRound, LogOut, HelpCircle, Menu } from 'lucide-react';
import { Button } from "@focusdive/ui";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import { useMe, useLogout } from '@focusdive/auth';
import { useTimer } from "@focusdive/timer";
import NavigationTimer from './NavigationTimer';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const Navigation: React.FC = () => {
  const { data: user } = useMe()
  const location = useLocation();
  const { isRunning } = useTimer();
  const logout = useLogout();
  const showTimer = location.pathname !== '/' && isRunning;
  
  const isMobile = useIsMobile();
  
  // Check if current path is integrations related
  const isIntegrationsPath = location.pathname.startsWith('/integrations');
  
  const NavigationLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <Link to="/" onClick={onItemClick}>
        <Button 
          variant={location.pathname === '/' ? 'default' : 'ghost'} 
          size="sm"
          className="gap-2 w-full justify-start"
        >
          <Clock className="h-4 w-4" />
          Timer
        </Button>
      </Link>
      <Link to="/integrations/slack" onClick={onItemClick}>
        <Button 
          variant={isIntegrationsPath ? 'default' : 'ghost'} 
          size="sm"
          className="gap-2 w-full justify-start"
        >
          <Link2 className="h-4 w-4" />
          Integrations
        </Button>
      </Link>
      <Link to="/preferences" onClick={onItemClick}>
        <Button 
          variant={location.pathname === '/preferences' ? 'default' : 'ghost'} 
          size="sm"
          className="gap-2 w-full justify-start"
        >
          <Settings className="h-4 w-4" />
          Preferences
        </Button>
      </Link>
    </>
  );
  
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
        <div className="container max-w-4xl mx-auto flex justify-between items-center py-2">
          <div className="flex items-center">
            {showTimer ? (
              <NavigationTimer />
            ) : (
              <div className="flex items-center">
                <Link to="/" className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mr-2`}>Focus Dive</Link>
                <Link to="/about-pomodoro">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {isMobile ? (
            <div className="flex items-center gap-2">
              {user ? (
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
                        {user?.email || 'User'}
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
                    className="h-8 w-8 p-0"
                  >
                    <UserRound className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              
              <ThemeToggle />
              
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="px-4 pt-4 pb-6 space-y-2">
                    <DrawerTitle className="text-left mb-4">Navigation</DrawerTitle>
                    <DrawerClose asChild>
                      <div className="space-y-2">
                        <NavigationLinks onItemClick={() => {}} />
                      </div>
                    </DrawerClose>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavigationLinks />
              
              {user ? (
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
                        {user?.email || 'User'}
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
              
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;
