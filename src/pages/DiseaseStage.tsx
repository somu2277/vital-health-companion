import { HeartPulse } from "lucide-react";

export default function DiseaseStage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Disease Stage</h1>
        <p className="text-muted-foreground">AI-powered disease stage prediction based on your reports</p>
      </div>
      <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center text-muted-foreground">
        <HeartPulse className="h-12 w-12 mb-4 opacity-30" />
        <p className="font-medium">No disease data available</p>
        <p className="text-sm mt-1">Upload medical reports to get AI-powered disease stage predictions</p>
      </div>
    </div>
  );
}
