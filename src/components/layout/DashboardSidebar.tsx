import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, Upload, MessageSquare, Stethoscope, MapPin, Pill, Clock, Search, Shield, HelpCircle, HeartPulse, ClipboardList, AlertTriangle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const coreLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload Reports" },
  { to: "/assistant", icon: MessageSquare, label: "AI Assistant" },
  { to: "/find-doctors", icon: Stethoscope, label: "Find Doctors" },
  { to: "/nearby", icon: MapPin, label: "Nearby Care" },
  { to: "/medicines", icon: Pill, label: "Medicines" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/symptoms", icon: Search, label: "Symptom Checker" },
  { to: "/medicine-safety", icon: Shield, label: "Medicine Safety" },
  { to: "/help", icon: HelpCircle, label: "Help & Safety" },
];

const healthLinks = [
  { to: "/disease-stage", icon: HeartPulse, label: "Disease Stage" },
  { to: "/care-plan", icon: ClipboardList, label: "Care Plan" },
  { to: "/precautions", icon: AlertTriangle, label: "Precautions" },
];

export default function DashboardSidebar() {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-[3px] border-sidebar-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-[240px] h-screen bg-sidebar flex flex-col border-r border-sidebar-border fixed left-0 top-0 z-30">
      <Link to="/" className="flex items-center gap-2 px-5 py-5">
        <Heart className="h-6 w-6 text-sidebar-primary fill-sidebar-primary" />
        <span className="text-xl font-bold text-sidebar-primary-foreground">
          Vital<span className="text-sidebar-primary">Wave</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted px-4 mb-2">Core</p>
        {coreLinks.map(link => <NavItem key={link.to} {...link} />)}

        <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted px-4 mt-6 mb-2">My Health</p>
        {healthLinks.map(link => <NavItem key={link.to} {...link} />)}
      </nav>

      <div className="px-3 pb-4">
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}
