import { Clock, Loader2, Search, Pill, FileText, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function HistoryPage() {
  const [search, setSearch] = useState("");

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["reports-history"],
    queryFn: async () => {
      const { data } = await supabase.from("medical_reports").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: medicines, isLoading: medsLoading } = useQuery({
    queryKey: ["medicines-history"],
    queryFn: async () => {
      const { data } = await supabase.from("medicines").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ["stages-history"],
    queryFn: async () => {
      const { data } = await supabase.from("disease_stages").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filteredReports = reports?.filter(r =>
    !search || r.summary?.toLowerCase().includes(search.toLowerCase()) ||
    r.report_type?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMeds = medicines?.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.source_report?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">View your past uploads, medicines, and AI analyses</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search history..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="reports" className="gap-2"><FileText className="h-4 w-4" /> Reports ({reports?.length || 0})</TabsTrigger>
          <TabsTrigger value="medicines" className="gap-2"><Pill className="h-4 w-4" /> Medicines ({medicines?.length || 0})</TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2"><Brain className="h-4 w-4" /> AI Analysis ({stages?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          {reportsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredReports && filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(r => (
                <div key={r.id} className="border border-border rounded-xl p-5 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r.report_type || "Report"}</span>
                    <span className="text-xs text-muted-foreground">{r.created_at ? format(new Date(r.created_at), "MMM d, yyyy 'at' h:mm a") : ""}</span>
                  </div>
                  {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
                  {r.report_text && (
                    <details className="mt-2">
                      <summary className="text-xs text-primary cursor-pointer">View extracted text</summary>
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{r.report_text}</p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No reports yet" subtitle="Your uploaded reports will appear here" />
          )}
        </TabsContent>

        <TabsContent value="medicines" className="mt-4">
          {medsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredMeds && filteredMeds.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredMeds.map(m => (
                <div key={m.id} className="border border-border rounded-xl p-4 bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{m.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.dosage} · {m.frequency} · {m.duration}</p>
                  {m.source_report && <p className="text-xs text-muted-foreground mt-2">Source: {m.source_report}</p>}
                  <p className="text-xs text-muted-foreground">{m.created_at ? format(new Date(m.created_at), "MMM d, yyyy") : ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Pill} title="No medicines yet" subtitle="Medicines extracted from uploads will appear here" />
          )}
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          {stagesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : stages && stages.length > 0 ? (
            <div className="space-y-4">
              {stages.map(s => (
                <div key={s.id} className="border border-border rounded-xl p-5 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{s.disease}</h3>
                    {s.stage && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s.stage}</span>}
                  </div>
                  {s.confidence !== null && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${s.confidence}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{s.confidence}% confidence</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{s.created_at ? format(new Date(s.created_at), "MMM d, yyyy") : ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Brain} title="No AI analysis yet" subtitle="Disease predictions and analyses will appear here" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center justify-center text-muted-foreground">
      <Icon className="h-12 w-12 mb-4 opacity-30" />
      <p className="font-medium">{title}</p>
      <p className="text-sm mt-1">{subtitle}</p>
    </div>
  );
}
