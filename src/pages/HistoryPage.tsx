import { Clock, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";

export default function HistoryPage() {
  const [search, setSearch] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports-history"],
    queryFn: async () => {
      const { data } = await supabase.from("medical_reports").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = reports?.filter(r =>
    !search || r.summary?.toLowerCase().includes(search.toLowerCase()) ||
    r.report_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">View your past uploads and analyses</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="border border-border rounded-xl p-5 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r.report_type || "Report"}</span>
                <span className="text-xs text-muted-foreground">{r.created_at ? format(new Date(r.created_at), "MMM d, yyyy 'at' h:mm a") : ""}</span>
              </div>
              {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center justify-center text-muted-foreground">
          <Clock className="h-12 w-12 mb-4 opacity-30" />
          <p className="font-medium">No history yet</p>
          <p className="text-sm mt-1">Your uploaded reports and analyses will appear here</p>
        </div>
      )}
    </div>
  );
}
