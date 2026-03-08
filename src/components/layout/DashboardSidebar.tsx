import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, Upload, MessageSquare, Stethoscope, MapPin, Pill, Clock, Search, Shield, HelpCircle, HeartPulse, ClipboardList, AlertTriangle, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

export default function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { t } = useI18n();

  const coreLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/upload", icon: Upload, label: t("nav.upload") },
    { to: "/assistant", icon: MessageSquare, label: t("nav.assistant") },
    { to: "/find-doctors", icon: Stethoscope, label: t("nav.findDoctors") },
    { to: "/nearby", icon: MapPin, label: t("nav.nearby") },
    { to: "/medicines", icon: Pill, label: t("nav.medicines") },
    { to: "/history", icon: Clock, label: t("nav.history") },
    { to: "/symptoms", icon: Search, label: t("nav.symptoms") },
    { to: "/medicine-safety", icon: Shield, label: t("nav.medicineSafety") },
    { to: "/help", icon: HelpCircle, label: t("nav.help") },
  ];

  const healthLinks = [
    { to: "/disease-stage", icon: HeartPulse, label: t("nav.diseaseStage") },
    { to: "/care-plan", icon: ClipboardList, label: t("nav.carePlan") },
    { to: "/precautions", icon: AlertTriangle, label: t("nav.precautions") },
  ];

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClose}
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
    <aside className="w-[240px] h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-sidebar-primary fill-sidebar-primary" />
          <span className="text-xl font-bold text-sidebar-primary-foreground">
            Vital<span className="text-sidebar-primary">Wave</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-sidebar-accent transition-colors">
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted px-4 mb-2">{t("nav.core")}</p>
        {coreLinks.map(link => <NavItem key={link.to} {...link} />)}

        <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted px-4 mt-6 mb-2">{t("nav.myHealth")}</p>
        {healthLinks.map(link => <NavItem key={link.to} {...link} />)}
      </nav>

      <div className="px-3 pb-4">
        <NavItem to="/settings" icon={Settings} label={t("nav.settings")} />
      </div>
    </aside>
  );
}
