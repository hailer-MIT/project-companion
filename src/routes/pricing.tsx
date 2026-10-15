import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Bright Path Tutors" },
      { name: "description", content: "Simple per-session and monthly package pricing in ETB." },
      { property: "og:title", content: "Pricing — Bright Path Tutors" },
      { property: "og:description", content: "Simple per-session and monthly package pricing in ETB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

const plans = [
  { name: "Single session", price: "300–450", unit: "ETB / hour", features: ["Any vetted tutor", "Telegram reminders", "Session note & score"], cta: "Book a session" },
  { name: "Monthly package", price: "from 2,800", unit: "ETB / 8 sessions", features: ["Fixed weekly slot", "Weekly progress report", "Free rescheduling (24h)", "Priority support"], cta: "Start a package", featured: true },
  { name: "Exam prep", price: "from 5,000", unit: "ETB / month", features: ["Grade 12 national exam focus", "Mock tests", "3 sessions per week"], cta: "Talk to us" },
];

function Pricing() {
  return (
    <PublicPage>
      <PageIntro eyebrow="Pricing" title="Clear prices, no cash surprises" text="Sample prices for the demo — final pricing to be agreed with the team." />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`flex flex-col rounded-2xl border p-8 ${p.featured ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="mt-4 font-display text-4xl font-semibold">{p.price}</p>
            <p className="text-sm opacity-75">{p.unit}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0" />{f}</li>)}
            </ul>
            <Button className="mt-8" variant={p.featured ? "secondary" : "default"} asChild><Link to="/tutors">{p.cta}</Link></Button>
          </div>
        ))}
      </section>
    </PublicPage>
  );
}
