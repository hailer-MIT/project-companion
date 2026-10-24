# Step 4: Secure accounts and a private administrator page

## Starting point
- Your Cloudflare site and test bot work, and you confirmed records in Neon.
- You reported 8 ms CPU time. This is encouraging for the current site, not proof that password sign-in fits the free limit. Test the heavier sign-up and sign-in requests separately, including their upper-end CPU usage and failures.
- You already chose full personal profiles and parent–student relationships, with permissions managed separately.
- You own another domain. It can be used for account emails without moving the website away from its current Cloudflare address.

## What I will build
1. **Portable accounts:** Better Auth with Neon, email/password registration, sign-in and sign-out. Preserve the current website and sample dashboards; never pretend a demo visitor is signed in.
2. **Verified email and recovery:** confirmation emails, forgotten-password and new-password pages. Require email confirmation; no automatic confirmation. Use the previously selected Resend service with an owned, verified sending domain.
3. **Personal accounts:** name, photo reference and preferences. Add family relationships, with safe invitation/acceptance rather than letting someone claim an arbitrary student. Actual private photo uploads come in the R2 stage.
4. **Protected permissions:** separate parent, student, tutor and administrator permissions from editable profiles. Signing up or changing a profile cannot grant tutor approval or administrator access. Prepare a controlled, owner-run first-administrator setup after a verified account exists.
5. **Private administration:** a separate signed-in page for real tutor applications and Telegram requests, including approval/rejection and marking requests handled. Keep public `/demo` pages sample-only. Do not restore Telegram alerts to legacy self-assigned administrators.
6. **Safety checks:** persistent sign-in rate limits, server-validated sessions, secure cookies, direct-request permission checks and cache cleanup on sign-out. Tests cover denied access, role escalation attempts and family access boundaries.
7. **Deployment instructions:** one ordered account setup guide, additional Neon schema steps, required Cloudflare settings and a real-user test checklist. Missing account configuration must fail closed without breaking the public site or bot.

## What you will do
1. Provide the domain name you own when we reach email setup; no passwords or keys in chat. Verify the email records shown by Resend at your domain provider.
2. Enter the account secret and email sending key directly into Cloudflare settings, alongside your existing secrets.
3. Run the new account schema setup in Neon and redeploy the synced code on Cloudflare.
4. Register and confirm a test account. Run the controlled first-administrator step only for the verified account you choose.
5. Test sign-in, sign-out, confirmation, password reset and private administration on the deployed site. Check password requests against Cloudflare's CPU allowance; if secure hashing cannot fit Workers Free, use the agreed Render Free fallback without weakening passwords.

## Completion checks
- An unverified account cannot reach private pages or private records.
- A regular account cannot promote itself, read another family's records or call administrator actions directly.
- A verified administrator sees the existing Neon applications and bot requests, changes one test record and reads the saved result back.
- Sign-out removes private cached content; navigating Back cannot restore access.
- Confirmation and reset links work on the deployed site, and authentication requests run reliably within the chosen host's limits.
- Tests and preview checks pass. External checks remain explicitly unverified until you complete the owner-only steps; no private Neon credentials are available here.

## Not included yet
- Bookings, money collection, attendance, progress reports and learning materials.
- Private file uploads and document-review policies.
- Moving the real Telegram bot or sending private alerts before verified account linking.
- Copying old test data from Lovable Cloud. Backups and an isolated Neon restore test remain a separate pre-pilot task.

## Technical approach
- Use request-scoped Better Auth initialization and a Drizzle PostgreSQL schema with a Neon-compatible adapter. Prove the precise Neon HTTP adapter and transaction behavior before adopting it; keep database access behind server-only boundaries.
- Serve Better Auth's HTTP handler under `/api/public/auth/$`, since external-host authentication must not depend on Lovable's site gate. The auth handler validates its own sessions, trusted origins and state-changing requests. TanStack internal private actions independently validate the Better Auth session and protected role rows.
- Use cookie-based Better Auth sessions, not the generated Cloud Auth bearer middleware, for the portable account flow. Preserve integration-owned generated files and existing public bot/application behavior.
- Store permissions in a protected separate roles table, not Better Auth's editable user/profile fields or Telegram flags. Profile and relationship creation must have tested lifecycle and ownership rules.
- Use versioned SQL changes for the existing Neon database without overwriting current bot/application tables. Preserve strong supported password hashing and test its actual deployed CPU behavior. Database-backed rate limits must persist across requests and instances.
- Add unique titles and sharing metadata for new account and administrator pages; retain the existing visual design.