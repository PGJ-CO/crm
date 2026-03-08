import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Plus, Trash2, Upload, FileText, X, Loader2, ChevronDown, ChevronUp, Users,
} from "lucide-react";
import { BatchContractorEntry, CompanyInfo, LineItem, createEmptyBatchEntry } from "@/types/contract";
import DocumentUpload from "@/components/DocumentUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TAX_CLASSIFICATIONS = [
  "Individual/Sole Proprietor",
  "C Corporation",
  "S Corporation",
  "Partnership",
  "LLC – C Corporation",
  "LLC – S Corporation",
  "LLC – Partnership",
  "LLC – Disregarded Entity",
  "Trust/Estate",
  "Other",
];

interface Props {
  entries: BatchContractorEntry[];
  onChange: (entries: BatchContractorEntry[]) => void;
}

export default function BatchContractorPanel({ entries, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(entries[0]?.id ?? null);
  const [w9Files, setW9Files] = useState<Record<string, File | null>>({});
  const [w9Extracting, setW9Extracting] = useState<Record<string, boolean>>({});
  const estimateRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const handleW9Upload = async (entryId: string, file: File | null) => {
    setW9Files((prev) => ({ ...prev, [entryId]: file }));
    if (!file) return;

    setW9Extracting((prev) => ({ ...prev, [entryId]: true }));
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("extract-tax-doc", {
        body: { fileBase64: base64, mimeType: file.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const entry = entries.find((e) => e.id === entryId);
      const updated = { ...(entry?.contractor || {} as CompanyInfo) };
      if (data.businessName) updated.name = data.businessName;
      if (data.tin) updated.tin = data.tin;
      if (data.taxClassification) updated.taxClassification = data.taxClassification;
      if (data.address) updated.address = data.address;
      if (data.city) updated.city = data.city;
      if (data.state) updated.state = data.state;
      if (data.zip) updated.zip = data.zip;
      if (data.contactName) updated.contactName = data.contactName;

      updateContractor(entryId, updated);
      toast({ title: "W-9 extracted", description: `Filled in ${data.businessName || "contractor"} details` });
    } catch (err: any) {
      console.error("W-9 extraction failed:", err);
      toast({ title: "Extraction failed", description: err.message || "Could not extract from this document", variant: "destructive" });
    } finally {
      setW9Extracting((prev) => ({ ...prev, [entryId]: false }));
    }
  };

  const addEntry = () => {
    const entry = createEmptyBatchEntry();
    onChange([...entries, entry]);
    setExpandedId(entry.id);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(entries.find((e) => e.id !== id)?.id ?? null);
  };

  const updateEntry = (id: string, updates: Partial<BatchContractorEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const updateContractor = (id: string, contractor: CompanyInfo) => {
    updateEntry(id, { contractor });
  };

  const handleEstimateUpload = async (entryId: string, file: File) => {
    updateEntry(entryId, { extractionStatus: "loading" });
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("extract-estimate", {
        body: { fileBase64: base64, mimeType: file.type },
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

      const entry = entries.find((e) => e.id === entryId);
      const updates: Partial<BatchContractorEntry> = {
        lineItems: [...(entry?.lineItems || []), ...items],
        extractionStatus: "done" as const,
      };

      // Merge contractor contact info from estimate (only fill empty fields)
      const c = { ...(entry?.contractor || {} as CompanyInfo) };
      if (data.contractorName && !c.name) c.name = data.contractorName;
      if (data.contractorPhone && !c.phone) c.phone = data.contractorPhone;
      if (data.contractorEmail && !c.email) c.email = data.contractorEmail;
      if (data.contractorContactName && !c.contactName) c.contactName = data.contractorContactName;
      if (data.contractorAddress && !c.address) c.address = data.contractorAddress;
      if (data.contractorCity && !c.city) c.city = data.contractorCity;
      if (data.contractorState && !c.state) c.state = data.contractorState;
      if (data.contractorZip && !c.zip) c.zip = data.contractorZip;
      if (data.contractorLicense && !c.licenseNumber) c.licenseNumber = data.contractorLicense;
      updates.contractor = c;

      if (data.scopeOfWork) {
        updates.scopeOfWork = data.scopeOfWork;
      }
      if (data.timeline) {
        updates.timeline = data.timeline;
      }

      updateEntry(entryId, updates);
      toast({
        title: "Estimate extracted",
        description: `${items.length} line item${items.length !== 1 ? "s" : ""} + scope${data.timeline ? " + timeline" : ""} extracted`,
      });
    } catch (err: any) {
      console.error("Extraction failed:", err);
      updateEntry(entryId, { extractionStatus: "error" });
      toast({
        title: "Extraction failed",
        description: err.message || "Could not extract from this file",
        variant: "destructive",
      });
    }
  };

  const addLineItem = (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, {
      lineItems: [...entry.lineItems, { id: crypto.randomUUID(), description: "", quantity: 1, unit: "ea", unitPrice: 0 }],
    });
  };

  const updateLineItem = (entryId: string, itemId: string, updates: Partial<LineItem>) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, {
      lineItems: entry.lineItems.map((li) => (li.id === itemId ? { ...li, ...updates } : li)),
    });
  };

  const removeLineItem = (entryId: string, itemId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, { lineItems: entry.lineItems.filter((li) => li.id !== itemId) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-display font-semibold text-foreground">
            Contractors ({entries.length})
          </h3>
        </div>
        <Button onClick={addEntry} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" /> Add Contractor
        </Button>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-3">No contractors added yet.</p>
          <Button onClick={addEntry} variant="outline">
            <Plus className="h-4 w-4 mr-1" /> Add First Contractor
          </Button>
        </div>
      )}

      {entries.map((entry, idx) => {
        const isExpanded = expandedId === entry.id;
        const total = entry.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
        const displayName = entry.contractor.name || `Contractor ${idx + 1}`;

        return (
          <Card key={entry.id} className="overflow-hidden">
            {/* Header - always visible */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.lineItems.length} item{entry.lineItems.length !== 1 ? "s" : ""}
                    {total > 0 && ` · $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                    {entry.scopeOfWork && " · Scope ✓"}
                    {entry.timeline && " · Timeline ✓"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entry.extractionStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-5 border-t border-border pt-4">
                {/* Estimate Upload */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Contractor Estimate</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center transition-colors border-border cursor-pointer hover:border-primary/50"
                    onClick={() => estimateRefs.current[entry.id]?.click()}
                  >
                    <input
                      ref={(el) => { estimateRefs.current[entry.id] = el; }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleEstimateUpload(entry.id, f);
                      }}
                    />
                    {entry.extractionStatus === "loading" ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Extracting line items, scope & timeline…</p>
                      </div>
                    ) : (
                      <div className="py-2 space-y-1">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Upload Estimate</p>
                        <p className="text-xs text-muted-foreground">PDF or image — extracts line items, scope & timeline</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* W-9 Upload */}
                <div className="relative">
                  <DocumentUpload
                    label="Upload Contractor's W-9"
                    description="PDF or image — auto-fills contractor name, EIN, and address"
                    file={w9Files[entry.id] || null}
                    onFileChange={(f) => handleW9Upload(entry.id, f)}
                  />
                  {w9Extracting[entry.id] && (
                    <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Extracting contractor details…</span>
                    </div>
                  )}
                </div>

                {/* Contractor Info */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Contractor Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Business Name</Label>
                      <Input value={entry.contractor.name} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, name: e.target.value })} placeholder="ABC Construction LLC" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact / Signatory</Label>
                      <Input value={entry.contractor.contactName} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, contactName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Entity Type</Label>
                      <Input value={entry.contractor.entityType || ""} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, entityType: e.target.value })} placeholder="Colorado LLC" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Signatory Title</Label>
                      <Input value={entry.contractor.signatoryTitle || ""} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, signatoryTitle: e.target.value })} placeholder="Managing Member" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tax Classification</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={entry.contractor.taxClassification} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, taxClassification: e.target.value })}>
                        <option value="">Select…</option>
                        {TAX_CLASSIFICATIONS.map((tc) => <option key={tc} value={tc}>{tc}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">EIN / TIN</Label>
                      <Input value={entry.contractor.tin} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, tin: e.target.value })} placeholder="XX-XXXXXXX" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Address</Label>
                      <Input value={entry.contractor.address} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, address: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">City</Label>
                      <Input value={entry.contractor.city} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, city: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">State</Label>
                        <Input value={entry.contractor.state} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, state: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">ZIP</Label>
                        <Input value={entry.contractor.zip} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, zip: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Phone</Label>
                      <Input value={entry.contractor.phone} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input value={entry.contractor.email} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, email: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">License #</Label>
                      <Input value={entry.contractor.licenseNumber || ""} onChange={(e) => updateContractor(entry.id, { ...entry.contractor, licenseNumber: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Schedule for This Trade</Label>
                  {entry.timeline && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Extracted from estimate:</p>
                      <p>{entry.timeline}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Date</Label>
                      <Input type="date" value={entry.startDate} onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Substantial Completion Date</Label>
                      <Input type="date" value={entry.estimatedCompletionDate} onChange={(e) => updateEntry(entry.id, { estimatedCompletionDate: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Scope of Work</Label>
                  <Textarea
                    value={entry.scopeOfWork}
                    onChange={(e) => updateEntry(entry.id, { scopeOfWork: e.target.value })}
                    placeholder="Auto-populated from estimate upload, or enter manually…"
                    rows={3}
                  />
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">Line Items ({entry.lineItems.length})</Label>
                    <Button onClick={() => addLineItem(entry.id)} size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {entry.lineItems.map((li, i) => (
                    <div key={li.id} className="grid grid-cols-12 gap-2 items-end mb-2">
                      <div className="col-span-12 md:col-span-5 space-y-1">
                        {i === 0 && <Label className="text-xs">Description</Label>}
                        <Input value={li.description} onChange={(e) => updateLineItem(entry.id, li.id, { description: e.target.value })} className="text-xs" />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        {i === 0 && <Label className="text-xs">Qty</Label>}
                        <Input type="number" min={0} value={li.quantity} onChange={(e) => updateLineItem(entry.id, li.id, { quantity: Number(e.target.value) })} className="text-xs" />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        {i === 0 && <Label className="text-xs">Unit</Label>}
                        <Input value={li.unit} onChange={(e) => updateLineItem(entry.id, li.id, { unit: e.target.value })} className="text-xs" />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        {i === 0 && <Label className="text-xs">Price</Label>}
                        <Input type="number" min={0} step={0.01} value={li.unitPrice} onChange={(e) => updateLineItem(entry.id, li.id, { unitPrice: Number(e.target.value) })} className="text-xs" />
                      </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => removeLineItem(entry.id, li.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {total > 0 && (
                    <div className="flex justify-end pt-2 border-t border-border mt-2">
                      <p className="text-sm font-semibold">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                </div>

                {/* Remove */}
                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => removeEntry(entry.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" /> Remove Contractor
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
