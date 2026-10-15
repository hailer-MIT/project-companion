# Deploying Bright Path Tutors to Railway (v1 — static demo, no database)

On Railway the site runs in **static demo mode**: every page and dashboard works with sample data,
and the Telegram bot answers with its menu. Nothing is saved (applications show "received" but aren't stored;
the "Live bot" list stays empty). Saving can be added later with a database.

## 1. Put the code on GitHub
Lovable: Project settings → Git → Connect → choose your GitHub account. A new repo is created and kept in sync.

## 2. Create the Railway service
1. railway.com → New Project → Deploy from GitHub repo → pick the repo.
2. Service → Settings:
   - Build Command: `npm run build:node`
   - Start Command: `npm run start`
3. Settings → Networking → **Generate Domain** → copy it, e.g. `https://bright-path.up.railway.app`.

## 3. Variables (Service → Variables)
| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather (`/mybots` → bot → API Token) |
| `NODE_VERSION` | `22` |

Do **not** add any database variables — leaving them out turns on static demo mode.
Railway redeploys automatically after you save variables.

## 4. Point the bot at Railway
A bot can talk to only one site at a time — this moves it away from the Lovable version.
On your computer (needs Node 18+), inside the downloaded repo:
```bash
TELEGRAM_BOT_TOKEN=<your token> node scripts/set-telegram-webhook.mjs https://bright-path.up.railway.app
```
You should see `"ok": true` and the Railway URL ending in `/api/public/telegram/webhook`.

## 5. Check it works
- Open the Railway URL → home page loads; `/demo/admin` and other dashboards work.
- In Telegram send `/start` to the bot → the menu appears.
- Problems: Railway → Deployments → View logs.

## Switching the bot back to Lovable
Ask the Lovable chat: "point the Telegram bot back to the Lovable preview".

## Later: adding a database
Easiest: create a free Supabase project, run `drizzle/migrations/*.sql` in its SQL editor, then add
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from that project's API settings) as Railway variables.
Saving turns on automatically.
