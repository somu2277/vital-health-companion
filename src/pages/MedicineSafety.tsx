import { Shield, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MedicineSafety() {
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
            <input placeholder="Enter medicine name..." className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button className="gap-2"><Shield className="h-4 w-4" /> Check Safety</Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Enter a medicine to check its safety</p>
          <p className="text-sm mt-1">We'll analyze interactions, side effects, and warnings</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-lg bg-warning/10">
        <AlertCircle className="h-4 w-4 text-warning shrink-0" />
        Always consult your pharmacist or doctor about medicine safety.
      </div>
    </div>
  );
}
