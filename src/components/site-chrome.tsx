import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/demo-data";
import { getAccountState } from "@/lib/account.functions";
import { accountClient } from "@/lib/account-client";

const nav = [
  { to: "/tutors", label: "Find a tutor" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="h-4 w-4" />
      </span>
      {BRAND}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const session = accountClient.useSession();
  const state = useQuery({ queryKey: ["account-state"], queryFn: () => getAccountState(), retry: false, staleTime: 30_000 });
  useEffect(() => { void state.refetch(); void router.invalidate(); }, [session.data?.user.id]);
  const signedIn = Boolean(state.data?.account?.user.emailVerified);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild><Link to={signedIn ? "/account" : "/auth"}>{signedIn ? "My account" : "Sign in"}</Link></Button>
          <Button variant="ghost" asChild><Link to="/apply">Teach with us</Link></Button>
          <Button asChild><Link to="/demo">Open demo</Link></Button>
        </div>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}><Menu /></button>
      </div>
      {open && (
        <div className="border-t px-4 py-3 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-sm">{n.label}</Link>
          ))}
          <Link to="/apply" onClick={() => setOpen(false)} className="block py-2 text-sm">Teach with us</Link>
          <Button variant="outline" asChild className="mt-2 w-full"><Link to={signedIn ? "/account" : "/auth"} onClick={() => setOpen(false)}>{signedIn ? "My account" : "Sign in"}</Link></Button>
          <Button asChild className="mt-2 w-full"><Link to="/demo">Open demo</Link></Button>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">Vetted tutors, safe payments, and progress parents can actually see. Grades 4–12, Addis Ababa.</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">Platform</p>
          <Link to="/tutors" className="block py-1 text-muted-foreground">Find a tutor</Link>
          <Link to="/pricing" className="block py-1 text-muted-foreground">Pricing</Link>
          <Link to="/apply" className="block py-1 text-muted-foreground">Become a tutor</Link>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">Company</p>
          <Link to="/about" className="block py-1 text-muted-foreground">About</Link>
          <Link to="/contact" className="block py-1 text-muted-foreground">Contact</Link>
          <Link to="/demo" className="block py-1 text-muted-foreground">Demo dashboards</Link>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© 2026 {BRAND} · Demo build</p>
    </footer>
  );
}

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-10">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{text}</p>
    </section>
  );
}
