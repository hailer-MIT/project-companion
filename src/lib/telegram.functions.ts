import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Demo-only: no auth yet. Only targets chats that already messaged the bot.
export const listTelegramChats = createServerFn({ method: "GET" }).handler(async () => {
  const { hasDb } = await import("./telegram.server");
  if (!hasDb()) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("telegram_chats")
    .select("chat_id, first_name, username, last_seen_at")
    .order("last_seen_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
});

const kinds = {
  reminder: "⏰ Reminder: Ruth has Maths with Dawit today at 16:00.\nJoin: meet.google.com/abc-defg-hij",
  receipt: "🧾 Payment confirmed: 1,800 ETB via Telebirr for Ruth's Maths sessions. Thank you!",
  missed: "⚠️ Ruth missed today's Physics session. Reply here to reschedule.",
} as const;

export const sendDemoNotification = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ chatId: z.number().int(), kind: z.enum(["reminder", "receipt", "missed"]) }).parse(d))
  .handler(async ({ data }) => {
    const { tg, keyboard, hasDb } = await import("./telegram.server");
    if (!hasDb()) throw new Error("Live notifications need a database");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: chat } = await supabaseAdmin.from("telegram_chats").select("chat_id").eq("chat_id", data.chatId).maybeSingle();
    if (!chat) throw new Error("Chat not linked");
    await tg("sendMessage", { chat_id: data.chatId, text: kinds[data.kind], reply_markup: keyboard([["📅 My sessions", "sessions"], ["⬅️ Menu", "menu"]]) });
    return { ok: true };
  });

// Demo-only (no admin login yet): parent requests that arrived via the Telegram bot.
export type BotRequest = {
  id: string;
  chat_id: number;
  kind: string;
  body: string | null;
  status: string;
  created_at: string;
  who: string;
};

export const listBotRequests = createServerFn({ method: "GET" }).handler(async () => {
  const { hasDb } = await import("./telegram.server");
  if (!hasDb()) return [] as BotRequest[];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [reqRes, chatRes] = await Promise.all([
    supabaseAdmin
      .from("bot_requests")
      .select("id, chat_id, kind, body, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin.from("telegram_chats").select("chat_id, first_name, username"),
  ]);
  if (reqRes.error) throw new Error(reqRes.error.message);
  const names = new Map(
    (chatRes.data ?? []).map((c) => [c.chat_id, `${c.first_name ?? "Unknown"}${c.username ? ` (@${c.username})` : ""}`]),
  );
  return reqRes.data.map((r) => ({ ...r, who: names.get(r.chat_id) ?? `Chat ${r.chat_id}` }));
});

export const resolveBotRequest = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bot_requests").update({ status: "resolved" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
