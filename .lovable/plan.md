# Bright Path Tutors: low-cost foundation and staged implementation

## Goal
Keep the current website and demo behaviour while building a secure, portable tutoring service. Prefer free or inexpensive services during the first one or two months, then upgrade measured bottlenecks rather than replacing the whole system.

## Scope of this plan
This is a proposed implementation sequence, not a migration already performed. No hosting account, payment, live bot switch, or production data change happens merely by reviewing the plan.

## Proposed first one or two months
- Frontend/backend: keep TanStack Start, React, and TypeScript; no framework license fee.
- Records: Neon Free. The live pricing page checked October 23, 2026 lists 1 GB storage and 100 CU-hours monthly per project; no credit card required. Free compute sleeps after five inactive minutes. Monitor usage and keep an independent restore-tested backup.
- Accounts: self-hosted Better Auth core in our application, not the optional paid infrastructure service. Add a free-tier transactional email provider such as Resend, subject to its quotas and a verified sending domain. Prefer authenticator-app MFA to paid SMS.
- Uploads: Cloudflare R2 Standard within its monthly included allowance (10 GB-month, 1 million Class A and 10 million Class B operations, no egress charge). Billing activation may still be required; confirm checkout before enabling.
- Hosting for a dependable pilot: Railway Hobby, $5/month minimum credited toward resource usage, with additional charges when usage exceeds that amount. This is a baseline, not a fixed all-inclusive bill.
- Zero-hosting-fee alternative: Cloudflare Workers Free for a limited prototype only if the deployment and auth tests pass. Its 10 ms CPU/request ceiling may be too tight for SSR and secure password hashing; do not weaken password security to fit it. Workers Paid starts at $5/month and is an alternative after runtime testing.
- Render Free is a demonstration alternative, not the recommended live-bot host: it sleeps after 15 minutes of inactivity. Railway's $5/30-day trial credit is temporary; its recurring Free plan has only $1 monthly credit. Vercel Hobby is restricted to personal/noncommercial use, so do not use it as the commercial service's free hosting plan.
- Aiven PostgreSQL Free is a database alternative (1 GB RAM/1 GB storage) but lacks a selectable region and managed connection pooling. Its $5 Developer tier is positioned for development, not a substitute for a production reliability plan.

### Cost boundaries
With database, file, and email usage within free quotas, the paid-pilot hosting baseline is $5 for one month or $10 for two. Actual bills can be higher due to hosting resource usage, quota overages, domains, taxes, backup/security tooling, or other services. A $0 prototype is conditional on all allowances and compatibility tests, not a promise of a free production system. Set alerts and supported spending controls; alerts alone do not cap bills.

### Official sources
- https://neon.com/pricing
- https://aiven.io/pricing/postgresql
- https://docs.railway.com/pricing/plans
- https://docs.railway.com/pricing/free-trial
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
- https://developers.cloudflare.com/r2/pricing/
- https://www.better-auth.com/docs/integrations/tanstack
- https://resend.com/pricing
- https://render.com/docs/free
- https://vercel.com/docs/plans/hobby
- https://docs.lovable.dev/features/database-backups

## Build order

### 1. Safety and a deployment proof
- Inventory the existing application and Telegram records, sample data, and any existing accounts.
- Stop public access to real admin records and remove Telegram `/admin` self-assignment before collecting more personal information. Keep sample dashboards available.
- Create separate development/testing and production environments; do not send test notifications to real families.
- Prove a minimal external deployment with a temporary test bot, a database read/write, and a secure test session before committing to a host.
- Preserve the current website appearance throughout.

### 2. Portable records and secure accounts
- Create the external PostgreSQL project under your team's ownership; keep credentials in protected settings.
- Implement versioned SQL migrations and module-specific data access, separate from page presentation.
- Export existing application records through supported Cloud export mechanisms; map only application tables into the new schema, not managed authentication/system schemas.
- Import into a test environment first; check row counts, identifiers, relationships, and representative records. Perform a restore rehearsal and keep a rollback copy.
- Add Better Auth, full profiles, parent–student relationships, and separately protected roles.
- Add verified email, recovery, session expiry/revocation, and admin MFA. Review existing accounts before choosing an account migration or invitation/reset flow.
- Authenticate and authorize every private server action, not just dashboard navigation.
- Test that parents see only linked children, tutors see only assigned lessons, and users cannot grant themselves admin permissions.

### 3. Private uploads and tutor recruitment
- Add private object storage with short-lived authorized upload/download access, size/type limits, and file references in PostgreSQL.
- Start with profile photos and tutor application documents; defer large videos and arbitrary uploads.
- Add document-screening safeguards before accepting real sensitive documents; object storage is not itself malware screening.
- Implement tutor review, qualifications, approval history, searchable approved listings, and availability.

### 4. Families and lesson booking
- Add child/student records, subject and grade preferences, tutor matching, and booking calendars.
- Enforce double-booking prevention in database transactions/constraints, with tests for concurrent requests.
- Implement rescheduling and cancellation only after the team agrees on the policies.

### 5. Payments and teaching operations
- Start with manual payment-proof submission, admin confirmation, receipts, balances, and tutor earnings.
- Store money in precise units with currency; keep an audit history of payment changes.
- Add attendance, lesson notes, progress results, and parent reports.
- Agree on prices, commissions, refunds, and attendance rules before implementing them; do not invent these values.

### 6. Connect Telegram to real workflows
- Link Telegram chats to verified website accounts using expiring one-time codes; no self-appointed administrators.
- Replace sample sessions/payments/reports with each account's authorized records.
- Use shared website/bot business rules, durable notification delivery, retries, and idempotent webhook handling.
- Test delivery using a separate bot, then change the live webhook once approved; one bot has one webhook destination.

### 7. Pilot, then expand
- Verify sign-up, recovery, wrong-role access, uploads, booking, payment confirmation, progress reports, and Telegram end-to-end.
- Add error monitoring, usage alerts, pagination/indexes, backup/restore procedures, and a release/rollback checklist.
- Pilot with a small approved group; review measured usage and costs after the first month.
- Later: learning materials/quizzes, automatic payments/payouts, referrals, and advanced reporting, each with agreed acceptance criteria.

## Technical approach
- Keep React, TypeScript, TanStack Start, and the current styling system; no frontend rewrite.
- Use a modular monolith with server functions for internal actions and server routes for auth/external webhooks. Keep business logic reusable between website and Telegram.
- Use PostgreSQL migrations and narrow repository interfaces; use an appropriate pooled/serverless driver for the chosen runtime.
- Keep database IDs/profile relationships independent of user-editable role information.
- Use S3-compatible storage interfaces and object keys rather than permanent vendor download URLs.
- Keep Node and Worker compatibility explicit; a provider change requires deployment, auth, and workflow tests, not just a new URL.
- Add targeted business-rule, permission, integration, and end-to-end tests; require reviewed changes and a staging check before release.

## Dependencies and approvals
- Your team owns the hosting, database, storage, and email accounts and approves any billing activation.
- Credentials are collected through protected secret entry, never chat, source code, or browser-exposed settings.
- We need a verified sending domain for trustworthy account emails; use a provider subdomain for the website initially if you want to postpone domain purchase.
- Before real family data: agree on safeguarding, consent, retention, tutor verification, booking/payment policies, and who can administer the platform.
- No live database cutover or Telegram webhook move until the staged checks pass and you approve the switch.