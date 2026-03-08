import { useState, useCallback } from "react";
import { Upload, FileText, Camera, Type, LinkIcon, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

type AnalysisResult = {
  disease?: string;
  medicines?: { name: string; dosage: string; frequency: string; duration: string }[];
  summary?: string;
  report_type?: string;
};

async function runOCR(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  return text;
}

export default function UploadReports() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [textInput, setTextInput] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const processReport = async (reportText: string, fileUrl?: string) => {
    if (!user) return;

    setStatus(t("upload.analyzingDoc"));
    setProgress(60);

    const { data: aiResult, error: aiError } = await supabase.functions.invoke("ai-health", {
      body: { action: "analyze-report", data: { reportText } },
    });

    if (aiError || aiResult?.error) {
      toast.error(aiResult?.error || "AI analysis failed");
      setUploading(false);
      return;
    }

    setProgress(80);
    setStatus(t("upload.savingResults"));

    await supabase.from("medical_reports").insert({
      user_id: user.id,
      file_url: fileUrl || null,
      report_text: reportText,
      report_type: aiResult.report_type || "other",
      summary: aiResult.summary || "",
    });

    if (aiResult.medicines?.length) {
      const medsToInsert = aiResult.medicines.map((m: any) => ({
        user_id: user.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        source_report: files[0]?.name || "text-input",
      }));
      await supabase.from("medicines").insert(medsToInsert);

      for (const m of aiResult.medicines) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "medicine_reminder",
          message: `Take ${m.name} (${m.dosage}) - ${m.frequency}`,
          status: "active",
        });
      }
    }

    if (aiResult.disease) {
      await supabase.from("disease_stages").insert({
        user_id: user.id,
        disease: aiResult.disease,
        stage: t("diseaseStage.pendingAnalysis"),
        confidence: 0,
      });
    }

    setProgress(100);
    setStatus(t("upload.complete"));
    setResult(aiResult);
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["medicines"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["disease-stages"] });
    toast.success(t("upload.uploadSuccess"));
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;
    setUploading(true);
    setProgress(10);
    setStatus(t("upload.uploading"));

    try {
      const file = files[0];
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress(25);
      setStatus(t("upload.extracting"));

      let reportText = "";
      if (file.type.startsWith("text/")) {
        reportText = await file.text();
      } else if (file.type.startsWith("image/")) {
        try {
          reportText = await runOCR(file);
          if (!reportText.trim()) {
            reportText = `[Image uploaded: ${file.name}]. Could not extract text via OCR. Please analyze as a medical document image.`;
          }
        } catch {
          reportText = `[Image uploaded: ${file.name}]. OCR failed. Please analyze as a medical document image.`;
        }
      } else {
        reportText = `[Uploaded file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024).toFixed(1)}KB]. Please analyze this medical document.`;
      }

      setProgress(45);
      setStatus(t("upload.textExtracted"));

      const { data: urlData } = supabase.storage.from("medical-reports").getPublicUrl(filePath);

      await processReport(reportText, urlData.publicUrl);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setUploading(true);
    setProgress(10);
    setStatus(t("upload.analyzing"));
    try {
      await processReport(textInput);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setUploading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <h2 className="text-xl font-bold">{t("upload.success")}</h2>
              <p className="text-sm text-muted-foreground">{t("upload.analyzed")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background mb-4">
            <span className="text-2xl">💊</span>
            <div>
              <p className="font-medium">{files[0]?.name || "Text input"}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{result.report_type}</span>
            </div>
          </div>

          {result.summary && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t("upload.summary")}</h3>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
          )}

          {result.disease && (
            <div className="mb-4 p-3 rounded-lg border border-border bg-background">
              <h3 className="font-semibold mb-1">{t("upload.detectedCondition")}</h3>
              <p className="text-sm text-primary font-medium">{result.disease}</p>
            </div>
          )}

          {result.medicines && result.medicines.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t("upload.medicinesFound")} ({result.medicines.length})</h3>
              {result.medicines.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💊</span>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.dosage} · {m.frequency}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent font-medium">{m.duration}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-lg bg-warning/10 text-sm mb-6">
            <p>⚠️ {t("common.disclaimer")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => { setResult(null); setFiles([]); setProgress(0); }}>{t("common.uploadAnother")}</Button>
            <Button onClick={() => navigate("/dashboard")}>{t("common.goToDashboard")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("upload.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("upload.description")}</p>
      </div>

      <div className="border border-border rounded-xl bg-card p-6">
        <Tabs defaultValue="file">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="file" className="gap-2"><FileText className="h-4 w-4" /> {t("upload.file")}</TabsTrigger>
            <TabsTrigger value="camera" className="gap-2"><Camera className="h-4 w-4" /> {t("upload.camera")}</TabsTrigger>
            <TabsTrigger value="text" className="gap-2"><Type className="h-4 w-4" /> {t("upload.text")}</TabsTrigger>
            <TabsTrigger value="link" className="gap-2"><LinkIcon className="h-4 w-4" /> {t("upload.link")}</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragActive ? "border-primary bg-accent/50" : "border-border hover:border-primary/50"}`}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">{t("upload.dragDrop")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("upload.supported")}</p>
              <input id="file-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={handleFileSelect} />
            </div>
          </TabsContent>

          <TabsContent value="camera">
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>{t("upload.cameraSoon")}</p>
            </div>
          </TabsContent>

          <TabsContent value="text">
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              className="w-full h-40 p-4 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("upload.pasteText")}
            />
            <Button className="w-full mt-4 h-12 gap-2" onClick={handleTextSubmit} disabled={!textInput.trim() || uploading}>
              {uploading ? <><Loader2 className="h-5 w-5 animate-spin" /> {t("upload.analyzing")}</> : <><Upload className="h-5 w-5" /> {t("upload.analyzeText")}</>}
            </Button>
          </TabsContent>

          <TabsContent value="link">
            <input type="url" className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t("upload.pasteLink")} />
          </TabsContent>
        </Tabs>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="p-1 hover:bg-accent rounded"><X className="h-4 w-4 text-muted-foreground" /></button>
              </motion.div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-center text-muted-foreground">{status} ({progress}%)</p>
          </div>
        )}

        {!uploading && files.length > 0 && (
          <Button className="w-full mt-6 h-12 text-base gap-2" onClick={handleUpload}>
            <Upload className="h-5 w-5" /> {t("upload.uploadAnalyze")}
          </Button>
        )}
      </div>
    </div>
  );
}
