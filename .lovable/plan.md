# Free hosting choice: Cloudflare Workers Free (Render as backup)

## Decision
- **Main choice: Cloudflare Workers Free.** $0 per month, with no card needed for the hosting itself.
- **Backup: Render Free, with a ping every 5 minutes** from cron-job.org or UptimeRobot. We switch to it only if the Workers test below fails.
- Everything else in the stack stays the same: TanStack Start, Neon Free, Better Auth, Cloudflare R2, Resend Free.

## Why Workers wins
- It never sleeps, so the Telegram bot always answers straight away. No ping service is needed.
- The free plan allows 100,000 requests per day, which is more than enough for a pilot.
- This project already runs on the same kind of server Workers uses, and TanStack Start has an official guide for it. That means fewer changes.
- R2 file storage is on the same platform, and Neon has a database connector that works there.

## Why Render is the backup, not the main choice
- The 5-minute ping does stop the 15-minute sleep. But the free plan includes only 750 server hours a month across the whole account. One always-on service just fits; a second one, like a test copy, would not.
- Free Render servers can still restart at any time, and every update causes a short outage. Pings cannot prevent either.
- Render says its free plan is not meant for real (production) use.

## The one risk with Workers, and how we check it
- Each request on the free plan gets only 10 ms of processing time. Building pages and checking passwords securely might go over that limit.
- We will **measure this before committing**. We will not weaken password security to make it fit.
- If it does not fit, we keep the same code and move to Render Free with pings. Later options are Workers Paid or Railway, both $5/month.

## Steps
1. Deploy a small test version to Workers Free, using a separate test Telegram bot and a Neon test database.
2. Test the following: home page, demo dashboards, the bot webhook, one database save and read, and one sign-in with password checking. Record the processing time for each.
3. If all pass: Workers becomes the pilot host. Update the deployment guide (DEPLOY.md) for Workers, and keep the Render steps as a backup section.
4. If password checking or pages go over the limit: run the same test on Render Free with an UptimeRobot ping, then choose based on the results.
5. Only after you approve: point the real bot at the new host. A bot can have only one destination at a time.

## What you need to do
- Create free accounts on Cloudflare and Neon, and Render too if we need the backup.
- Create a separate test bot with @BotFather.
- Enter passwords and keys only in the protected settings boxes, never in chat.

## Technical notes
- Build target: Cloudflare (Nitro `cloudflare-module`, or the Cloudflare Vite plugin from the official guide), plus `wrangler.toml` with `nodejs_compat`.
- Database: `@neondatabase/serverless` (HTTP/WebSocket) on Workers; the regular `pg` pool on Render (`build:node`).
- Read secrets from the Worker environment, not as module-level `process.env` reads.
- Passwords: Better Auth's default scrypt hashing. Use `wrangler tail` to check CPU time per request; do not lower the hashing cost settings.
- Render backup: the existing `build:node` script, plus a ping to a lightweight `/api/public/health` route.
