import { useState } from "react";
import {
  SharedContractData, BatchContractorEntry, ContractData,
  defaultSharedData, defaultCompanyInfo, createEmptyBatchEntry, mergeToContractData,
} from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileText, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import BatchContractorPanel from "@/components/BatchContractorPanel";
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

interface Props {
  onGenerate: (contracts: ContractData[]) => void;
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

export default function ContractForm({ onGenerate }: Props) {
  const [shared, setShared] = useState<SharedContractData>(defaultSharedData);
  const [entries, setEntries] = useState<BatchContractorEntry[]>([createEmptyBatchEntry()]);
  const [step, setStep] = useState(0);
  const [ownerDoc, setOwnerDoc] = useState<File | null>(null);
  const [ownerExtracting, setOwnerExtracting] = useState(false);
  const { toast } = useToast();

  const updateOwner = (owner: SharedContractData["owner"]) => setShared({ ...shared, owner });

  const handleOwnerDocChange = async (file: File | null) => {
    setOwnerDoc(file);
    if (!file) return;

    setOwnerExtracting(true);
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("extract-tax-doc", {
        body: { fileBase64: base64, mimeType: file.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const updated = { ...shared.owner };
      if (data.businessName) updated.name = data.businessName;
      if (data.tin) updated.tin = data.tin;
      if (data.taxClassification) updated.taxClassification = data.taxClassification;
      if (data.address) updated.address = data.address;
      if (data.city) updated.city = data.city;
      if (data.state) updated.state = data.state;
      if (data.zip) updated.zip = data.zip;
      if (data.contactName) updated.contactName = data.contactName;

      updateOwner(updated);
      toast({ title: "EIN letter extracted", description: `Filled in ${data.businessName || "owner"} details` });
    } catch (err: any) {
      console.error("Owner doc extraction failed:", err);
      toast({ title: "Extraction failed", description: err.message || "Could not extract from this document", variant: "destructive" });
    } finally {
      setOwnerExtracting(false);
    }
  };

  const handleGenerate = () => {
    const contracts = entries.map((entry) => mergeToContractData(shared, entry));
    onGenerate(contracts);
  };

  const steps = [
    // Step 0: Owner
    <div key="owner" className="space-y-6">
      <h3 className="text-lg font-display font-semibold text-foreground">Your Company (Owner)</h3>
      <div className="relative">
        <DocumentUpload label="Upload EIN Letter or W-9" description="PDF or image — auto-fills your business name, EIN, and address" file={ownerDoc} onFileChange={handleOwnerDocChange} />
        {ownerExtracting && (
          <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Extracting owner details…</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Business Name (as shown on W-9)</Label>
          <Input value={shared.owner.name} onChange={(e) => updateOwner({ ...shared.owner, name: e.target.value })} placeholder="Kavana Ventures LLC" />
        </div>
        <div className="space-y-1.5">
          <Label>Contact / Signatory Name</Label>
          <Input value={shared.owner.contactName} onChange={(e) => updateOwner({ ...shared.owner, contactName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Entity Type & State</Label>
          <Input value={shared.owner.entityType || ""} onChange={(e) => updateOwner({ ...shared.owner, entityType: e.target.value })} placeholder="Colorado LLC" />
        </div>
        <div className="space-y-1.5">
          <Label>Signatory Title</Label>
          <Input value={shared.owner.signatoryTitle || ""} onChange={(e) => updateOwner({ ...shared.owner, signatoryTitle: e.target.value })} placeholder="Managing Member" />
        </div>
        <div className="space-y-1.5">
          <Label>Tax Classification</Label>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={shared.owner.taxClassification} onChange={(e) => updateOwner({ ...shared.owner, taxClassification: e.target.value })}>
            <option value="">Select classification…</option>
            {TAX_CLASSIFICATIONS.map((tc) => <option key={tc} value={tc}>{tc}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>EIN / TIN</Label>
          <Input value={shared.owner.tin} onChange={(e) => updateOwner({ ...shared.owner, tin: e.target.value })} placeholder="XX-XXXXXXX" />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label>Street Address</Label>
          <Input value={shared.owner.address} onChange={(e) => updateOwner({ ...shared.owner, address: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={shared.owner.city} onChange={(e) => updateOwner({ ...shared.owner, city: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={shared.owner.state} onChange={(e) => updateOwner({ ...shared.owner, state: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>ZIP</Label>
            <Input value={shared.owner.zip} onChange={(e) => updateOwner({ ...shared.owner, zip: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={shared.owner.phone} onChange={(e) => updateOwner({ ...shared.owner, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={shared.owner.email} onChange={(e) => updateOwner({ ...shared.owner, email: e.target.value })} />
        </div>
      </div>
    </div>,

    // Step 1: Property & Terms
    <div key="property" className="space-y-6">
      <h3 className="text-lg font-display font-semibold text-foreground">Property & Project Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <Label>Project Name</Label>
          <Input value={shared.projectName} onChange={(e) => setShared({ ...shared, projectName: e.target.value })} placeholder="Kitchen & Master Bath Remodel" />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label>Property Address</Label>
          <AddressAutocomplete
            value={shared.propertyAddress}
            onChange={(parsed) => setShared({
              ...shared,
              propertyAddress: parsed.street,
              propertyCity: parsed.city,
              propertyState: parsed.state,
              propertyZip: parsed.zip,
              governingState: parsed.state || shared.governingState,
            })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={shared.propertyCity} onChange={(e) => setShared({ ...shared, propertyCity: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={shared.propertyState} onChange={(e) => setShared({ ...shared, propertyState: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>ZIP</Label>
            <Input value={shared.propertyZip} onChange={(e) => setShared({ ...shared, propertyZip: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Final Completion (days after Substantial)</Label>
          <Input type="number" min={0} value={shared.finalCompletionDays} onChange={(e) => setShared({ ...shared, finalCompletionDays: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Work Hours</Label>
          <Input value={shared.workHours} onChange={(e) => setShared({ ...shared, workHours: e.target.value })} placeholder="7:00 AM – 6:00 PM, Mon–Fri" />
        </div>
      </div>

      <h3 className="text-lg font-display font-semibold text-foreground pt-4">Contract Terms (Applied to All)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Payment Schedule</Label>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={shared.paymentSchedule} onChange={(e) => setShared({ ...shared, paymentSchedule: e.target.value })}>
            <option value="progress">Progress Payments (milestone-based)</option>
            <option value="monthly">Monthly Draws</option>
            <option value="thirds">Thirds (start / midpoint / completion)</option>
            <option value="completion">Upon Completion</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Retainage (%)</Label>
          <Input type="number" min={0} max={20} value={shared.retainagePercent} onChange={(e) => setShared({ ...shared, retainagePercent: Number(e.target.value) })} />
        </div>
        {shared.paymentSchedule === "monthly" && (
          <>
            <div className="space-y-1.5">
              <Label>Billing Day of Month</Label>
              <Input type="number" min={1} max={28} value={shared.billingDay} onChange={(e) => setShared({ ...shared, billingDay: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Net Payment Days</Label>
              <Input type="number" min={1} value={shared.netPaymentDays} onChange={(e) => setShared({ ...shared, netPaymentDays: Number(e.target.value) })} />
            </div>
          </>
        )}
        <div className="space-y-1.5">
          <Label>Liquidated Damages ($/day)</Label>
          <Input type="number" min={0} value={shared.liquidatedDamagesPerDay} onChange={(e) => setShared({ ...shared, liquidatedDamagesPerDay: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Termination Notice Period</Label>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={shared.convenienceTerminationNoticeDays} onChange={(e) => setShared({ ...shared, convenienceTerminationNoticeDays: Number(e.target.value) })}>
            <option value={0}>At will, immediate</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Warranty Period – Labor Only (months)</Label>
          <Input type="number" min={0} value={shared.warrantyPeriodMonths} onChange={(e) => setShared({ ...shared, warrantyPeriodMonths: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Dispute Resolution</Label>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={shared.disputeResolution} onChange={(e) => setShared({ ...shared, disputeResolution: e.target.value })}>
            <option value="mediation">Mediation, then Arbitration</option>
            <option value="arbitration">Binding Arbitration</option>
            <option value="litigation">Litigation</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-display font-semibold text-foreground pt-4">Change Order Markup Caps</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Overhead (%)</Label>
          <Input type="number" min={0} max={25} value={shared.overheadMarkupPercent} onChange={(e) => setShared({ ...shared, overheadMarkupPercent: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Profit (%)</Label>
          <Input type="number" min={0} max={25} value={shared.profitMarkupPercent} onChange={(e) => setShared({ ...shared, profitMarkupPercent: Number(e.target.value) })} />
        </div>
      </div>

      <h3 className="text-lg font-display font-semibold text-foreground pt-4">Governing Law & Venue</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Governing State</Label>
          <Input value={shared.governingState} onChange={(e) => setShared({ ...shared, governingState: e.target.value })} placeholder="Colorado" />
        </div>
        <div className="space-y-1.5">
          <Label>Venue (County, State)</Label>
          <Input value={shared.venueCounty} onChange={(e) => setShared({ ...shared, venueCounty: e.target.value })} placeholder="Denver County, Colorado" />
        </div>
      </div>
    </div>,

    // Step 2: Batch Contractors
    <div key="contractors">
      <BatchContractorPanel entries={entries} onChange={setEntries} />
    </div>,
  ];

  const stepLabels = ["Owner", "Property & Terms", "Contractors"];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8 no-print">
        {stepLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              i === step ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <Card className="p-6 md:p-8">
        {steps[step]}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={entries.length === 0}>
              <FileText className="h-4 w-4 mr-1" /> Generate {entries.length} Contract{entries.length !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
