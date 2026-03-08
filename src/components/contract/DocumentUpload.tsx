import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";

interface Props {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function DocumentUpload({ label, description, file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        dragOver ? "border-primary bg-primary/5" : file ? "border-accent bg-accent/5" : "border-border"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-accent shrink-0" />
            <span className="text-sm font-medium truncate">{file.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onFileChange(null)} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full py-3 space-y-1">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </button>
      )}
    </div>
  );
}
