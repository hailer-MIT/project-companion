import { createHash } from "crypto";

function botToken(): string {
  const t = process.env["TELEGRAM_BOT_TOKEN"];
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return t;
}

// Secret Telegram echoes in X-Telegram-Bot-Api-Secret-Token; derived so no extra env var is needed.
export function webhookSecret(): string {
  return createHash("sha256").update(`telegram-webhook:${botToken()}`).digest("base64url");
}

// Direct Telegram Bot API call (portable: works on Lovable, Railway, anywhere).
export async function tg(method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${text}`);
  const json = JSON.parse(text) as { ok: boolean; description?: string; result?: unknown };
  if (!json.ok) throw new Error(`Telegram ${method} error: ${json.description}`);
  return json.result;
}

type Screen = { text: string; buttons: [string, string][] };

// Sample-data replies (demo). Keys are callback_data (<=64 bytes).
export const screens: Record<string, Screen> = {
  menu: {
    text: "What would you like to do?",
    buttons: [["📅 My sessions", "sessions"], ["📊 Weekly report", "report"], ["🆘 Support", "support"]],
  },
  sessions: {
    text: "Upcoming for Ruth:\n• Today 16:00 — Maths with Dawit\n• Thu 16:00 — Physics with Dawit (⚠️ awaiting payment)",
    buttons: [["💳 Pay Thu session", "pay"], ["🔁 Reschedule", "resched"], ["⬅️ Menu", "menu"]],
  },
  report: {
    text: "Ruth · week of Oct 7\nAttendance: 2/2 ✅\nAvg score: 81 (+3)\nTutor note: “Quadratic equations mastered.”",
    buttons: [["📅 My sessions", "sessions"], ["⬅️ Menu", "menu"]],
  },
  pay: {
    text: "Pay 450 ETB to Bright Path Tutors via Telebirr.\nReference: BPT-3021",
    buttons: [["✅ I've paid", "paid"], ["⬅️ Menu", "menu"]],
  },
  paid: {
    text: "Thanks! Admin will confirm shortly. You'll get a receipt here. 🧾",
    buttons: [["📅 My sessions", "sessions"], ["📊 Weekly report", "report"]],
  },
  resched: {
    text: "Pick a new time:",
    buttons: [["Fri 16:00", "slot_fri"], ["Sat 10:00", "slot_sat"], ["⬅️ Menu", "menu"]],
  },
  slot_fri: { text: "Request for Fri 16:00 sent to Dawit. We'll confirm here. ✅", buttons: [["⬅️ Menu", "menu"]] },
  slot_sat: { text: "Request for Sat 10:00 sent to Dawit. We'll confirm here. ✅", buttons: [["⬅️ Menu", "menu"]] },
  support: { text: "Write your question below and an admin will reply here within a few hours.", buttons: [["⬅️ Menu", "menu"]] },
};

export function keyboard(buttons: [string, string][]) {
  const rows: { text: string; callback_data: string }[][] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2).map(([text, data]) => ({ text, callback_data: data })));
  }
  return { inline_keyboard: rows };
}

export async function sendScreen(chatId: number, key: string, prefix = "") {
  const s = screens[key] ?? (screens["menu"] as Screen);
  return tg("sendMessage", { chat_id: chatId, text: prefix + s.text, reply_markup: keyboard(s.buttons) });
}
