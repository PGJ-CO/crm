import { ContractData } from "@/types/contract";
import { fmtDate, blank } from "./ContractHelpers";

interface Props {
  data: ContractData;
}

export default function ContractSignatures({ data }: Props) {
  return (
    <div className="mt-12 pt-8 border-t-2 border-foreground/20">
      <p className="font-display font-semibold mb-8">
        IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.
      </p>
      <div className="grid grid-cols-2 gap-12">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">OWNER</p>
          <p className="text-xs font-semibold mb-2">{blank(data.owner.name)}</p>
          <div className="border-b border-foreground/40 h-12 mb-2" />
          <p className="text-xs">
            By: {blank(data.owner.contactName)}
            {data.owner.signatoryTitle ? `, ${data.owner.signatoryTitle}` : ""}
          </p>
          <div className="border-b border-foreground/40 h-8 mt-4 mb-2" />
          <p className="text-xs">Date</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">CONTRACTOR</p>
          <p className="text-xs font-semibold mb-2">{blank(data.contractor.name)}</p>
          <div className="border-b border-foreground/40 h-12 mb-2" />
          <p className="text-xs">
            By: {blank(data.contractor.contactName)}
            {data.contractor.signatoryTitle ? `, ${data.contractor.signatoryTitle}` : ""}
          </p>
          <div className="border-b border-foreground/40 h-8 mt-4 mb-2" />
          <p className="text-xs">Date</p>
        </div>
      </div>
    </div>
  );
}
