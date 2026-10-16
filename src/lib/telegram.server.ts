import { createHash } from "crypto";

// Two modes: Lovable (connector gateway, TELEGRAM_API_KEY) or self-hosted e.g. Railway (TELEGRAM_BOT_TOKEN, direct).
function directToken(): string | undefined {
  return process.env["TELEGRAM_BOT_TOKEN"] || undefined;
}
function connKey(): string {
  const k = directToken() ?? process.env["TELEGRAM_API_KEY"];
  if (!k) throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_API_KEY is not configured");
  return k;
}
// True when the server has database access; without it the app runs in static demo mode.
export function hasDb(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

// Secret Telegram echoes in X-Telegram-Bot-Api-Secret-Token. TELEGRAM_WEBHOOK_SECRET (self-hosted,
// set by hand in the setWebhook URL) wins; otherwise derived from the connection key.
export function webhookSecret(): string {
  const manual = process.env["TELEGRAM_WEBHOOK_SECRET"];
  if (manual) return manual;
  return createHash("sha256").update(`telegram-webhook:${connKey()}`).digest("base64url");
}

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

// Telegram Bot API call through the Lovable connector gateway.
export async function tg(method: string, body: Record<string, unknown>) {
  const token = directToken();
  let res: Response;
  if (token) {
    res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
    res = await fetch(`${GATEWAY_URL}/${method}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connKey(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
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
  help: {
    text: "Here's everything I can do:\n📅 /sessions — upcoming sessions\n📊 /report — weekly progress\n🆘 /support — ask us anything\n/menu — start over any time",
    buttons: [["📅 My sessions", "sessions"], ["🆘 Support", "support"]],
  },
};

export function keyboard(buttons: [string, string][]) {
  const rows: { text: string; callback_data: string }[][] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2).map(([text, data]) => ({ text, callback_data: data })));
  }
  return { inline_keyboard: rows };
}

export async function sendScreen(chatId: number, key: string, prefix = "", name?: string) {
  const s = screens[key] ?? (screens["menu"] as Screen);
  // Personalize the sample data with the real person's first name.
  const text = name ? s.text.replaceAll("Ruth", name) : s.text;
  return tg("sendMessage", { chat_id: chatId, text: prefix + text, reply_markup: keyboard(s.buttons) });
}
