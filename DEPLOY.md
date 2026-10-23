# Deploying Bright Path Tutors (free hosting)

Main host: **Cloudflare Workers Free** ($0). Backup: **Render Free + keep-alive ping**.
Without database settings the site runs in **static demo mode**: all pages and dashboards show sample data, and the bot answers with its menu.

Use a **separate test bot** (create one with @BotFather) until the team approves moving the real bot. A bot can only talk to one site at a time.

## 0. Neon database (do first)
1. neon.com → New project → name `bright-path-tutors`, region **AWS Europe Central (Frankfurt)**.
2. Left menu → **SQL Editor** → open the file `database/neon-setup.sql` from this project (on GitHub), copy all of it, paste, click **Run**. You should see "success".
3. Dashboard → **Connect** → copy the connection string (starts with `postgresql://`). Keep it private — you will paste it only into Cloudflare in step A3.

## A. Cloudflare Workers (main)
1. Put the code on GitHub (Lovable: Project settings → Git → Connect).
2. Cloudflare dashboard → Workers & Pages → Create → Import a repository → choose the repo.
   - Build command: `npm run build:workers`
   - Deploy command: `npx wrangler deploy`
3. Worker → Settings → Variables and Secrets → add as **Secret**:
   - `TELEGRAM_BOT_TOKEN` — test bot token
   - `TELEGRAM_WEBHOOK_SECRET` — any letters/numbers password you invent
   - `DATABASE_URL` — the Neon connection string
4. Redeploy. You get a URL like `https://bright-path-tutors.<you>.workers.dev`.
5. Point the test bot at it — paste in your browser:
   ```
   https://api.telegram.org/bot<token>/setWebhook?url=<your workers URL>/api/public/telegram/webhook&secret_token=<your secret>&drop_pending_updates=true
   ```
   You should see `{"ok":true,...}`.
6. Check: open the URL, `/demo/admin`, and `/api/public/health` (should show `"database":"ok"`); send `/start` to the test bot.
7. Speed check (free plan allows 10 ms processing per request): Worker → Observability → look at "CPU time". If many requests exceed 10 ms or show "exceeded CPU" errors, use plan B.

## B. Render Free (backup)
1. render.com → New → Web Service → connect the repo.
   - Build: `npm install && npm run build:node` · Start: `npm start` · Plan: Free
2. Add the same two variables under Environment.
3. Free servers sleep after 15 min. At cron-job.org or UptimeRobot, add a check every 5 minutes on `https://<your app>.onrender.com/api/public/health`.
4. Set the bot webhook as in A5, using the Render URL.
Note: 750 free hours/month per account — enough for one always-on service only.

## Checklist after deploy
- [ ] Site opens; `/demo/admin` shows the sample dashboard
- [ ] `/api/public/health` shows `"database":"ok"`
- [ ] Test bot answers `/start`; tap 🆘 Support and send a question
- [ ] Submit a test tutor application on `/apply`
- [ ] Neon → Tables → `tutor_applications` and `bot_requests` show the new rows
