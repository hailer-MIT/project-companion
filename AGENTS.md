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
- Demo data lives in `src/lib/demo-data.ts`; the current build is a clickable demo with no backend — replace with Lovable Cloud tables when v1 starts.
- Public marketing pages wrap content in `PublicPage` (src/components/site-chrome.tsx); role dashboards live under the `/demo` layout route so the sidebar is shared.
- Telegram bot: webhook at src/routes/api/public/telegram/webhook.ts (calls api.telegram.org directly with TELEGRAM_BOT_TOKEN; webhook secret derived from it), bot logic in src/lib/telegram.server.ts; tables are service-role only — browser goes through server functions.
- Railway/Node deploys use `build:node` (NITRO_PRESET=node-server); see DEPLOY.md — default build targets Cloudflare.
