# Fix the Cloudflare "Try again" error, then switch on sign-in

## Likely cause
- The project's Cloudflare settings file names the site `bright-path-tutors`. Your live site is called `bright-path-tutors-normal`. Because of this mismatch, Cloudflare can reject changes made from its dashboard.
- Each new deploy from GitHub also deletes plain-text settings that were added in the dashboard. Only settings saved as **Secret** survive a redeploy.

## Part A — Me: fix the settings file
- Rename the site in the settings file to `bright-path-tutors-normal`, so it matches the live site.
- Put the three settings that aren't private into the file itself: `AUTH_EMAIL_PROVIDER=agentcourier`, `AUTH_EMAIL_FROM=accounts@brightpathtutors.de5.net` and `BETTER_AUTH_URL=https://bright-path-tutors-normal.hailomasegede.workers.dev`. After that, you won't need to add them in Cloudflare by hand.
- Tell Cloudflare to keep any other settings added in the dashboard (`keep_vars`).
- Update the deployment guide to match.

## Part B — You: Cloudflare
1. Wait for GitHub to sync, then open Cloudflare → your Worker → **Deployments**. A new build should start by itself.
2. Under **Settings → Variables and Secrets**, keep only these as **Secret** type: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `AGENTCOURIER_API_KEY` and `BETTER_AUTH_SECRET`. Delete any plain-text copies of the three settings from Part A.
3. To add a secret, use **Add → type Secret → Save**. Don't use "Deploy". If "Try again" still appears, send me a screenshot of the error, with no values showing.
4. Check that `/api/public/health` still shows `"database":"ok"`.

## Part C — Together: switch on and test (old Part 5)
1. Back up Neon by creating a branch. Then run `database/004-accounts.sql` in the SQL Editor.
2. In AgentCourier, check that the domain shows **sending enabled**.
3. Sign up on the site with your own email. Check that the confirmation email arrives (look in Spam too). Then test sign-in, password reset and sign-out.
4. Make your own account the first administrator. I'll give you a single SQL line for your account only.
5. Check Cloudflare's processing time for sign-in. If it goes over the free limit, we move to Render without weakening passwords.

## Technical details
- In `wrangler.jsonc`: set `"name": "bright-path-tutors-normal"`, add `"keep_vars": true`, and add a `"vars"` block holding the three non-secret values.
- In `DEPLOY.md` section A/D: list secrets and vars separately.
