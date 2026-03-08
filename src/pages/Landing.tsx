import { Link } from "react-router-dom";
import { Heart, Upload, MessageSquare, MapPin, Stethoscope, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: Upload, title: "Smart Report Analysis", description: "Upload prescriptions, lab reports, and X-rays for AI-powered insights", bg: "bg-feature-upload", iconColor: "text-feature-upload-icon" },
  { icon: MessageSquare, title: "AI Health Assistant", description: "Get answers to your health questions in your language", bg: "bg-feature-ai", iconColor: "text-feature-ai-icon" },
  { icon: MapPin, title: "Nearby Care", description: "Find hospitals, clinics, and pharmacies near you with directions", bg: "bg-feature-hospital", iconColor: "text-feature-hospital-icon" },
  { icon: Stethoscope, title: "Find Doctors", description: "Search specialists by condition, view ratings, and call directly", bg: "bg-feature-doctor", iconColor: "text-feature-doctor-icon" },
  { icon: Shield, title: "Safe & Private", description: "Your health data is encrypted and never shared without consent", bg: "bg-accent", iconColor: "text-primary" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="text-xl font-bold">Vital<span className="text-primary">Wave</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link to="/dashboard">Login</Link></Button>
          <Button asChild><Link to="/dashboard">Register</Link></Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-16 px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Everything You Need for Better Health
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Comprehensive tools designed to make healthcare accessible and understandable
        </motion.p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="border border-border rounded-xl p-6 bg-card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`h-5 w-5 ${f.iconColor}`} />
              </div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
