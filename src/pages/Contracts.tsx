import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ContractData } from "@/types/contract";
import ContractForm from "@/components/contract/ContractForm";
import ContractPreview from "@/components/contract/ContractPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Contracts() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Could pre-fill from property context
  const fromProperty = searchParams.get("property");

  if (contracts.length > 0) {
    const current = contracts[currentIdx];
    const contractorName = current.contractor.name || `Contractor ${currentIdx + 1}`;

    return (
      <div className="crm-page animate-slide-in">
        {/* Navigation between contracts */}
        {contracts.length > 1 && (
          <div className="no-print flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIdx(currentIdx - 1)}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">
              Contract {currentIdx + 1} of {contracts.length}: <strong>{contractorName}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIdx(currentIdx + 1)}
              disabled={currentIdx === contracts.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <ContractPreview
          data={current}
          onBack={() => { setContracts([]); setCurrentIdx(0); }}
        />
      </div>
    );
  }

  return (
    <div className="crm-page animate-slide-in">
      <div className="no-print flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-3 w-3" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">ContractForge</h1>
            <p className="text-xs text-muted-foreground">Generate Owner-Contractor Agreements</p>
          </div>
        </div>
      </div>

      <ContractForm onGenerate={(data) => { setContracts(data); setCurrentIdx(0); }} />
    </div>
  );
}