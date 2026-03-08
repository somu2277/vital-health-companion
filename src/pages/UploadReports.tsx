import { useState, useCallback } from "react";
import { Upload, FileText, Camera, Type, LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function UploadReports() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Medical Documents</h1>
        <p className="text-muted-foreground mt-1">Upload your prescriptions, lab reports, or medical images</p>
      </div>

      <div className="border border-border rounded-xl bg-card p-6">
        <Tabs defaultValue="file">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="file" className="gap-2"><FileText className="h-4 w-4" /> File</TabsTrigger>
            <TabsTrigger value="camera" className="gap-2"><Camera className="h-4 w-4" /> Camera</TabsTrigger>
            <TabsTrigger value="text" className="gap-2"><Type className="h-4 w-4" /> Text</TabsTrigger>
            <TabsTrigger value="link" className="gap-2"><LinkIcon className="h-4 w-4" /> Link</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragActive ? "border-primary bg-accent/50" : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Drag and drop files here, or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">Supported: PDF, JPG, PNG, TXT</p>
              <input id="file-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.txt" multiple onChange={handleFileSelect} />
            </div>
          </TabsContent>

          <TabsContent value="camera">
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Camera capture requires backend integration</p>
            </div>
          </TabsContent>

          <TabsContent value="text">
            <textarea
              className="w-full h-40 p-4 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste your medical report text here..."
            />
          </TabsContent>

          <TabsContent value="link">
            <input
              type="url"
              className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste a link to your medical document..."
            />
          </TabsContent>
        </Tabs>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="p-1 hover:bg-accent rounded">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <Button className="w-full mt-6 h-12 text-base gap-2" disabled={files.length === 0}>
          <Upload className="h-5 w-5" /> Upload
        </Button>
      </div>
    </div>
  );
}
