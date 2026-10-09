import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Users } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            onClick={() => navigate("/home")}
            aria-label="VISIBLE7 MICEK – přehled"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-foreground">
              <span className="text-[13px] font-bold tracking-tight text-white">V7</span>
            </span>
            <span className="text-[19px] font-semibold tracking-tight text-foreground">
              VISIBLE7 <span className="font-normal text-muted-foreground">MICEK™</span>
            </span>
          </button>

          {user && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Nastavení"
                title="Nastavení"
              >
                <Settings className="h-[18px] w-[18px]" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <span className="hidden sm:inline text-sm text-foreground/80">{email}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-foreground text-sm font-semibold">
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
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Nastavení</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/poradci")}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Seniorní poradci</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
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
