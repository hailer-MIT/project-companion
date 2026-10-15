import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Bright Path Tutors" },
      { name: "description", content: "Why we're building a trusted tutoring platform for Ethiopian families." },
      { property: "og:title", content: "About — Bright Path Tutors" },
      { property: "og:description", content: "Why we're building a trusted tutoring platform for Ethiopian families." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicPage>
      <PageIntro eyebrow="About us" title="Private tutoring, made accountable" text="Families in Addis already spend on tutors — but through word of mouth, cash, and guesswork. We're changing that." />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        {[
          ["Our mission", "Give every student in grades 4–12 access to a tutor their parents can trust."],
          ["Our promise", "Vetted teachers, transparent payments, and progress you can see after every session."],
          ["Our approach", "Mobile-first and light on data, with updates through the Telegram you already use."],
        ].map(([t, d]) => (
          <div key={t}><h2 className="text-2xl font-semibold">{t}</h2><p className="mt-3 text-muted-foreground">{d}</p></div>
        ))}
      </section>
    </PublicPage>
  );
}
