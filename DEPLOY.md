# Deploying Bright Path Tutors to Railway

## 0. Prerequisites
- Project connected to GitHub (Lovable: + menu → GitHub → Connect project).
- Railway account linked to that GitHub account.
- Telegram bot token from @BotFather (`/mybots` → bot → API Token).

## 1. Build for Node
Lovable builds for Cloudflare Workers by default. Railway runs Node, so use the Node preset:
- Build command: `npm run build:node`  (= `NITRO_PRESET=node-server vite build`)
- Start command: `npm run start`       (= `node .output/server/index.mjs`)
Nitro's node server reads `PORT` (Railway sets it) and listens on `0.0.0.0`.

Verify locally first:
```bash
npm ci && npm run build:node && PORT=3000 npm run start
# open http://localhost:3000
```

## 2. Create the Railway service
1. Railway → New Project → Deploy from GitHub repo → pick the repo.
2. Service → Settings → Build: set Build Command `npm run build:node`; Deploy: Start Command `npm run start`.
3. Settings → Networking → Generate Domain (gives `https://<name>.up.railway.app`).
4. Optional: add `NODE_VERSION=22` variable (or `"engines": {"node": ">=22"}` in package.json).

## 3. Environment variables (Service → Variables)
| Name | Where it comes from | Used |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` in repo | build time (browser) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` in repo | build time (browser) |
| `VITE_SUPABASE_PROJECT_ID` | `.env` in repo | build time |
| `SUPABASE_URL` | same as VITE_SUPABASE_URL | server |
| `SUPABASE_PUBLISHABLE_KEY` | same as VITE_ key | server |
| `SUPABASE_SERVICE_ROLE_KEY` | **not available on Lovable Cloud** — see caveat | server (bot storage) |
| `TELEGRAM_BOT_TOKEN` | @BotFather | server |

`VITE_*` vars are inlined at build time, so they must exist before the build runs.

### Caveat: bot storage on Railway
The webhook stores chats/messages using the backend's service-role key, which Lovable Cloud does not expose.
On Railway the website and the Telegram menu work, but saving chats / the "Live bot" panel will fail.
Options: (a) host the app on Lovable (Publish) and keep Railway for later, or
(b) ask the agent to move bot storage behind narrowly-scoped database functions callable with the publishable key, or
(c) move to your own database later when v1 starts.

## 4. Point the Telegram webhook at Railway
Only one webhook per bot — setting it on Railway disconnects the Lovable preview.
```bash
TELEGRAM_BOT_TOKEN=<token> node scripts/set-telegram-webhook.mjs https://<name>.up.railway.app
```
Expect `ok: true` and `url` ending in `/api/public/telegram/webhook`, `pending_update_count: 0`, no `last_error_message`.

## 5. Verify
- `https://<name>.up.railway.app/` loads; `/demo` dashboards work.
- `curl -X POST https://<name>.up.railway.app/api/public/telegram/webhook` → `401` (secret check works).
- In Telegram, send `/start` to the bot → menu appears.
- Railway → Deployments → Logs for errors; `getWebhookInfo` → `last_error_message` for Telegram-side failures.

## 6. Updates
Every push to the GitHub default branch (including Lovable edits) redeploys Railway automatically.
The webhook URL stays the same unless the domain changes — re-run step 4 if it does.
