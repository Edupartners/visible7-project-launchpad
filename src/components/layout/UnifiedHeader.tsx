
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTrial } from "@/hooks/useTrial";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, User, Clock } from "lucide-react";

interface UnifiedHeaderProps {
  showTrialInfo?: boolean;
}

export const UnifiedHeader = ({ showTrialInfo = true }: UnifiedHeaderProps) => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { daysRemaining, isActive } = useTrial();

  const handleLogout = () => {
    logout();
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/home');
    }
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="w-full bg-gradient-to-r from-background via-primary/5 to-accent/10 border-b border-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Trial Info */}
          <div className="flex items-center space-x-4">
            <div 
              className={`flex items-center space-x-3 ${isAuthenticated ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">V7</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VISIBLE7 MICEK™
              </span>
            </div>
            
            {showTrialInfo && isActive && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                Trial: {daysRemaining} dní
              </Badge>
            )}
          </div>

          {/* Right side - User Info and Settings */}
          {isAuthenticated && currentUser && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {currentUser}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-medium">
                        {getUserInitials(currentUser)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{currentUser}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isActive ? `${daysRemaining} dní do konce trial verze` : 'Trial verze ukončena'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Nastavení</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Odhlásit se</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
