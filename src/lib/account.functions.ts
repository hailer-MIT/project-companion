import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAccountState = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest, setResponseHeader } = await import("@tanstack/react-start/server");
  const { accountsConfigured, readAccount } = await import("./accounts.server");
  setResponseHeader("Cache-Control", "private, no-store");
  return { configured: accountsConfigured(), account: await readAccount(getRequest().headers) };
});
export const getPersonalAccount = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest, setResponseHeader } = await import("@tanstack/react-start/server");
  const { requireAccount } = await import("./accounts.server");
  const { accountSql } = await import("./account-db.server");
  setResponseHeader("Cache-Control", "private, no-store");
  const account = await requireAccount(getRequest().headers);
  const profile = await accountSql("select display_name, photo_reference, preferences from public.bpt_profiles where user_id=$1 limit 1", [account.user.id]);
  const family = await accountSql("select r.id, u.name as student_name from public.bpt_family_relationships r join public.bpt_user u on u.id=r.student_id where r.parent_id=$1 and r.status='accepted' order by r.created_at desc limit 50", [account.user.id]);
  const invites = await accountSql("select i.id,u.name as parent_name from public.bpt_family_invitations i join public.bpt_user u on u.id=i.parent_id where i.student_email=lower($1) and i.status='pending' and i.expires_at>now() order by i.created_at desc limit 50", [account.user.email]);
  return { account, profile: profile.rows[0] ?? null, family: family.rows, invites: invites.rows };
});
export const savePersonalProfile = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ displayName: z.string().trim().min(2).max(120), language: z.enum(["en", "am"]) }).parse(d))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { requireAccount } = await import("./accounts.server");
    const { accountSql } = await import("./account-db.server");
    const { user } = await requireAccount(getRequest().headers);
    await accountSql("update public.bpt_profiles set display_name=$2,preferences=jsonb_build_object('language',$3::text),updated_at=now() where user_id=$1 returning user_id", [user.id, data.displayName, data.language]);
    return { ok: true };
  });
export const inviteStudent = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().trim().email().max(254) }).parse(d))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { requireAccount } = await import("./accounts.server");
    const { accountSql } = await import("./account-db.server");
    const account = await requireAccount(getRequest().headers);
    if (!account.roles.includes("parent")) throw new Error("Parent access required.");
    if (account.user.email.toLowerCase() === data.email.toLowerCase()) throw new Error("Choose another account.");
    await accountSql("insert into public.bpt_family_invitations(parent_id,student_email) select $1,lower($2) where (select count(*) from public.bpt_family_invitations where parent_id=$1 and created_at>now()-interval '1 day')<10 on conflict(parent_id,student_email) do update set status='pending',expires_at=now()+interval '7 days' returning id", [account.user.id, data.email]);
    return { ok: true };
  });
export const respondToFamilyInvite = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), accept: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { requireAccount } = await import("./accounts.server");
    const { accountSql } = await import("./account-db.server");
    const account = await requireAccount(getRequest().headers);
    // One SQL statement atomically consumes the invite and creates the relationship.
    const result = await accountSql("with accepted as (update public.bpt_family_invitations set status=$4 where id=$1 and student_email=lower($2) and status='pending' and expires_at>now() and parent_id<>$3 returning parent_id) insert into public.bpt_family_relationships(parent_id,student_id,status) select parent_id,$3,'accepted' from accepted where $4='accepted' on conflict(parent_id,student_id) do nothing returning id", [data.id, account.user.email, account.user.id, data.accept ? "accepted" : "declined"]);
    return { ok: true, linked: result.rows.length > 0 };
  });