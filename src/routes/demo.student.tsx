import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashHeader, Panel, Stat, Trend } from "@/components/dash";
import { children, upcomingSessions } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/student")({
  head: () => ({ meta: [
    { title: "Student Demo | Bright Path Tutors" },
    { name: "description", content: "Explore sample classes and learning progress." },
    { property: "og:title", content: "Student Demo | Bright Path Tutors" },
    { property: "og:description", content: "Explore sample classes and learning progress." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Student,
});

function Student() {
  const me = children[0]!;
  const mine = upcomingSessions.filter((s) => s.student === me.name);
  const next = mine[0]!;
  return (
    <div className="space-y-6">
      <DashHeader title="Hi, Ruth" text="Your classes and progress." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Next class" value={next.when.split(",")[1]?.trim() ?? next.when} />
        <Stat label="Average score" value={`${me.avgScore}`} hint="Best yet!" />
        <Stat label="Attendance" value={`${me.attendance}%`} />
      </div>
      <Panel title="My classes">
        <ul className="divide-y">
          {mine.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <span>{s.when} · {s.subject} with {s.tutor}</span>
              <Button size="sm" variant="outline" asChild><a href={`https://${s.link}`} target="_blank" rel="noreferrer"><Video /> Join</a></Button>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="My progress"><Trend values={me.trend} /></Panel>
        <Panel title="Leave a testimonial">
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Thanks! Sent to admin for review."); (e.target as HTMLFormElement).reset(); }} className="space-y-3">
            <Textarea placeholder="How has tutoring helped you?" rows={4} required />
            <Button type="submit">Submit</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
