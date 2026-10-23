// Storage layer: Neon (DATABASE_URL, used on Cloudflare/Render) or the Lovable Cloud database (preview).
// Always parameterized SQL. Without either, the app runs in static demo mode.

export type DbKind = "neon" | "cloud" | "none";

export function dbKind(): DbKind {
  if (process.env["DATABASE_URL"]) return "neon";
  if (process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]) return "cloud";
  return "none";
}

async function sql(query: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  const { neon } = await import("@neondatabase/serverless");
  const run = neon(process.env["DATABASE_URL"] as string);
  return (await run.query(query, params)) as Record<string, unknown>[];
}

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

export type ApplicationInput = {
  full_name: string;
  phone: string;
  telegram: string;
  subjects: string[];
  years_experience: number;
  bio: string;
  references_text: string;
};

export async function insertApplication(a: ApplicationInput) {
  if (dbKind() === "neon") {
    await sql(
      "insert into tutor_applications (full_name, phone, telegram, subjects, years_experience, bio, references_text) values ($1,$2,$3,$4,$5,$6,$7)",
      [a.full_name, a.phone, a.telegram, a.subjects, a.years_experience, a.bio, a.references_text],
    );
    return;
  }
  const { error } = await (await admin()).from("tutor_applications").insert(a);
  if (error) throw new Error(error.message);
}

/** Records an incoming Telegram update. Returns false when it was already processed. */
export async function recordUpdate(u: {
  update_id: number;
  chat_id: number;
  text: string | null;
  raw: unknown;
  first_name: string | null;
  username: string | null;
}): Promise<boolean> {
  if (dbKind() === "neon") {
    const rows = await sql(
      "insert into telegram_messages (update_id, chat_id, text, raw_update) values ($1,$2,$3,$4) on conflict (update_id) do nothing returning update_id",
      [u.update_id, u.chat_id, u.text, JSON.stringify(u.raw)],
    );
    if (rows.length === 0) return false;
    await sql(
      "insert into telegram_chats (chat_id, first_name, username, last_seen_at) values ($1,$2,$3,now()) on conflict (chat_id) do update set first_name = excluded.first_name, username = excluded.username, last_seen_at = now()",
      [u.chat_id, u.first_name, u.username],
    );
    return true;
  }
  const db = await admin();
  const { error } = await db.from("telegram_messages").insert({
    update_id: u.update_id,
    chat_id: u.chat_id,
    text: u.text,
    raw_update: u.raw as never,
  });
  if (error) {
    if (error.code === "23505") return false;
    throw new Error(error.message);
  }
  await db.from("telegram_chats").upsert({
    chat_id: u.chat_id,
    first_name: u.first_name,
    username: u.username,
    last_seen_at: new Date().toISOString(),
  });
  return true;
}

export async function setPendingAction(chatId: number, action: string | null) {
  if (dbKind() === "neon") {
    await sql("update telegram_chats set pending_action = $2 where chat_id = $1", [chatId, action]);
    return;
  }
  await (await admin()).from("telegram_chats").update({ pending_action: action }).eq("chat_id", chatId);
}

export async function getPendingAction(chatId: number): Promise<string | null> {
  if (dbKind() === "neon") {
    const rows = await sql("select pending_action from telegram_chats where chat_id = $1", [chatId]);
    return (rows[0]?.["pending_action"] as string | null) ?? null;
  }
  const { data } = await (await admin()).from("telegram_chats").select("pending_action").eq("chat_id", chatId).maybeSingle();
  return data?.pending_action ?? null;
}

export async function insertBotRequest(chatId: number, kind: string, body: string) {
  if (dbKind() === "neon") {
    await sql("insert into bot_requests (chat_id, kind, body) values ($1,$2,$3)", [chatId, kind, body]);
    return;
  }
  await (await admin()).from("bot_requests").insert({ chat_id: chatId, kind, body });
}

/** Health probe: true when the database answers. Never returns details. */
export async function pingDb(): Promise<boolean> {
  try {
    if (dbKind() === "neon") {
      await sql("select 1");
      return true;
    }
    if (dbKind() === "cloud") {
      const { error } = await (await admin()).from("bot_requests").select("id").limit(1);
      return !error;
    }
    return false;
  } catch {
    return false;
  }
}
