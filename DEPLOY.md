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

## C. Account foundation — not activated yet

The new `/auth`, `/account`, `/admin` and `/reset-password` pages use Better Auth.
The public `/demo/admin` page still shows samples, not private records.
Registration stays disabled until the required email/security settings are present.

1. **Sending domain:** identify a domain you own, then verify its email DNS records in Resend. A domain must be verified before sending confirmations to families. The connected Resend account currently has no domains. Do not use the testing sender for public signups.
2. **Account tables:** in the same Neon project/database as the deployed bot, run `database/004-accounts.sql`. It adds `bpt_*` tables; existing bot data and managed `neon_auth` tables are untouched. Keep a database backup first.
3. **Host configuration:** `BETTER_AUTH_URL` must equal the exact site's HTTPS origin (no path); `BETTER_AUTH_SECRET` must be a securely generated secret of at least 32 characters; `AUTH_EMAIL_FROM` is a sender on the verified domain. Configure secrets only through hosting settings, never through chat.
4. **Connector limitation:** account storage and email delivery currently depend on Lovable's linked Neon/Resend connections. Those project connection credentials are not the raw Neon URL or raw Resend provider key. They are not automatically transferred to Cloudflare by GitHub sync. External-host provisioning for those credentials must be verified before accounts can work there. Do not paste a provider key into a connector-key field or assume the existing `DATABASE_URL` enables accounts.
5. **Initial administrator:** after deployment/email are ready, register the owner's account and confirm email. Verify that account in Neon before an owner-controlled administrator assignment. There is deliberately no public "become admin" command or shared admin password. Obtain the exact account-specific assignment instructions at that point.
6. **Required checks:** verify signup confirmation, sign-in, reset link, sign-out (including Back), direct private access rejection, ordinary-account admin rejection, family acceptance/rejection and isolation, and deployed login CPU/errors. A homepage's 8 ms result does not establish login fits Workers Free. Keep strong password hashing; use Render if it does not fit.

Photos are represented by a profile storage reference only; private file upload is a later R2 step. Family links currently grant no access to booking/progress records. No real-bot webhook change is included.
