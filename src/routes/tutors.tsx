import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageIntro, PublicPage } from "@/components/site-chrome";
import { disciplines, tutors } from "@/lib/demo-data";

export const Route = createFileRoute("/tutors")({
  head: () => ({
    meta: [
      { title: "Find a tutor — Bright Path Tutors" },
      { name: "description", content: "Browse vetted tutors by subject and grade band." },
      { property: "og:title", content: "Find a tutor — Bright Path Tutors" },
      { property: "og:description", content: "Browse vetted tutors by subject and grade band." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tutors,
});

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>{children}</button>
  );
}

function Tutors() {
  const [subject, setSubject] = useState<string>("All");
  const [band, setBand] = useState<string>("All");
  const list = tutors.filter((t) => (subject === "All" || t.disciplines.includes(subject)) && (band === "All" || t.gradeBand === band));
  return (
    <PublicPage>
      <PageIntro eyebrow="Tutors" title="Find the right tutor" text="Every tutor here passed our checklist: degree, experience, references and a background check." />
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap gap-2">
          {["All", ...disciplines].map((d) => <Chip key={d} active={subject === d} onClick={() => setSubject(d)}>{d}</Chip>)}
        </div>
        <div className="mt-3 flex gap-2">
          {["All", "4–8", "9–12"].map((b) => <Chip key={b} active={band === b} onClick={() => setBand(b)}>{b === "All" ? "All grades" : `Grades ${b}`}</Chip>)}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{t.name.split(" ").map((x) => x[0]).join("")}</div>
                <div>
                  <p className="flex items-center gap-1 font-medium">{t.name} {t.verified && <BadgeCheck className="h-4 w-4 text-primary" />}</p>
                  <p className="text-xs text-muted-foreground">Grades {t.gradeBand}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">{t.disciplines.map((d) => <span key={d} className="rounded-md bg-secondary px-2 py-0.5 text-xs">{d}</span>)}</div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.bio}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-accent text-accent" />{t.rating} · {t.priceEtb} ETB/hr</p>
                <Button size="sm" onClick={() => toast.success(`Demo: booking request sent to ${t.name}`, { description: "In v1 the parent picks a slot and pays with Telebirr." })}>Book</Button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-muted-foreground">No tutors match these filters yet.</p>}
        </div>
      </section>
    </PublicPage>
  );
}
