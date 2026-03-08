import { HelpCircle, Phone, Shield, Heart } from "lucide-react";

const helpItems = [
  { icon: Phone, title: "Emergency Numbers", desc: "Call 112 for emergencies, 108 for ambulance" },
  { icon: Shield, title: "Data Privacy", desc: "Your health data is encrypted and stored securely" },
  { icon: Heart, title: "Mental Health", desc: "If you're in crisis, reach out to a helpline near you" },
];

export default function HelpSafety() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Safety</h1>
        <p className="text-muted-foreground">Important resources and safety information</p>
      </div>
      <div className="space-y-4">
        {helpItems.map((item, i) => (
          <div key={i} className="border border-border rounded-xl p-5 bg-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
