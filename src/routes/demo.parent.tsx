import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashHeader, Panel, Stat, StatusBadge, Trend } from "@/components/dash";
import { children, payments, sessionNotes, upcomingSessions } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/parent")({
  component: Parent,
});

function Parent() {
  const [idx, setIdx] = useState(0);
  const c = children[idx]!;
  const mine = upcomingSessions.filter((s) => s.student === c.name);
  return (
    <div className="space-y-6">
      <DashHeader title="Hello, Almaz" text="Follow each child's progress, sessions and payments." />
      <div className="flex gap-2">
        {children.map((ch, i) => (
          <Button key={ch.name} variant={i === idx ? "default" : "outline"} onClick={() => setIdx(i)}>{ch.name.split(" ")[0]} · Grade {ch.grade}</Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Attendance" value={`${c.attendance}%`} />
        <Stat label="Average score" value={`${c.avgScore}`} hint={`+${c.trend.at(-1)! - c.trend[0]!} since start`} />
        <Stat label="Grade band" value={c.band} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Score trend (6 weeks)"><Trend values={c.trend} /></Panel>
        <Panel title="Upcoming sessions">
          <ul className="divide-y">
            {mine.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <span>{s.when} · {s.subject}<br /><span className="text-muted-foreground">{s.tutor}</span></span>
                {s.status === "Awaiting payment" ? <Button size="sm" onClick={() => toast.success("Demo: Telebirr payment request sent")}>Pay now</Button> : <StatusBadge status={s.status} />}
              </li>
            ))}
            {mine.length === 0 && <li className="py-3 text-sm text-muted-foreground">Nothing booked.</li>}
          </ul>
        </Panel>
      </div>
      <Panel title="Tutor notes">
        <ul className="space-y-3">
          {sessionNotes.map((n) => (
            <li key={n.date} className="rounded-xl bg-muted/50 p-3 text-sm">
              <p className="font-medium">{n.date} · {n.subject} · {n.attended ? `Attended · ${n.score}/100` : "Missed"}</p>
              <p className="text-muted-foreground">{n.note}</p>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Payment history">
        <ul className="divide-y text-sm">
          {payments.filter((p) => p.parent === "Almaz Kebede").map((p) => (
            <li key={p.id} className="flex justify-between py-3"><span>{p.date} · {p.tutor} · {p.method}</span><span>{p.amount.toLocaleString()} ETB <StatusBadge status={p.status} /></span></li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
