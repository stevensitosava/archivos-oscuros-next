import type { ReactNode } from "react";

export function AdminHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] text-bone-50">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel p-5">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-ash-500">{label}</p>
      <p className="mt-2 text-[1.8rem] font-semibold text-bone-50">{value}</p>
      {hint && <p className="mt-1 text-[0.8rem] text-ash-500">{hint}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`panel overflow-hidden ${className}`}>{children}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="panel flex flex-col items-center gap-2 p-12 text-center">
      <p className="text-[1.05rem] text-bone-100">{title}</p>
      {hint && <p className="max-w-sm text-[0.9rem] text-ash-500">{hint}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  failed: "border-ember-500/30 bg-ember-500/10 text-ember-300",
  refunded: "border-ash-500/30 bg-ash-500/10 text-ash-300",
  subscribed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  unsubscribed: "border-ash-500/30 bg-ash-500/10 text-ash-400",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "border-bone-100/15 bg-ink-800 text-ash-300";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

/* Table primitives — consistent dark, bordered, scrollable on mobile. */
export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-[0.9rem]">
        <thead className="border-b border-bone-100/10 text-[0.72rem] uppercase tracking-[0.12em] text-ash-500">
          {head}
        </thead>
        <tbody className="divide-y divide-bone-100/[0.06]">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-normal ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-bone-200 ${className}`}>{children}</td>;
}
