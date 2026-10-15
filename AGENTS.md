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
- Admin demo endpoints have no login yet — add admin auth before real use.
- Railway/Node deploys use `build:node` (NITRO_PRESET=node-server); see DEPLOY.md. Without SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY the server runs in static demo mode (hasDb() in telegram.server.ts); TELEGRAM_BOT_TOKEN switches the bot to direct Telegram calls.
