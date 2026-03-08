import { ClipboardList } from "lucide-react";

export default function CarePlan() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Care Plan</h1>
        <p className="text-muted-foreground">Personalized care plans generated from your health data</p>
      </div>
      <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center text-muted-foreground">
        <ClipboardList className="h-12 w-12 mb-4 opacity-30" />
        <p className="font-medium">No care plan yet</p>
        <p className="text-sm mt-1">Upload reports and complete symptom checks to generate your care plan</p>
      </div>
    </div>
  );
}
