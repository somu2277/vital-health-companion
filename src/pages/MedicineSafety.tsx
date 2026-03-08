import { useState } from "react";
import { Shield, Search, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SafetyResult = {
  safety_score: number;
  warnings: string[];
  interactions: string[];
  side_effects: string[];
};

export default function MedicineSafety() {
  const [medicine, setMedicine] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);

  const checkSafety = async () => {
    if (!medicine.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-health", {
        body: { action: "medicine-safety", data: { medicine } },
      });
      if (error || data?.error) throw new Error(data?.error || "Check failed");
      setResult(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medicine Safety</h1>
        <p className="text-muted-foreground">Check medicine safety, interactions, and warnings</p>
      </div>
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={medicine} onChange={e => setMedicine(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkSafety()}
              placeholder="Enter medicine name..." className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button className="gap-2" onClick={checkSafety} disabled={loading || !medicine.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} Check Safety
          </Button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`text-3xl font-bold ${result.safety_score >= 70 ? "text-success" : result.safety_score >= 40 ? "text-warning" : "text-destructive"}`}>
                {result.safety_score}/100
              </div>
              <p className="text-sm text-muted-foreground">Safety Score</p>
            </div>
            {result.warnings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-destructive">⚠️ Warnings</h3>
                <ul className="space-y-1">{result.warnings.map((w, i) => <li key={i} className="text-sm text-muted-foreground">• {w}</li>)}</ul>
              </div>
            )}
            {result.interactions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Drug Interactions</h3>
                <ul className="space-y-1">{result.interactions.map((w, i) => <li key={i} className="text-sm text-muted-foreground">• {w}</li>)}</ul>
              </div>
            )}
            {result.side_effects.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Side Effects</h3>
                <ul className="space-y-1">{result.side_effects.map((w, i) => <li key={i} className="text-sm text-muted-foreground">• {w}</li>)}</ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Enter a medicine to check its safety</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-lg bg-warning/10">
        <AlertCircle className="h-4 w-4 text-warning shrink-0" />
        Always consult your pharmacist or doctor about medicine safety.
      </div>
    </div>
  );
}
