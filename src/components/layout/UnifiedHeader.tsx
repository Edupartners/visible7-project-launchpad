import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/AuthGate";

interface UnifiedHeaderProps {
  showTrialInfo?: boolean;
}

const initials = (email: string) => email.split("@")[0].slice(0, 2).toUpperCase();

export const UnifiedHeader = (_props: UnifiedHeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";

  const handleLogout = async () => {
    await signOut();
    navigate("/home");
  };

  return (
    <header className="w-full bg-gradient-to-r from-background via-primary/5 to-accent/10 border-b border-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/home")}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">V7</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VISIBLE7 MICEK™
            </span>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="hidden sm:inline text-sm text-muted-foreground">{email}</span>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-medium">
                      {initials(email || "?")}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground">Přihlášen jako</p>
                  <p className="truncate text-sm font-medium">{email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Můj účet</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Odhlásit se</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
