# Bright Path Tutors: low-cost foundation and staged implementation

## Goal
Keep the current website and demo behaviour while building a secure, portable tutoring service. Prefer free or inexpensive services during the first one or two months, then upgrade measured bottlenecks rather than replacing the whole system.

## Scope of this plan
This is a proposed implementation sequence, not a migration already performed. Provider pricing and the hosting recommendation will be finalized against current official sources before this plan is presented. No hosting account, payment, live bot switch, or production data change happens merely by reviewing the plan.

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