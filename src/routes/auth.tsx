import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicPage } from "@/components/site-chrome";
import { getAccountState } from "@/lib/account.functions";
import { accountClient } from "@/lib/account-client";
import { accountHead } from "@/lib/account-meta";
import { safeAccountRedirect } from "@/lib/account-policy";
export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: "/account" | "/admin" } => ({ redirect: safeAccountRedirect(s["redirect"]) }),
  loader: () => getAccountState(), head: () => accountHead("Sign in", "Sign in to your Bright Path Tutors account."), component: Auth,
});
function Auth() {
  const state = Route.useLoaderData(); const search = Route.useSearch(); const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  return <PublicPage><section className="mx-auto max-w-md px-4 py-14">
    <LockKeyhole className="h-8 w-8 text-primary" /><h1 className="mt-5 text-3xl font-semibold">{title}</h1>
    {state.account?.user.emailVerified ? <div className="mt-6 space-y-4"><p>You are signed in as {state.account.user.name}.</p><Button asChild><Link to="/account">My account</Link></Button></div> : <>
    {!state.configured && <p role="status" className="mt-5 border-l-2 border-primary bg-muted p-4 text-sm">Account registration is not open yet. Email and security setup is still in progress.</p>}
    {notice ? <div role="status" className="mt-6 space-y-4"><Mail className="h-6 w-6 text-primary" /><p>{notice}</p><Button variant="outline" onClick={() => { setNotice(""); setMode("login"); }}>Back to sign in</Button></div> :
    <form className="mt-8 space-y-5" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setError(""); const form = new FormData(e.currentTarget);
      const email = String(form.get("email")); const password = String(form.get("password") ?? "");
      try {
        if (mode === "forgot") {
          const result = await accountClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` });
          if (result.error) throw new Error(result.error.message);
          setNotice("If this email has an account, a password-reset link will arrive shortly.");
        } else if (mode === "signup") {
          const result = await accountClient.signUp.email({ email, password, name: String(form.get("name")), callbackURL: `${window.location.origin}/auth` });
          if (result.error) throw new Error(result.error.message);
          setNotice("Check your email and confirm your account before signing in.");
        } else {
          const result = await accountClient.signIn.email({ email, password });
          if (result.error) throw new Error(result.error.message);
          await router.invalidate(); await router.navigate({ to: search.redirect ?? "/account" });
        }
      } catch (err) { setError(err instanceof Error ? err.message : "Unable to continue. Try again."); } finally { setBusy(false); }
    }}>
      {mode === "signup" && <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" /></div>}
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" /></div>
      {mode !== "forgot" && <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={mode === "signup" ? 12 : 1} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} />{mode === "signup" && <p className="text-xs text-muted-foreground">At least 12 characters.</p>}</div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" disabled={busy || !state.configured} type="submit">{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}</Button>
      <div className="flex flex-wrap justify-between gap-2"><Button type="button" variant="link" className="px-0" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}>{mode === "signup" ? "Already have an account?" : "Create account"}</Button><Button type="button" variant="link" className="px-0" onClick={() => { setMode(mode === "forgot" ? "login" : "forgot"); setError(""); }}>{mode === "forgot" ? "Back to sign in" : "Forgot password?"}</Button></div>
    </form>}</>}
  </section></PublicPage>;
}