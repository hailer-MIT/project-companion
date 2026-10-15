// Usage: TELEGRAM_BOT_TOKEN=xxx node scripts/set-telegram-webhook.mjs https://your-app.up.railway.app
import { createHash } from "node:crypto";
const token = process.env.TELEGRAM_BOT_TOKEN;
const base = process.argv[2];
if (!token || !base) { console.error("Need TELEGRAM_BOT_TOKEN env and base URL arg"); process.exit(1); }
const secret = createHash("sha256").update(`telegram-webhook:${token}`).digest("base64url");
const api = (m, b) => fetch(`https://api.telegram.org/bot${token}/${m}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b ?? {}) }).then(r => r.json());
console.log(await api("setWebhook", { url: `${base.replace(/\/$/, "")}/api/public/telegram/webhook`, secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: true }));
console.log(await api("getWebhookInfo"));
