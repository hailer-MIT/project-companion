import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, CalendarCheck, LineChart, Send, ShieldCheck, Star, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPage } from "@/components/site-chrome";
import { testimonials, tutors } from "@/lib/demo-data";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bright Path Tutors — Vetted tutors for grades 4–12" },
      { name: "description", content: "Book vetted tutors, pay safely, and follow your child's progress. Grades 4–12 in Addis Ababa." },
      { property: "og:title", content: "Bright Path Tutors — Vetted tutors for grades 4–12" },
      { property: "og:description", content: "Book vetted tutors, pay safely, and follow your child's progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const pillars = [
  { icon: ShieldCheck, title: "Vetted tutors", text: "Degree, experience, references and background check — before anyone teaches your child." },
  { icon: Wallet, title: "Safe payments", text: "Pay with Telebirr or CBE Birr. Tutors are paid after the session happens." },
  { icon: LineChart, title: "Visible progress", text: "Attendance, scores and tutor notes after every session." },
  { icon: Send, title: "Telegram updates", text: "Reminders, receipts and weekly reports straight to Telegram." },
];

function Home() {
  return (
    <PublicPage>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 md:grid-cols-2 md:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Every tutor background-checked
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">
            Tutoring you can <em className="text-primary">trust</em> — and actually see.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Vetted tutors for grades 4–12, online or at home. Pay safely, get session reminders on Telegram, and follow your child's progress week by week.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/tutors">Find a tutor</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/how-it-works">How it works</Link></Button>
          </div>
          <div className="mt-8 flex gap-8 text-sm">
            <div><p className="font-display text-2xl font-semibold">120+</p><p className="text-muted-foreground">Vetted tutors</p></div>
            <div><p className="font-display text-2xl font-semibold">4.8★</p><p className="text-muted-foreground">Avg. rating</p></div>
            <div><p className="font-display text-2xl font-semibold">6</p><p className="text-muted-foreground">Subjects</p></div>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="A tutor helping a student with her notebook" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl" />
          <div className="absolute -bottom-5 left-4 rounded-2xl border bg-card p-4 shadow-lg">
            <p className="text-xs text-muted-foreground">Weekly report · Ruth, Grade 11</p>
            <p className="mt-1 font-medium">Attendance 92% · Avg score 81 <span className="text-success">↑ 23</span></p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold">Why parents choose us</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-6">
                <p.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold">Featured tutors</h2>
          <Link to="/tutors" className="text-sm font-medium text-primary">See all →</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {tutors.slice(0, 3).map((t) => (
            <div key={t.id} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{t.name.split(" ").map((x) => x[0]).join("")}</div>
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.disciplines.join(", ")} · Grades {t.gradeBand}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{t.bio}</p>
              <p className="mt-4 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-accent text-accent" /> {t.rating} · {t.sessions} sessions · <span className="font-medium">{t.priceEtb} ETB/hr</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-3xl font-semibold">What families say</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-primary p-6 text-primary-foreground">
              <blockquote className="font-display text-lg leading-snug">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm opacity-80">{t.name} · {t.role}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-accent p-10 text-accent-foreground md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Are you a great teacher?</h2>
            <p className="mt-2 opacity-80">Get students, guaranteed payment, and less admin.</p>
          </div>
          <Button size="lg" asChild><Link to="/apply"><CalendarCheck /> Apply to teach</Link></Button>
        </div>
      </section>
    </PublicPage>
  );
}
