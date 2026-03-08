import { ContractData } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import ContractBody from "./contract/ContractBody";
import ContractSignatures from "./contract/ContractSignatures";

interface Props {
  data: ContractData;
  onBack: () => void;
}

export default function ContractPreview({ data, onBack }: Props) {
  const handlePrint = () => window.print();

  return (
    <div>
      <div className="no-print flex items-center justify-between max-w-4xl mx-auto mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Edit Contract
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Printer className="h-4 w-4 mr-1" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="contract-paper font-body text-sm leading-relaxed text-card-foreground">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-display font-bold tracking-tight mb-1">OWNER-CONTRACTOR AGREEMENT</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Residential / Light Commercial — With Owner Protections
          </p>
          <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
        </div>

        <ContractBody data={data} />
        <ContractSignatures data={data} />

        {/* Disclaimer */}
        <div className="mt-12 pt-4 border-t border-foreground/10 text-[10px] text-muted-foreground">
          <p>
            <strong>DISCLAIMER:</strong> This contract template is provided for informational purposes only and does
            not constitute legal advice. It is recommended that both parties consult with a licensed attorney before
            executing this agreement to ensure compliance with applicable state and local laws.
          </p>
        </div>
      </div>
    </div>
  );
}
