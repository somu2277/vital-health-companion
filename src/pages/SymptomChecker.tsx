import { useState } from "react";
import { Search, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const symptomsList = [
  "Fever", "Cough", "Cold", "Headache", "Fatigue", "Sore Throat",
  "Body Ache", "Shortness of Breath", "Loss of Taste/Smell",
  "Nausea", "Vomiting", "Diarrhea", "Abdominal Pain", "Chest Pain",
  "Dizziness", "Skin Rash", "Joint Pain", "Muscle Weakness",
  "Blurred Vision", "Insomnia",
];

type Condition = { name: string; probability: string; description: string };

export default function SymptomChecker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Condition[] | null>(null);
  const { user } = useAuth();

  const toggle = (s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const analyze = async () => {
    if (selected.length === 0 && !otherSymptoms) return;
    setLoading(true);

    try {
      // Save symptoms
      if (user) {
        const symptomsToInsert = selected.map(s => ({ user_id: user.id, symptom: s }));
        if (otherSymptoms) symptomsToInsert.push({ user_id: user.id, symptom: otherSymptoms });
        await supabase.from("symptoms").insert(symptomsToInsert);
      }

      const { data, error } = await supabase.functions.invoke("ai-health", {
        body: { action: "analyze-symptoms", data: { symptoms: selected, other: otherSymptoms } },
      });

      if (error || data?.error) throw new Error(data?.error || "Analysis failed");
      setResults(data.possible_conditions || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <div className="space-y-4">
          {results.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="border border-border rounded-xl p-5 bg-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{c.name}</h3>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  c.probability === "high" ? "bg-destructive/10 text-destructive" :
                  c.probability === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}>{c.probability}</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="p-4 rounded-lg bg-warning/10 text-sm">
          <AlertCircle className="h-4 w-4 text-warning inline mr-2" />
          This is NOT a medical diagnosis. Always consult a healthcare professional.
        </div>
        <Button variant="outline" onClick={() => { setResults(null); setSelected([]); setOtherSymptoms(""); }}>Check Again</Button>
      </div>
    );
  }

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
        <div className="md:col-span-2 border border-border rounded-xl p-6 bg-card">
          <h2 className="font-semibold mb-1">Select Symptoms</h2>
          <p className="text-sm text-muted-foreground mb-4">Check all symptoms you are currently experiencing</p>
          <div className="grid grid-cols-3 gap-3">
            {symptomsList.map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={selected.includes(s)} onChange={() => toggle(s)}
                  className="w-4 h-4 rounded border-border accent-primary" />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-border rounded-xl p-6 bg-card">
            <h2 className="font-semibold mb-1">Other Symptoms</h2>
            <textarea value={otherSymptoms} onChange={e => setOtherSymptoms(e.target.value)}
              placeholder="Describe anything else..."
              className="w-full h-32 p-3 rounded-lg border border-border bg-background resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-2" />
          </div>
          <Button className="w-full h-12 text-base gap-2" disabled={loading || (selected.length === 0 && !otherSymptoms)} onClick={analyze}>
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <>Analyze Symptoms <ChevronRight className="h-5 w-5" /></>}
          </Button>
          <div className="p-4 rounded-lg bg-info/10 text-sm">
            <AlertCircle className="h-4 w-4 text-info inline mr-2" />
            This tool uses AI to suggest possibilities and is NOT a medical diagnosis.
          </div>
        </div>
      </div>
    </div>
  );
}
