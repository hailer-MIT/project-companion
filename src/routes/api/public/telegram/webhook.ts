import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { hasDb, sendScreen, tg, webhookSecret } from "@/lib/telegram.server";

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

function cmdOf(text: string): string {
  // "/start@BotName extra" → "/start"
  return text.trim().split(/\s+/)[0]!.split("@")[0]!.toLowerCase();
}

// Handle a button press. Saves payment/reschedule requests, opens support Q&A.
async function onCallback(chatId: number, data: string) {
  if (!hasDb()) {
    await sendScreen(chatId, data);
    return;
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (data === "support") {
    // Next free-text message becomes a support question (admin dashboard).
    await supabaseAdmin.from("telegram_chats").update({ pending_action: "support" }).eq("chat_id", chatId);
    await sendScreen(chatId, "support");
    return;
  }
  if (data === "paid") {
    await supabaseAdmin.from("bot_requests").insert({
      chat_id: chatId,
      kind: "payment",
      body: "Says they paid 450 ETB via Telebirr — ref BPT-3021 (Thu Physics session). Confirm and send a receipt.",
    });
    await sendScreen(chatId, "paid");
    return;
  }
  if (data === "slot_fri" || data === "slot_sat") {
    const label = data === "slot_fri" ? "Fri 16:00" : "Sat 10:00";
    await supabaseAdmin.from("bot_requests").insert({
      chat_id: chatId,
      kind: "reschedule",
      body: `Asked to move the session to ${label}. Confirm with the tutor.`,
    });
    await sendScreen(chatId, data);
    return;
  }
  await sendScreen(chatId, data);
}

// Handle a text message: commands first, then support answers / free text.
async function onText(chatId: number, name: string, text: string) {
  const db = hasDb();
  const cmd = cmdOf(text);
  switch (cmd) {
    case "/start":
      await sendScreen(chatId, "menu", `Hi ${name} 👋 Welcome to Bright Path Tutors (demo, sample data).\n\n`);
      return;
    case "/menu":
      await sendScreen(chatId, "menu");
      return;
    case "/sessions":
      await sendScreen(chatId, "sessions", "", name);
      return;
    case "/report":
      await sendScreen(chatId, "report", "", name);
      return;
    case "/help":
      await sendScreen(chatId, "help");
      return;
    case "/support":
      await onCallback(chatId, "support");
      return;
    case "/admin": {
      // Demo-only admin link (the admin pages have no login yet).
      if (!db) {
        await sendScreen(chatId, "menu");
        return;
      }
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("telegram_chats").update({ is_admin: true, pending_action: null }).eq("chat_id", chatId);
      await tg("sendMessage", {
        chat_id: chatId,
        text: "✅ This chat is now linked as an admin. You'll get a message here whenever a tutor applies or a parent sends a request.",
        reply_markup: { inline_keyboard: [[{ text: "📅 My sessions", callback_data: "sessions" }]] },
      });
      return;
    }
  }

  // Free text
  if (db) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: chat } = await supabaseAdmin
      .from("telegram_chats")
      .select("pending_action")
      .eq("chat_id", chatId)
      .maybeSingle();
    if (chat?.pending_action === "support") {
      await supabaseAdmin.from("telegram_chats").update({ pending_action: null }).eq("chat_id", chatId);
      await supabaseAdmin.from("bot_requests").insert({ chat_id: chatId, kind: "support", body: text.slice(0, 1000) });
      await tg("sendMessage", {
        chat_id: chatId,
        text: `Thanks ${name}! Your question is with an admin now — we'll reply here within a few hours. 🙏`,
      });
      return;
    }
  }
  await tg("sendMessage", {
    chat_id: chatId,
    text: "Got it ✅ An admin will reply here soon.\nTip: type /menu to see everything the bot can do.",
  });
  await sendScreen(chatId, "menu");
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(actual, webhookSecret())) return new Response("Unauthorized", { status: 401 });

        const update = (await request.json()) as Update;
        if (typeof update.update_id !== "number") return Response.json({ ok: true });

        const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
        const from = update.message?.from ?? update.callback_query?.from;
        if (!chatId) return Response.json({ ok: true });

        // Storage is optional: skipped in static demo mode (no database configured).
        if (hasDb()) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
        }

        try {
          if (update.callback_query) {
            await tg("answerCallbackQuery", { callback_query_id: update.callback_query.id });
            await onCallback(chatId, update.callback_query.data ?? "menu");
          } else if (update.message?.text) {
            await onText(chatId, from?.first_name ?? "there", update.message.text);
          }
        } catch (e) {
          console.error(e);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
