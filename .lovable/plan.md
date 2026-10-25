# Next steps: switch on sign-in

## Part A is already done. You don't need to change anything
The name `bright-path-tutors-normal` is set in a settings file inside this project's code, called `wrangler.jsonc`. I already changed it, so there is nothing to change in Cloudflare or AgentCourier. When GitHub syncs, Cloudflare picks up the change by itself.

## Part B: you, in Cloudflare
1. Open your site's **Deployments** page and check that a new build finishes green.
2. Under **Settings → Variables and Secrets**, keep only these five, each with type **Secret**: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `AGENTCOURIER_API_KEY` and `BETTER_AUTH_SECRET`.
3. Delete any plain-text `AUTH_EMAIL_PROVIDER`, `AUTH_EMAIL_FROM` or `BETTER_AUTH_URL`. To add a missing secret, use **Add → Secret → Save**.
4. Open `/api/public/health` on your site and check that it shows `"database":"ok"`.

## Part C: together, switch on and test
1. Back up Neon by creating a branch. Then run `database/004-accounts.sql`.
2. In AgentCourier, check that your domain shows **sending enabled**.
3. Sign up with your own email and confirm the email arrives (look in Spam too). Then test sign-in, password reset and sign-out.
4. Make your own account the first administrator. I'll give you one SQL line for your account only.
5. Check Cloudflare's processing time for sign-in.
