# Deploying Bright Path Tutors to Vercel (v1 — static demo, no database)

On Vercel the site runs in **static demo mode**: every page and dashboard works with sample data,
and the Telegram bot answers with its menu. Nothing is saved (applications show "received" but aren't stored;
the "Live bot" list stays empty). Saving can be added later with a database.

## 1. Put the code on GitHub
Lovable: Project settings → Git → Connect → choose your GitHub account. A new repo is created and kept in sync.

## 2. Create the Vercel project
1. vercel.com → Add New → Project → Import the GitHub repo.
2. In the project settings:
   - Framework Preset: **Other**
   - Build Command: `npm run build:vercel`
   - Output Directory: leave as default (the build handles it)
   - Install Command: `npm install`
3. Deploy. Vercel gives you a URL like `https://bright-path.vercel.app`.

## 3. Environment variables (Project → Settings → Environment Variables)
| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather (`/mybots` → bot → API Token) |

Do **not** add any database variables — leaving them out turns on static demo mode.
Redeploy after saving variables (Deployments → ⋯ → Redeploy).

## 4. Point the bot at Vercel
A bot can talk to only one site at a time — this moves it away from the Lovable version.
**Easiest way — no commands needed:** paste this into your browser's address bar
(replace `<your token>` with the BotFather token and the URL with your Vercel URL) and press Enter:

```
https://api.telegram.org/bot<your token>/setWebhook?url=https://bright-path.vercel.app/api/public/telegram/webhook
```

You should see `{"ok":true,...}` on the page. That's it — the bot now talks to Vercel.

**Alternative — from a terminal on your computer** (needs Node 18+ installed, inside the downloaded repo):

```bash
TELEGRAM_BOT_TOKEN=<your token> node scripts/set-telegram-webhook.mjs https://bright-path.vercel.app
```
You should see `"ok": true` and the Vercel URL ending in `/api/public/telegram/webhook`.

## 5. Check it works
- Open the Vercel URL → home page loads; `/demo/admin` and other dashboards work.
- In Telegram send `/start` to the bot → the menu appears.
- Problems: Vercel → Deployments → select the deployment → Logs.

## Switching the bot back to Lovable
Ask the Lovable chat: "point the Telegram bot back to the Lovable preview".

## Later: adding a database
Easiest: create a free Supabase project, run `drizzle/migrations/*.sql` in its SQL editor, then add
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from that project's API settings) as Vercel environment
variables. Saving turns on automatically.
