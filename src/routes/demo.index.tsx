import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Send, Shield, Users } from "lucide-react";

export const Route = createFileRoute("/demo/")({
  head: () => ({ meta: [
    { title: "Role Demonstrations | Bright Path Tutors" },
    { name: "description", content: "Explore sample parent, student, tutor, administrator, and Telegram dashboards." },
    { property: "og:title", content: "Role Demonstrations | Bright Path Tutors" },
    { property: "og:description", content: "Explore sample parent, student, tutor, administrator, and Telegram dashboards." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DemoHome,
});

const cards = [
  { to: "/demo/admin", t: "Admin", d: "Recruitment queue, payments, disputes, platform stats.", icon: Shield },
  { to: "/demo/teacher", t: "Teacher", d: "Today's sessions, attendance, notes and earnings.", icon: BookOpen },
  { to: "/demo/parent", t: "Parent", d: "Children's progress, bookings and payments.", icon: Users },
  { to: "/demo/student", t: "Student", d: "Upcoming classes, join links, scores.", icon: GraduationCap },
  { to: "/demo/telegram", t: "Telegram bot", d: "Reminders, receipts and quick actions in chat.", icon: Send },
] as const;

function DemoHome() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold">Pick a role to explore</h1>
      <p className="mt-2 text-muted-foreground">One platform, one login, a different dashboard for each role. The website handles the dashboards; Telegram handles notifications and quick actions.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl border bg-card p-6 transition hover:border-primary">
            <c.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-xl font-semibold">{c.t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
