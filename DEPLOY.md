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

1. **Sending domain:** AgentCourier Free is the selected replacement for Resend, with `brightpathtutors.de5.net` as the proposed sender domain. Its acceptance of this DNSHE subdomain is not yet verified. Follow section D below before enabling registration. Resend remains the compatibility default until `AUTH_EMAIL_PROVIDER=agentcourier` is explicitly set. Do not use a testing sender for public signups.
2. **Account tables:** in the same Neon project/database as the deployed bot, run `database/004-accounts.sql`. It adds `bpt_*` tables; existing bot data and managed `neon_auth` tables are untouched. Keep a database backup first.
3. **Host configuration:** non-secret `AUTH_EMAIL_PROVIDER`, `AUTH_EMAIL_FROM` and `BETTER_AUTH_URL` live in `wrangler.jsonc` `vars` (Git deploys erase plain-text dashboard vars otherwise). In the dashboard add only **Secret** type: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `AGENTCOURIER_API_KEY`, `BETTER_AUTH_SECRET` (≥32 random characters). The `wrangler.jsonc` name must match the live Worker name. Never paste secrets in chat.
4. **Account database:** on Cloudflare/Render accounts use the same `DATABASE_URL` Neon secret as the bot (no extra database secret). Inside Lovable they use the linked Neon connection. AgentCourier delivery uses its own `AGENTCOURIER_API_KEY`.
5. **Initial administrator:** after deployment/email are ready, register the owner's account and confirm email. Verify that account in Neon before an owner-controlled administrator assignment. There is deliberately no public "become admin" command or shared admin password. Obtain the exact account-specific assignment instructions at that point.
6. **Required checks:** verify signup confirmation, sign-in, reset link, sign-out (including Back), direct private access rejection, ordinary-account admin rejection, family acceptance/rejection and isolation, and deployed login CPU/errors. A homepage's 8 ms result does not establish login fits Workers Free. Keep strong password hashing; use Render if it does not fit.

Photos are represented by a profile storage reference only; private file upload is a later R2 step. Family links currently grant no access to booking/progress records. No real-bot webhook change is included.

## D. AgentCourier Free account emails — setup pending

1. Create an account at https://dashboard.agentcourier.cc/sign-up and confirm the Free plan and outbound sending allowance. Published pricing advertises one custom domain and 5,000 emails/month; confirm the account's actual allowance before rollout.
2. Add **brightpathtutors.de5.net** under custom domains. `my.dnshe.com` is the DNS management site, not the sender domain. If AgentCourier refuses the hostname, stop; compatibility is not guaranteed merely because subdomains are supported.
3. Copy the exact DNS instructions AgentCourier gives into DNSHE for that registered hostname. AgentCourier checks MX, ownership TXT, SPF, DKIM and DMARC. Preserve unrelated website records; do not invent verification tokens, overwrite an existing SPF record with a second SPF record, or change MX without checking whether another mailbox already uses this domain.
4. Run domain verification. Confirm **send_enabled** is true, not merely domain status **active**; all five checks are required for outgoing emails.
5. Create a sender inbox such as `accounts@brightpathtutors.de5.net` on the verified domain (send-only if available). This is a proposed new account sender, not a change to the public contact address.
6. Create a key with **send** scope. Enter it privately in Cloudflare as `AGENTCOURIER_API_KEY`; set `AUTH_EMAIL_PROVIDER` to `agentcourier` and `AUTH_EMAIL_FROM` to the exact sender inbox. Never paste the key into chat or GitHub. GitHub sync does not transfer secrets.
7. Complete section C's account database/security setup and redeploy. Test actual confirmation and reset delivery to a real recipient, including Spam, and check delivery status in AgentCourier. A queued response is acceptance, not proof of inbox delivery. Registration must remain closed until domain verification and delivery are confirmed.

Official references: https://agentcourier.cc/pricing and https://api.apimail.cc/openapi.json. The documented send call is `POST /v1/messages/send` with `X-API-Key`, `from`, `to`, `subject` and `body_text`; no provider SDK or DNSHE credentials are needed in the app.
