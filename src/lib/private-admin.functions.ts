import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
export const getPrivateAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest, setResponseHeader } = await import("@tanstack/react-start/server");
  const { requireAccount } = await import("./accounts.server");
  const { accountSql } = await import("./account-db.server");
  await requireAccount(getRequest().headers, true);
  setResponseHeader("Cache-Control", "private, no-store");
  const [apps, requests] = await Promise.all([
    accountSql("select id,full_name,subjects,years_experience,status,created_at from public.tutor_applications order by created_at desc,id desc limit 50"),
    accountSql("select r.id,r.kind,r.body,r.status,r.created_at,c.first_name from public.bot_requests r left join public.telegram_chats c on c.chat_id=r.chat_id order by r.created_at desc,r.id desc limit 50"),
  ]);
  return { applications: apps.rows.map((r) => ({ id: String(r["id"]), name: String(r["full_name"]), subjects: Array.isArray(r["subjects"]) ? r["subjects"].map(String) : [], experience: Number(r["years_experience"] ?? 0), status: String(r["status"]), date: String(r["created_at"]) })), requests: requests.rows.map((r) => ({ id: String(r["id"]), kind: String(r["kind"]), body: String(r["body"] ?? ""), status: String(r["status"]), name: String(r["first_name"] ?? "Unknown"), date: String(r["created_at"]) })) };
});
export const changePrivateApplication = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(d))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server"); const { requireAccount } = await import("./accounts.server"); const { accountSql } = await import("./account-db.server");
    await requireAccount(getRequest().headers, true);
    await accountSql("update public.tutor_applications set status=$2 where id=$1 returning id", [data.id, data.status]); return { ok: true };
  });
export const resolvePrivateRequest = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server"); const { requireAccount } = await import("./accounts.server"); const { accountSql } = await import("./account-db.server");
    await requireAccount(getRequest().headers, true);
    await accountSql("update public.bot_requests set status='resolved' where id=$1 returning id", [data.id]); return { ok: true };
  });