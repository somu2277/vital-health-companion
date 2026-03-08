import { Link } from "react-router-dom";
import { Upload, Stethoscope, MapPin, MessageSquare, Search } from "lucide-react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const quickActions = [
  { to: "/upload", icon: Upload, label: "Upload Report", bg: "bg-feature-upload", iconColor: "text-feature-upload-icon" },
  { to: "/find-doctors", icon: Stethoscope, label: "Find Doctor", bg: "bg-feature-doctor", iconColor: "text-feature-doctor-icon" },
  { to: "/nearby", icon: MapPin, label: "Nearby Hospital", bg: "bg-feature-hospital", iconColor: "text-feature-hospital-icon" },
  { to: "/assistant", icon: MessageSquare, label: "Ask AI", bg: "bg-feature-ai", iconColor: "text-feature-ai-icon" },
  { to: "/symptoms", icon: Search, label: "Symptom Checker", bg: "bg-feature-symptom", iconColor: "text-feature-symptom-icon" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground mt-1">Your health dashboard</p>
        </div>
        <Button asChild>
          <Link to="/upload" className="gap-2"><Upload className="h-4 w-4" /> Upload Report</Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickActions.map((a, i) => (
          <motion.div key={a.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link
              to={a.to}
              className="border border-border rounded-xl p-5 bg-card hover:shadow-md transition-all flex flex-col items-center gap-3 text-center group"
            >
              <div className={`w-14 h-14 rounded-xl ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <a.icon className={`h-6 w-6 ${a.iconColor}`} />
              </div>
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Health Overview + Recent Uploads */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Health Overview</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Your recent health activity</p>
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Upload className="h-10 w-10 mb-3 opacity-40" />
            <p className="font-medium">No uploads yet</p>
            <p className="text-sm mt-1">Upload your first medical document to get started</p>
          </div>
        </div>
        <div className="border border-border rounded-xl p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <div className="w-12 h-14 border-2 border-dashed border-border rounded-lg flex items-center justify-center mb-3">
              <span className="text-xs opacity-40">📄</span>
            </div>
            <p className="text-sm">No uploads yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
