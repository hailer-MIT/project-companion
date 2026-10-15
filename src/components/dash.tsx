import type { ReactNode } from "react";

export function DashHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-success">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

const tones: Record<string, string> = {
  Paid: "bg-success/15 text-success",
  Confirmed: "bg-success/15 text-success",
  "Pending review": "bg-accent/25 text-accent-foreground",
  "Awaiting payment": "bg-accent/25 text-accent-foreground",
  Disputed: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[status] ?? "bg-muted"}`}>{status}</span>;
}

export function Trend({ values }: { values: number[] }) {
  return (
    <div className="flex h-24 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${v}%` }} />
          <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
