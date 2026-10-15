import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Send, Shield, Users } from "lucide-react";
import { Logo } from "@/components/site-chrome";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo dashboards — Bright Path Tutors" },
      { name: "description", content: "Clickable demo of the admin, teacher, parent and student dashboards." },
      { property: "og:title", content: "Demo dashboards — Bright Path Tutors" },
      { property: "og:description", content: "Clickable demo of the role dashboards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoLayout,
});

const roles = [
  { to: "/demo/admin", label: "Admin", icon: Shield },
  { to: "/demo/teacher", label: "Teacher", icon: BookOpen },
  { to: "/demo/parent", label: "Parent", icon: Users },
  { to: "/demo/student", label: "Student", icon: GraduationCap },
  { to: "/demo/telegram", label: "Telegram bot", icon: Send },
] as const;

function DemoLayout() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:w-60">
        <div className="flex items-center justify-between p-4 md:block">
          <div className="rounded-lg bg-background px-2 py-1"><Logo /></div>
          <p className="mt-0 text-xs uppercase tracking-wider opacity-60 md:mt-6">Demo · view as</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:pb-0">
          {roles.map((r) => (
            <Link key={r.to} to={r.to} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}>
              <r.icon className="h-4 w-4" /> {r.label}
            </Link>
          ))}
        </nav>
        <p className="hidden px-4 pt-8 text-xs opacity-60 md:block">Sample data only. No real accounts or payments.</p>
      </aside>
      <main className="flex-1 p-4 md:ml-60 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
