import { ContractData } from "@/types/contract";

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (d: string) => {
  if (!d) return "_______________";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const blank = (s?: string) => s || "_______________";

export function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-3">
        {num}) {title}
      </h2>
      {children}
    </div>
  );
}

export function AddendumSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-3">
        {id}) {title}
      </h2>
      {children}
    </div>
  );
}
