import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Square, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashHeader, Panel, Stat, StatusBadge } from "@/components/dash";
import { COMMISSION, upcomingSessions } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/teacher")({
  head: () => ({ meta: [
    { title: "Tutor Demo | Bright Path Tutors" },
    { name: "description", content: "Review sample teaching sessions, attendance, and earnings." },
    { property: "og:title", content: "Tutor Demo | Bright Path Tutors" },
    { property: "og:description", content: "Review sample teaching sessions, attendance, and earnings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Teacher,
});

function SessionTimer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-3xl tabular-nums">{mm}:{ss}</span>
      <Button size="sm" variant="outline" onClick={() => setRunning(!running)}>{running ? <><Square /> Pause</> : <><Play /> Start class</>}</Button>
    </div>
  );
}

function Teacher() {
  const mine = upcomingSessions.filter((s) => s.tutor === "Dawit Mekonnen");
  const next = mine[0]!;
  const gross = 14400;
  return (
    <div className="space-y-6">
      <DashHeader title="Selam, Dawit 👋" text="Your sessions, attendance and earnings." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Sessions this month" value="32" />
        <Stat label="Earnings (after commission)" value={`${(gross * (1 - COMMISSION)).toLocaleString()} ETB`} hint="Paid out every Friday" />
        <Stat label="Rating" value="4.9★" />
      </div>
      <Panel title="Next session" action={<StatusBadge status={next.status} />}>
        <p className="font-medium">{next.subject} with {next.student}</p>
        <p className="text-sm text-muted-foreground">{next.when} · {next.duration} min</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <SessionTimer minutes={next.duration} />
          <Button asChild><a href={`https://${next.link}`} target="_blank" rel="noreferrer"><Video /> Open Google Meet</a></Button>
        </div>
      </Panel>
      <Panel title="After class: log attendance & note">
        <form className="grid gap-3 md:grid-cols-[auto_120px_1fr_auto]" onSubmit={(e) => { e.preventDefault(); toast.success("Saved — parent notified on Telegram"); }}>
          <select className="h-9 rounded-md border bg-background px-3 text-sm"><option>Present</option><option>Absent</option><option>Late</option></select>
          <Input type="number" placeholder="Score /100" />
          <Input placeholder="Short note for the parent" />
          <Button type="submit">Save</Button>
        </form>
      </Panel>
      <Panel title="Upcoming">
        <ul className="divide-y">
          {mine.map((s) => <li key={s.id} className="flex justify-between py-3 text-sm"><span>{s.when} · {s.subject} · {s.student}</span><StatusBadge status={s.status} /></li>)}
        </ul>
      </Panel>
    </div>
  );
}
