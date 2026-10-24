import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicPage } from "@/components/site-chrome";
import { accountClient } from "@/lib/account-client";
import { accountHead } from "@/lib/account-meta";
export const Route = createFileRoute("/reset-password")({ validateSearch: (s: Record<string, unknown>) => ({ token: typeof s["token"] === "string" ? s["token"] : "" }), head: () => accountHead("New password", "Set a new password for your Bright Path Tutors account."), component: ResetPassword });
function ResetPassword() {
  const { token } = Route.useSearch(); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <PublicPage><section className="mx-auto max-w-md px-4 py-16"><h1 className="text-3xl font-semibold">New password</h1>
    {done ? <div className="mt-6 space-y-4"><p role="status">Your password has been updated.</p><Button asChild><Link to="/auth">Sign in</Link></Button></div> : !token ? <div className="mt-6 space-y-4"><p>This reset link is missing or invalid.</p><Button asChild variant="outline"><Link to="/auth">Request another link</Link></Button></div> :
    <form className="mt-8 space-y-5" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const password = String(f.get("password")); if (password !== f.get("confirm")) { setError("Passwords do not match."); return; } setBusy(true); setError(""); try { const r = await accountClient.resetPassword({ token, newPassword: password }); if (r.error) throw new Error(r.error.message); setDone(true); } catch (err) { setError(err instanceof Error ? err.message : "Password reset failed."); } finally { setBusy(false); } }}>
      <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" /></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" name="confirm" required minLength={12} maxLength={128} autoComplete="new-password" /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</Button>
    </form>}</section></PublicPage>;
}