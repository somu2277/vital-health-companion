import { AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Precautions() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const { data: precautions, isLoading, refetch } = useQuery({
    queryKey: ["precautions"],
    queryFn: async () => {
      const { data } = await supabase.from("precautions").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const generatePrecautions = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data: diseases } = await supabase.from("disease_stages").select("disease").eq("user_id", user.id);
      const { data: meds } = await supabase.from("medicines").select("name").eq("user_id", user.id);

      const { data, error } = await supabase.functions.invoke("ai-health", {
        body: {
          action: "generate-precautions",
          data: { diseases: diseases?.map(d => d.disease) || [], medicines: meds?.map(m => m.name) || [] },
        },
      });
      if (error || data?.error) throw new Error(data?.error || "Generation failed");

      const items = Array.isArray(data) ? data : [];
      const disease = diseases?.[0]?.disease || "General";
      const inserts = items.map((p: string) => ({ user_id: user.id, precaution: p, disease }));
      if (inserts.length > 0) await supabase.from("precautions").insert(inserts);
      refetch();
      toast.success("Precautions generated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Precautions</h1>
          <p className="text-muted-foreground">Safety precautions based on your conditions</p>
        </div>
        <Button onClick={generatePrecautions} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
          Generate
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : precautions && precautions.length > 0 ? (
        <div className="border border-border rounded-xl p-6 bg-card space-y-3">
          {precautions.map(p => (
            <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm">{p.precaution}</p>
                {p.disease && <p className="text-xs text-muted-foreground mt-1">For: {p.disease}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-4 opacity-30" />
          <p className="font-medium">No precautions yet</p>
          <p className="text-sm mt-1">Precautions will be generated after uploading your medical reports</p>
        </div>
      )}
    </div>
  );
}
