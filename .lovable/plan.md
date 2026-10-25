# Next steps: turn on account emails with AgentCourier

## Part 1 — You: add the 5 records at my.dnshe.com
Open your domain brightpathtutors.de5.net, go to DNS records, and add each one with **Add record**. In the Host/Name field, DNSHE usually wants only the part before your domain. If it shows the domain already, enter just the short part below.

| # | Type | Host / Name | Value | Priority |
|---|------|-------------|-------|----------|
| 1 | MX | `@` (blank or the domain itself) | `mx1.apimail.cc` | 10 |
| 2 | TXT | `_apimail-verify` | `apimail-verify=023d5486...e520` (copy the full text from AgentCourier) | – |
| 3 | TXT | `@` | `v=spf1 include:spf.apimail.cc -all` | – |
| 4 | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@apimail.cc` | – |
| 5 | TXT | `om1._domainkey` | the long `v=DKIM1; k=rsa; p=MIIB...IDAQAB` text, copied in one piece with no spaces or line breaks | – |

Tips:
- Copy the values from AgentCourier's copy buttons, not by retyping them.
- Look for an existing TXT record starting with `v=spf1`. If there is one, don't add a second one. Tell me and we'll combine them.
- Leave the TTL at its default.
- Check that each record saved. Some DNS sites cut off the long DKIM value.

## Part 2 — You: verify in AgentCourier
1. Wait 10–30 minutes. It can take a few hours.
2. Click **Verify** on the domain. All 5 checks must pass, and **sending enabled** must show as on.
3. Create the sender inbox `accounts@brightpathtutors.de5.net`.
4. Check that your API key has **send** permission.

## Part 3 — You: Cloudflare settings
Go to your Worker, then **Settings → Variables and Secrets**, and add:
- `AGENTCOURIER_API_KEY` (Secret)
- `AUTH_EMAIL_PROVIDER` = `agentcourier`
- `AUTH_EMAIL_FROM` = `accounts@brightpathtutors.de5.net`
- `BETTER_AUTH_URL` = `https://bright-path-tutors-normal.hailomasegede.workers.dev`
- `BETTER_AUTH_SECRET` (Secret, a random password of at least 32 characters)

Never paste these values into the chat.

## Part 4 — Me: make sign-in work on Cloudflare
Right now, accounts reach Neon only through Lovable's own connection, and that connection doesn't reach Cloudflare. I will:
- Let the sign-in system use your existing `DATABASE_URL` when it is set, and Lovable's connection otherwise.
- Stop the "accounts configured" check from requiring Lovable-only keys when `DATABASE_URL` is set.
- Add tests that pick the right database for each setup, and update the deployment guide.

## Part 5 — You and me together: switch on and test
1. Back up Neon (create a branch), then run `database/004-accounts.sql` in the SQL Editor.
2. Redeploy on Cloudflare.
3. Sign up with your own email and check that the confirmation email arrives (look in Spam too). Then test sign-in, password reset and sign-out.
4. Do the first-administrator step for your own account only.
5. Check that sign-in requests stay within Cloudflare's free CPU limit. If they don't, we switch to Render without weakening passwords.

## Technical details
- Add a Neon serverless (`@neondatabase/serverless`) Kysely dialect path in `src/lib/account-db.server.ts`, chosen when `DATABASE_URL` is present. Keep `transaction: false` and keep the SQL triggers that make related writes all-or-nothing.
- Change `accountsConfigured()` to need (DATABASE_URL or NEON_API_KEY+LOVABLE_API_KEY), plus the auth secrets and `accountEmailConfigured()`.
- Update the AGENTS.md rule about account database transport, and DEPLOY.md section C.
