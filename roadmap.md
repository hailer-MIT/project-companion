
## Backlog
- [x] Prepare AgentCourier account email transport using its official outbound API, provider selection, failure checks, tests and DNS/host setup guide; preserve Resend compatibility and required email verification.
- [ ] Activate AgentCourier Free for brightpathtutors.de5.net — requires owner signup/approval, provider acceptance of this hostname, all five DNS checks with send_enabled=true, sender inbox and private sending key. Actual recipient delivery remains unverified.
- [x] Review and approve the low-cost stack and staged implementation plan.
- [x] Lock live admin endpoints, remove Telegram self-granted administration, and pause alerts to unverified legacy recipients; preserve sample dashboards.
- [x] Choose free host: Cloudflare Workers Free (Render Free + ping as backup); Workers build, health check, guide added.
- [x] Verify initial Workers/Neon deployment with a separate test bot — user confirms saved rows, working replies and 8 ms CPU time; authentication CPU remains unverified.
- [x] Step 4 account foundation: sign-in/signup/recovery screens, server-checked private account/admin pages, separate roles, invitation acceptance, additive account SQL, and denial tests. Public demo remains sample-only.
- [ ] Step 4 activation and verification: AgentCourier sending-domain verification is pending; owner must apply database/004-accounts.sql and configure deployed account secrets. First administrator, photo uploads, signed-in family/recovery/rate-limit checks and deployed password-hashing CPU remain unverified. External-host Neon account credential provisioning must be established before rollout.
- [ ] Back up and restore-test Neon records before the real pilot — requires owner-run export and isolated restore.
- [ ] Add private uploads and tutor approval — blocked by R2 account setup and document/safeguarding policies.
- [ ] Add real booking and manual payments/progress — blocked by the verified foundation and agreed cancellation/payment rules.
- [ ] Securely link Telegram to real accounts, run the pilot, and expand — blocked by verified account foundation and separate test bot.
- [x] Translate some homepage testimonials into Amharic (done Oct 16)
