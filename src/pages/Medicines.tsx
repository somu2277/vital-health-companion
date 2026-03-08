import { Pill, CheckCircle, ExternalLink } from "lucide-react";
import { AlertCircle } from "lucide-react";

const mockMedicines = [
  { name: "Amoxicillin (Timiox)", dosage: "500mg", source: "BLOG-PT-14-1.png", available: true },
  { name: "Amoxicillin", dosage: "500mg", source: "BLOG-PT-14-1.png", available: true },
];

const pharmacies = [
  { name: "1mg", color: "bg-success/10 text-success" },
  { name: "PharmEasy", color: "bg-info/10 text-info" },
  { name: "Apollo Pharmacy", color: "bg-accent text-accent-foreground" },
];

export default function Medicines() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Medicines</h1>
        <p className="text-muted-foreground">Manage your prescriptions and find pharmacies</p>
      </div>

      <div className="border border-border rounded-xl p-6 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Your Medicines ({mockMedicines.length})</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {mockMedicines.map((med, i) => (
            <div key={i} className="border border-border rounded-xl p-4 bg-background">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">{med.name}</h3>
                {med.available && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="h-3 w-3" /> Available
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{med.dosage}</p>
              <p className="text-xs text-muted-foreground mt-2">From: {med.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Online */}
      <div className="border border-border rounded-xl p-6 bg-card">
        <h2 className="font-semibold mb-4">Order Online</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {pharmacies.map(p => (
            <button key={p.name} className={`flex items-center justify-between p-4 rounded-xl border border-border ${p.color} hover:opacity-80 transition-opacity`}>
              <span className="font-medium">{p.name}</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-lg bg-warning/10">
        <AlertCircle className="h-4 w-4 text-warning shrink-0" />
        Always verify medicine availability and dosage with your pharmacist. Never change your medication without consulting your doctor.
      </div>
    </div>
  );
}
