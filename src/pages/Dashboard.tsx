import { Link } from "react-router-dom";
import { Upload, Stethoscope, MapPin, MessageSquare, Search } from "lucide-react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const quickActions = [
  { to: "/upload", icon: Upload, label: "Upload Report", bg: "bg-feature-upload", iconColor: "text-feature-upload-icon" },
  { to: "/find-doctors", icon: Stethoscope, label: "Find Doctor", bg: "bg-feature-doctor", iconColor: "text-feature-doctor-icon" },
  { to: "/nearby", icon: MapPin, label: "Nearby Hospital", bg: "bg-feature-hospital", iconColor: "text-feature-hospital-icon" },
  { to: "/assistant", icon: MessageSquare, label: "Ask AI", bg: "bg-feature-ai", iconColor: "text-feature-ai-icon" },
  { to: "/symptoms", icon: Search, label: "Symptom Checker", bg: "bg-feature-symptom", iconColor: "text-feature-symptom-icon" },
];

export default function Dashboard() {
  const { profile, user } = useAuth();

  const { data: reports } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await supabase.from("medical_reports").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: medicines } = useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      const { data } = await supabase.from("medicines").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.name || "User"} 👋</h1>
          <p className="text-muted-foreground mt-1">{profile?.location || "Your health dashboard"}</p>
        </div>
        <Button asChild>
          <Link to="/upload" className="gap-2"><Upload className="h-4 w-4" /> Upload Report</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickActions.map((a, i) => (
          <motion.div key={a.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={a.to} className="border border-border rounded-xl p-5 bg-card hover:shadow-md transition-all flex flex-col items-center gap-3 text-center group">
              <div className={`w-14 h-14 rounded-xl ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <a.icon className={`h-6 w-6 ${a.iconColor}`} />
              </div>
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Health Overview</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Your recent health activity</p>
          {medicines && medicines.length > 0 ? (
            <div className="space-y-3">
              {medicines.map(med => (
                <div key={med.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div>
                    <p className="font-medium text-sm">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.dosage} · {med.frequency}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{med.duration}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Upload className="h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">No uploads yet</p>
              <p className="text-sm mt-1">Upload your first medical document to get started</p>
            </div>
          )}
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
          {reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="p-3 rounded-lg border border-border bg-background">
                  <p className="text-sm font-medium">{r.report_type || "Report"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.summary?.slice(0, 60) || "Processing..."}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.created_at ? format(new Date(r.created_at), "MMM d, yyyy") : ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="w-12 h-14 border-2 border-dashed border-border rounded-lg flex items-center justify-center mb-3">
                <span className="text-xs opacity-40">📄</span>
              </div>
              <p className="text-sm">No uploads yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
