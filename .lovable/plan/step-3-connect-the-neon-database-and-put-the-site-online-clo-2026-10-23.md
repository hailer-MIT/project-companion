# Step 3: Connect the Neon database and put the site online (Cloudflare Workers Free)

## What you will do (about 20 minutes, no code)
1. **Neon:** create a project named "bright-path-tutors" (region: Frankfurt, the closest to Ethiopia). Copy the **connection string** from the dashboard. Keep it private and do not paste it into this chat.
2. **GitHub:** connect this project to GitHub (Project settings, then Git) so Cloudflare can read the code.
3. **Cloudflare:** Workers & Pages, then Create, then Import repository. Build: `npm run build:workers`. Deploy: `npx wrangler deploy`.
4. **Cloudflare secrets:** add `DATABASE_URL` (the Neon string), `TELEGRAM_BOT_TOKEN` (the test bot) and `TELEGRAM_WEBHOOK_SECRET` (any long password you make up).
5. **Point the test bot** at the new site with the browser link in DEPLOY.md.

## What I will build
1. **Database switch:** the site uses Neon whenever `DATABASE_URL` is set. Inside Lovable it keeps using the current database, so the preview keeps working.
2. **Tables in Neon:** one setup file creates the tables Neon needs: tutor applications, Telegram chats, messages and bot requests. You run it once by pasting it into Neon's SQL Editor, and I will give you the exact steps.
3. **Same behaviour everywhere:** tutor applications are saved, and bot support, payment and reschedule requests are stored. Admin pages stay locked until sign-in exists (step 4).
4. **Health check:** `/api/public/health` will also report whether the database is reachable, without showing any secrets.
5. **DEPLOY.md:** updated with the steps above plus a checklist: the site opens, the health check works, `/start` works on the test bot, and a test application appears in Neon.
6. **Tests:** check that the app picks the database correctly, and that the site still works in demo mode with no database.

## Not included in this step
- Copying the old records (one test application and your chat) to Neon. They are test data, so we start fresh.
- Moving the real bot. It stays where it is until you approve the move.
- Sign-in and roles (Better Auth). That is the next step.

## Technical details
- Add `@neondatabase/serverless`, which talks to Neon over HTTP and runs on Workers. Add a small `src/lib/db.server.ts` with `query(sql, params)` that always uses parameterized SQL.
- Data access in `applications.functions.ts`, `telegram.functions.ts` and `webhook.ts` goes through a repository layer: the Neon driver when `DATABASE_URL` is set, otherwise the current client. `hasDb()` returns true for either.
- Generate `drizzle/neon-setup.sql`. Set `drizzle.config.ts` to prefer `DATABASE_URL`.
- Check the Workers build and its 10 ms CPU limit after the first deploy, using the CPU-time view in Cloudflare Observability.
