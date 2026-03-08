import { Clock, FileText } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">View your past uploads and analyses</p>
      </div>
      <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center justify-center text-muted-foreground">
        <Clock className="h-12 w-12 mb-4 opacity-30" />
        <p className="font-medium">No history yet</p>
        <p className="text-sm mt-1">Your uploaded reports and analyses will appear here</p>
      </div>
    </div>
  );
}
