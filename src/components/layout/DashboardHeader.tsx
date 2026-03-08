import { MessageSquare, Languages, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardHeader() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-end px-6 gap-3">
      <button className="p-2 rounded-lg hover:bg-accent transition-colors">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </button>
      <button className="p-2 rounded-lg hover:bg-accent transition-colors">
        <Languages className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg px-2 py-1 transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">U</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">User</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </header>
  );
}
