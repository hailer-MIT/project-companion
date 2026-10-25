<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Demo data lives in `src/lib/demo-data.ts`; real data (Telegram chats/messages, tutor applications) lives in Lovable Cloud tables that are service-role only — browser reaches them via server functions in src/lib/*.functions.ts.
- Public marketing pages wrap content in `PublicPage` (src/components/site-chrome.tsx); role dashboards live under the `/demo` layout route so the sidebar is shared.
- Telegram bot: webhook at src/routes/api/public/telegram/webhook.ts (calls Telegram through the Lovable connector gateway with LOVABLE_API_KEY + TELEGRAM_API_KEY; webhook secret derived from TELEGRAM_API_KEY), bot logic in src/lib/telegram.server.ts; tables are service-role only — browser goes through server functions.
- Live admin server functions fail closed through `src/lib/admin-access.ts` until verified sessions and separately protected roles are implemented; public `/demo` dashboards must show sample data only.
- Legacy Telegram `is_admin` flags are untrusted because they were self-assigned; never use them for private notifications or permissions. Restore alerts only through verified account linking.
- Railway/Node deploys use `build:node` (NITRO_PRESET=node-server); see DEPLOY.md. Without SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY the server runs in static demo mode (hasDb() in telegram.server.ts); TELEGRAM_BOT_TOKEN switches the bot to direct Telegram calls.
- All bot/application storage goes through src/lib/store.server.ts: Neon via DATABASE_URL when set (external hosts), else Lovable Cloud; Neon schema is database/neon-setup.sql (keep in sync with drizzle migrations) — keeps the app portable between databases.
- Portable accounts use request-scoped Better Auth, the supported Kysely adapter and server-only Neon transport (direct DATABASE_URL on external hosts, else the Lovable gateway); HTTP interactive transactions are rejected, and cross-table lifecycle writes use SQL triggers or single-statement CTEs for atomicity.
- Better Auth roles are in protected bpt_roles, separate from profiles; every private account/admin function validates a verified cookie session and authorizes the action independently of the _member UI gate. Existing legacy admin functions remain closed.
- Account schema changes are additive and versioned in database/; do not alter managed neon_auth tables. Account secrets, email delivery and external-host credential wiring must be verified before enabling registration.
- Account email transport lives in a server-only helper with explicit provider selection and fixed documented endpoints; missing credentials or provider rejection never fall back to another sender, preserving security and hosting portability.
