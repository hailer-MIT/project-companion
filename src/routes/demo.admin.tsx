import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashHeader, Panel, Stat, StatusBadge } from "@/components/dash";
import { applications, COMMISSION, payments } from "@/lib/demo-data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApplications, setApplicationStatus } from "@/lib/applications.functions";
import { listBotRequests, resolveBotRequest, type BotRequest } from "@/lib/telegram.functions";

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

      <RealApplications />

      <BotRequestsPanel />

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

function RealApplications() {
  const list = useServerFn(listApplications);
  const setStatus = useServerFn(setApplicationStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["applications"], queryFn: () => list() });
  const act = async (id: string, status: "approved" | "rejected") => {
    await setStatus({ data: { id, status } });
    toast.success(`Application ${status}`);
    qc.invalidateQueries({ queryKey: ["applications"] });
  };
  return (
    <Panel title="Real applications (from the Apply page)">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !data?.length ? (
        <p className="text-sm text-muted-foreground">No applications yet. Submit one on the "Teach with us" page to see it here.</p>
      ) : (
        <ul className="divide-y">
          {data.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{a.full_name}</p>
                <p className="text-xs text-muted-foreground">{a.subjects.join(", ") || "No subjects"} · {a.years_experience ?? 0} years{a.telegram ? ` · ${a.telegram}` : ""} · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              {a.status === "pending" ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => act(a.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => act(a.id, "rejected")}>Reject</Button>
                </div>
              ) : <span className="text-sm capitalize text-muted-foreground">{a.status}</span>}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const kindLabels: Record<string, string> = {
  support: "🆘 Support question",
  payment: "💳 Payment claimed",
  reschedule: "🔁 Reschedule request",
};

function BotRequestsPanel() {
  const list = useServerFn(listBotRequests);
  const resolve = useServerFn(resolveBotRequest);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["bot-requests"], queryFn: () => list() });
  const done = async (id: string) => {
    await resolve({ data: { id } });
    toast.success("Marked as handled");
    qc.invalidateQueries({ queryKey: ["bot-requests"] });
  };
  return (
    <Panel title="Telegram requests (from parents)">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          Nothing yet. When a parent taps “✅ I've paid”, “🔁 Reschedule” or sends a support question to the bot, it appears here.
        </p>
      ) : (
        <ul className="divide-y">
          {data.map((r: BotRequest) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{kindLabels[r.kind] ?? r.kind}{r.status === "resolved" ? " · handled" : ""}</p>
                <p className="text-xs text-muted-foreground">{r.who} · {new Date(r.created_at).toLocaleString()}</p>
                {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
              </div>
              {r.status === "open" && (
                <Button size="sm" variant="outline" onClick={() => done(r.id)}>Mark handled</Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
