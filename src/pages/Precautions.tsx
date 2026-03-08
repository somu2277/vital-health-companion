import { AlertTriangle } from "lucide-react";

export default function Precautions() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Precautions</h1>
        <p className="text-muted-foreground">Safety precautions based on your conditions and medications</p>
      </div>
      <div className="border border-border rounded-xl p-12 bg-card flex flex-col items-center text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mb-4 opacity-30" />
        <p className="font-medium">No precautions yet</p>
        <p className="text-sm mt-1">Precautions will be generated after uploading your medical reports</p>
      </div>
    </div>
  );
}
