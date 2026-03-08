import { Search, Stethoscope, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockDoctors = [
  { name: "Dr. Sarah Johnson", specialty: "General Physician", rating: 4.8, experience: "12 years", available: true },
  { name: "Dr. Rajesh Kumar", specialty: "Cardiologist", rating: 4.9, experience: "18 years", available: true },
  { name: "Dr. Priya Sharma", specialty: "Dermatologist", rating: 4.7, experience: "8 years", available: false },
];

export default function FindDoctors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Doctors</h1>
        <p className="text-muted-foreground">Search specialists by condition, view ratings, and call directly</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name, specialty, or condition..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button>Search</Button>
      </div>

      <div className="space-y-4">
        {mockDoctors.map((doc, i) => (
          <div key={i} className="border border-border rounded-xl p-5 bg-card flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-feature-doctor flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-feature-doctor-icon" />
              </div>
              <div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-muted-foreground">{doc.specialty} · {doc.experience}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="text-xs font-medium">{doc.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${doc.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {doc.available ? "Available" : "Unavailable"}
              </span>
              <Button size="sm" variant="outline" className="gap-1">
                <Phone className="h-3 w-3" /> Call
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
