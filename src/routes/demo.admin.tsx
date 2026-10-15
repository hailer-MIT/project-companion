import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashHeader, Panel, Stat, StatusBadge } from "@/components/dash";
import { applications, COMMISSION, payments } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/admin")({
  component: Admin,
});

const checkLabels = { degree: "Degree", experience: "Experience", references: "References", background: "Background check" } as const;

function Admin() {
  const [selected, setSelected] = useState(applications[0]!);
  const [pays, setPays] = useState(payments);
  const revenue = pays.filter((p) => p.status === "Confirmed").reduce((s, p) => s + p.amount, 0);
  const bgOk = selected.checks.background;
  return (
    <div className="space-y-6">
      <DashHeader title="Admin overview" text="Trust and money — the two things the admin must control." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active tutors" value="124" hint="+8 this month" />
        <Stat label="Active families" value="318" hint="+21 this month" />
        <Stat label="Sessions this week" value="642" />
        <Stat label="Platform commission" value={`${Math.round(revenue * COMMISSION).toLocaleString()} ETB`} hint={`${COMMISSION * 100}% of confirmed`} />
      </div>

      <Panel title="Teacher recruitment">
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <ul className="space-y-2">
            {applications.map((a) => (
              <li key={a.id}>
                <button onClick={() => setSelected(a)} className={`w-full rounded-xl border p-3 text-left ${selected.id === a.id ? "border-primary bg-primary/5" : ""}`}>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.discipline} · {a.experience} · {a.submitted}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="font-semibold">{selected.name}</p>
            <p className="text-sm text-muted-foreground">{selected.discipline}</p>
            <ul className="mt-4 space-y-2">
              {(Object.keys(checkLabels) as (keyof typeof checkLabels)[]).map((k) => (
                <li key={k} className="flex items-center gap-2 text-sm">
                  {selected.checks[k] ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />} {checkLabels[k]}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <Button disabled={!bgOk} onClick={() => toast.success(`${selected.name} approved`, { description: "Telegram message sent to the applicant." })}>Approve</Button>
              <Button variant="outline" onClick={() => toast(`${selected.name} rejected`)}>Reject</Button>
            </div>
            {!bgOk && <p className="mt-2 text-xs text-muted-foreground">Approve is locked until the background check clears.</p>}
          </div>
        </div>
      </Panel>

      <Panel title="Payments & disputes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2">Date</th><th>Parent</th><th>Tutor</th><th>Method</th><th className="text-right">ETB</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {pays.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3">{p.date}</td><td>{p.parent}</td><td>{p.tutor}</td><td>{p.method}</td>
                  <td className="text-right">{p.amount.toLocaleString()}</td>
                  <td className="pl-3"><StatusBadge status={p.status} /></td>
                  <td className="text-right">
                    {p.status !== "Confirmed" && <Button size="sm" variant="outline" onClick={() => { setPays(pays.map((x) => x.id === p.id ? { ...x, status: "Confirmed" } : x)); toast.success("Payment confirmed — receipt sent on Telegram"); }}>{p.status === "Disputed" ? "Resolve" : "Confirm"}</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
