import { useState } from "react";
import { Search, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const symptomsList = [
  "Fever", "Cough", "Cold", "Headache", "Fatigue", "Sore Throat",
  "Body Ache", "Shortness of Breath", "Loss of Taste/Smell",
  "Nausea", "Vomiting", "Diarrhea", "Abdominal Pain", "Chest Pain",
  "Dizziness", "Skin Rash", "Joint Pain", "Muscle Weakness",
  "Blurred Vision", "Insomnia",
];

export default function SymptomChecker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState("");

  const toggle = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Symptom Checker</h1>
        </div>
        <p className="text-muted-foreground mt-1">Predict possible conditions based on how you feel</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Symptoms grid */}
        <div className="md:col-span-2 border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Search className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Select Symptoms</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Check all symptoms you are currently experiencing</p>
          <div className="grid grid-cols-3 gap-3">
            {symptomsList.map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(s)}
                  onChange={() => toggle(s)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-ring accent-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Other + Analyze */}
        <div className="space-y-4">
          <div className="border border-border rounded-xl p-6 bg-card">
            <h2 className="font-semibold mb-1">Other Symptoms</h2>
            <p className="text-sm text-muted-foreground mb-3">Describe anything else in your own words</p>
            <textarea
              value={otherSymptoms}
              onChange={e => setOtherSymptoms(e.target.value)}
              placeholder="e.g. My eyes are watery and I have a sharp pain in my left knee..."
              className="w-full h-32 p-3 rounded-lg border border-border bg-background resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button className="w-full h-12 text-base gap-2" disabled={selected.length === 0 && !otherSymptoms}>
            Analyze Symptoms <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="p-4 rounded-lg bg-info/10 text-sm text-info-foreground">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <p>This tool uses AI to suggest possibilities and is NOT a medical diagnosis. Always consult a healthcare professional for serious concerns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
