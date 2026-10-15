import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Demo-only: no auth yet. Only targets chats that already messaged the bot.
export const listTelegramChats = createServerFn({ method: "GET" }).handler(async () => {
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: chat } = await supabaseAdmin.from("telegram_chats").select("chat_id").eq("chat_id", data.chatId).maybeSingle();
    if (!chat) throw new Error("Chat not linked");
    const { tg, keyboard } = await import("./telegram.server");
    await tg("sendMessage", { chat_id: data.chatId, text: kinds[data.kind], reply_markup: keyboard([["📅 My sessions", "sessions"], ["⬅️ Menu", "menu"]]) });
    return { ok: true };
  });
