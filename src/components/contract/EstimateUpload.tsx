import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { LineItem } from "@/types/contract";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onExtracted: (items: LineItem[], contractorName?: string) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data:...;base64,
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EstimateUpload({ onExtracted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    setFile(f);
    setLoading(true);
    try {
      const base64 = await fileToBase64(f);
      const { data, error } = await supabase.functions.invoke("extract-estimate", {
        body: { fileBase64: base64, mimeType: f.type },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const items: LineItem[] = (data.lineItems || []).map((li: any) => ({
        id: crypto.randomUUID(),
        description: li.description,
        quantity: li.quantity,
        unit: li.unit,
        unitPrice: li.unitPrice,
      }));

      onExtracted(items, data.contractorName);
      toast({
        title: "Estimate extracted",
        description: `Found ${items.length} line item${items.length !== 1 ? "s" : ""}`,
      });
    } catch (err: any) {
      console.error("Extraction failed:", err);
      toast({
        title: "Extraction failed",
        description: err.message || "Could not extract line items from this file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver ? "border-primary bg-primary/5" : file ? "border-accent bg-accent/5" : "border-border"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {loading ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Extracting line items…</p>
          <p className="text-xs text-muted-foreground">AI is reading the estimate</p>
        </div>
      ) : file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-accent shrink-0" />
            <span className="text-sm font-medium truncate">{file.name}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Upload Another
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full py-4 space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Upload Contractor Estimate</p>
          <p className="text-xs text-muted-foreground">
            PDF or image — AI will extract line items automatically
          </p>
        </button>
      )}
    </div>
  );
}
