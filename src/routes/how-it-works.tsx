import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageIntro, PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Bright Path Tutors" },
      { name: "description", content: "Find, book, pay and track progress in four simple steps." },
      { property: "og:title", content: "How it works — Bright Path Tutors" },
      { property: "og:description", content: "Find, book, pay and track progress in four simple steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { n: "01", t: "Choose a tutor", d: "Filter by subject and grade band. Every tutor is vetted." },
  { n: "02", t: "Book & pay", d: "Pick a time slot and pay with Telebirr, CBE Birr or bank transfer. We hold the payment until the session happens." },
  { n: "03", t: "Learn", d: "Join online through a Google Meet link or meet at home. Reminders arrive on Telegram." },
  { n: "04", t: "See progress", d: "The tutor logs attendance, a score and a note after each session. You get a weekly summary." },
];

function HowItWorks() {
  return (
    <PublicPage>
      <PageIntro eyebrow="How it works" title="Four steps from search to results" text="Built for busy parents who want accountability, not just a phone number." />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border bg-card p-8">
            <p className="font-display text-4xl text-accent">{s.n}</p>
            <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
            <p className="mt-2 text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>
      <div className="mx-auto mt-10 max-w-6xl px-4"><Button size="lg" asChild><Link to="/tutors">Find a tutor</Link></Button></div>
    </PublicPage>
  );
}
