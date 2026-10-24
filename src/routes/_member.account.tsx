import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicPage } from "@/components/site-chrome";
import { SignOutButton } from "@/components/account-access";
import { getPersonalAccount, inviteStudent, respondToFamilyInvite, savePersonalProfile } from "@/lib/account.functions";
import { accountHead } from "@/lib/account-meta";
export const Route = createFileRoute("/_member/account")({ loader: () => getPersonalAccount(), head: () => accountHead("My account", "Your personal profile and family at Bright Path Tutors."), component: Account });
function Account() {
  const data = Route.useLoaderData(); const router = useRouter(); const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>, message: string) { setBusy(true); try { await action(); await router.invalidate(); toast.success(message); } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to save."); } finally { setBusy(false); } }
  return <PublicPage><section className="mx-auto max-w-4xl px-4 py-12"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-primary">My account</p><h1 className="mt-2 text-3xl font-semibold">{data.profile?.displayName ?? data.account.user.name}</h1><p className="mt-2 break-all text-muted-foreground">{data.account.user.email}</p></div><SignOutButton /></div>
    {data.account.roles.includes("admin") && <Button asChild className="mt-6"><Link to="/admin">Administrator page</Link></Button>}
    <div className="mt-10 grid gap-12 md:grid-cols-2"><section><h2 className="text-2xl font-semibold">Personal details</h2><form className="mt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(() => savePersonalProfile({ data: { displayName: String(f.get("displayName")), language: f.get("language") === "am" ? "am" : "en" } }), "Profile saved"); }}>
      <div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input id="displayName" name="displayName" defaultValue={data.profile?.displayName ?? data.account.user.name} required minLength={2} maxLength={120} /></div>
      <div className="space-y-2"><Label htmlFor="language">Language</Label><select id="language" name="language" defaultValue={data.profile?.language ?? "en"} className="h-10 w-full rounded-md border bg-background px-3"><option value="en">English</option><option value="am">አማርኛ</option></select></div><Button type="submit" disabled={busy}>Save details</Button>
    </form></section><section><h2 className="text-2xl font-semibold">Family</h2>{data.family.length ? <ul className="mt-5 divide-y">{data.family.map((f) => <li key={f.id} className="py-3">{f.studentName}</li>)}</ul> : <p className="mt-5 text-sm text-muted-foreground">No linked family members.</p>}
      {data.account.roles.includes("parent") && <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const email = String(new FormData(form).get("student-email")); void run(() => inviteStudent({ data: { email } }).then(() => form.reset()), "Invitation saved. Your family member can respond from their account."); }}><Label htmlFor="student-email">Student account email</Label><Input id="student-email" name="student-email" type="email" required /><Button disabled={busy} type="submit" variant="outline">Invite family member</Button></form>}
      {data.invites.map((i) => <div key={i.id} className="mt-6 border-t pt-4"><p>Family invitation from {i.parentName}</p><div className="mt-3 flex gap-2"><Button disabled={busy} onClick={() => void run(() => respondToFamilyInvite({ data: { id: i.id, accept: true } }), "Family invitation accepted")}>Accept</Button><Button variant="outline" disabled={busy} onClick={() => void run(() => respondToFamilyInvite({ data: { id: i.id, accept: false } }), "Invitation declined")}>Decline</Button></div></div>)}
    </section></div></section></PublicPage>;
}