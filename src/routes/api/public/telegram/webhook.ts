import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { sendScreen, tg, webhookSecret } from "@/lib/telegram.server";

function safeEqual(a: string, b: string) {
  const l = Buffer.from(a);
  const r = Buffer.from(b);
  return l.length === r.length && timingSafeEqual(l, r);
}

type TgUser = { id: number; first_name?: string; username?: string };
type Update = {
  update_id: number;
  message?: { chat: { id: number }; from?: TgUser; text?: string };
  callback_query?: { id: string; data?: string; from: TgUser; message?: { chat: { id: number } } };
};

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(actual, webhookSecret())) return new Response("Unauthorized", { status: 401 });

        const update = (await request.json()) as Update;
        if (typeof update.update_id !== "number") return Response.json({ ok: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
        const from = update.message?.from ?? update.callback_query?.from;
        if (!chatId) return Response.json({ ok: true });

        // Idempotency: Telegram retries; skip already-processed updates.
        const { error: insErr } = await supabaseAdmin.from("telegram_messages").insert({
          update_id: update.update_id,
          chat_id: chatId,
          text: update.message?.text ?? update.callback_query?.data ?? null,
          raw_update: update as never,
        });
        if (insErr) {
          if (insErr.code === "23505") return Response.json({ ok: true, duplicate: true });
          console.error(insErr);
          return Response.json({ error: insErr.message }, { status: 500 });
        }

        await supabaseAdmin.from("telegram_chats").upsert({
          chat_id: chatId,
          first_name: from?.first_name ?? null,
          username: from?.username ?? null,
          last_seen_at: new Date().toISOString(),
        });

        try {
          if (update.callback_query) {
            await tg("answerCallbackQuery", { callback_query_id: update.callback_query.id });
            await sendScreen(chatId, update.callback_query.data ?? "menu");
          } else if (update.message?.text?.startsWith("/start")) {
            await sendScreen(chatId, "menu", `Hi ${from?.first_name ?? "there"} 👋 Welcome to Bright Path Tutors (demo, sample data).\n\n`);
          } else if (update.message?.text) {
            await tg("sendMessage", { chat_id: chatId, text: "Got it ✅ An admin will reply here soon." });
            await sendScreen(chatId, "menu");
          }
        } catch (e) {
          console.error(e);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
