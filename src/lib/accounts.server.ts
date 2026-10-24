import { betterAuth } from "better-auth";
import { kyselyAdapter } from "better-auth/adapters/kysely-adapter";
import { accountSql, createAccountDatabase } from "./account-db.server";
import { assertAdmin, assertVerified } from "./account-policy";

export function accountsConfigured() {
  return Boolean(process.env["BETTER_AUTH_SECRET"] && process.env["BETTER_AUTH_URL"] && process.env["NEON_API_KEY"] && process.env["LOVABLE_API_KEY"] && process.env["RESEND_API_KEY"] && process.env["AUTH_EMAIL_FROM"]);
}

async function sendAccountEmail(to: string, url: string, reset: boolean) {
  const key = process.env["RESEND_API_KEY"];
  const apiKey = process.env["LOVABLE_API_KEY"];
  const from = process.env["AUTH_EMAIL_FROM"];
  if (!key || !apiKey || !from) throw new Error("Account emails are not configured.");
  const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: reset ? "Reset your Bright Path Tutors password" : "Confirm your Bright Path Tutors email", text: `${reset ? "Reset your password" : "Confirm your email"}: ${url}\n\nIf you did not request this, ignore this email.` }),
  });
  if (!response.ok) throw new Error(`Account email could not be sent (${response.status}).`);
}

export function createAccounts() {
  if (!accountsConfigured()) throw new Error("Account sign-in is awaiting owner setup.");
  const secret = process.env["BETTER_AUTH_SECRET"];
  const baseURL = process.env["BETTER_AUTH_URL"];
  if (!secret || secret.length < 32 || !baseURL) throw new Error("Account sign-in is awaiting valid owner setup.");
  return betterAuth({
    secret, baseURL, basePath: "/api/public/auth", trustedOrigins: [baseURL],
    database: kyselyAdapter(createAccountDatabase(), { type: "postgres", transaction: false }),
    user: { modelName: "bpt_user", changeEmail: { enabled: false } },
    session: { modelName: "bpt_session", cookieCache: { enabled: false } },
    account: { modelName: "bpt_account" },
    verification: { modelName: "bpt_verification" },
    emailAndPassword: { enabled: true, requireEmailVerification: true, minPasswordLength: 12, maxPasswordLength: 128, autoSignIn: false, sendResetPassword: async ({ user, url }) => sendAccountEmail(user.email, url, true), revokeSessionsOnPasswordReset: true },
    emailVerification: { sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: false, sendVerificationEmail: async ({ user, url }) => sendAccountEmail(user.email, url, false) },
    rateLimit: { enabled: true, storage: "database", modelName: "bpt_rate_limit", window: 60, max: 60, customRules: { "/sign-in/email": { window: 60, max: 5 }, "/sign-up/email": { window: 60, max: 3 }, "/request-password-reset": { window: 60, max: 3 } } },
    advanced: { useSecureCookies: baseURL.startsWith("https://"), database: { generateId: "uuid" }, defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" } },
  });
}

export async function readAccount(headers: Headers) {
  if (!accountsConfigured()) return null;
  const session = await createAccounts().api.getSession({ headers });
  if (!session) return null;
  const result = await accountSql("select role from public.bpt_roles where user_id=$1 limit 10", [session.user.id]);
  return { user: { id: session.user.id, name: session.user.name, email: session.user.email, emailVerified: session.user.emailVerified }, roles: result.rows.map((r) => String(r.role)) };
}
export async function requireAccount(headers: Headers, admin = false) {
  const account = await readAccount(headers);
  assertVerified(account?.user);
  if (!account) throw new Error("Sign in to continue.");
  if (admin) assertAdmin(account.roles);
  return account;
}