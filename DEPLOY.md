# Deploying Bright Path Tutors (free hosting)

Main host: **Cloudflare Workers Free** ($0). Backup: **Render Free + keep-alive ping**.
Without database settings the site runs in **static demo mode**: all pages and dashboards show sample data, and the bot answers with its menu.

Use a **separate test bot** (create one with @BotFather) until the team approves moving the real bot. A bot can only talk to one site at a time.

## A. Cloudflare Workers (main)
1. Put the code on GitHub (Lovable: Project settings → Git → Connect).
2. Cloudflare dashboard → Workers & Pages → Create → Import a repository → choose the repo.
   - Build command: `npm run build:workers`
   - Deploy command: `npx wrangler deploy`
3. Worker → Settings → Variables and Secrets → add as **Secret**:
   - `TELEGRAM_BOT_TOKEN` — test bot token
   - `TELEGRAM_WEBHOOK_SECRET` — any letters/numbers password you invent
4. Redeploy. You get a URL like `https://bright-path-tutors.<you>.workers.dev`.
5. Point the test bot at it — paste in your browser:
   ```
   https://api.telegram.org/bot<token>/setWebhook?url=<your workers URL>/api/public/telegram/webhook&secret_token=<your secret>&drop_pending_updates=true
   ```
   You should see `{"ok":true,...}`.
6. Check: open the URL, `/demo/admin`, and `/api/public/health` (shows `{"ok":true}`); send `/start` to the test bot.
7. Speed check (free plan allows 10 ms processing per request): Worker → Observability → look at "CPU time". If many requests exceed 10 ms or show "exceeded CPU" errors, use plan B.

## B. Render Free (backup)
1. render.com → New → Web Service → connect the repo.
   - Build: `npm install && npm run build:node` · Start: `npm start` · Plan: Free
2. Add the same two variables under Environment.
3. Free servers sleep after 15 min. At cron-job.org or UptimeRobot, add a check every 5 minutes on `https://<your app>.onrender.com/api/public/health`.
4. Set the bot webhook as in A5, using the Render URL.
Note: 750 free hours/month per account — enough for one always-on service only.

## Later: database (Neon)
Create a free Neon project; the database connection is added in the next step of the plan. Never paste keys into chat.
