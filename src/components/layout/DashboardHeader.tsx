import { MessageSquare, Languages, ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = profile?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 gap-3">
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-accent transition-colors lg:hidden">
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1" />
      <button onClick={toggle} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Toggle dark mode">
        {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
      </button>
      <button className="p-2 rounded-lg hover:bg-accent transition-colors">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </button>
      <button className="p-2 rounded-lg hover:bg-accent transition-colors">
        <Languages className="h-4 w-4 text-muted-foreground" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg px-2 py-1 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">{initial}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium max-w-[120px] truncate hidden sm:inline">{profile?.name || "User"}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:inline" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
