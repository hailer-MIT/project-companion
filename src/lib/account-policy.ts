export const accountRoles = ["parent", "student", "tutor", "admin"] as const;
export type AccountRole = (typeof accountRoles)[number];
export function assertVerified(user: { emailVerified: boolean } | null | undefined) {
  if (!user?.emailVerified) throw new Error("Sign in with a confirmed email to continue.");
}
export function assertAdmin(roles: readonly string[]) {
  if (!roles.includes("admin")) throw new Error("Administrator access required.");
}
export function safeAccountRedirect(value: unknown): "/account" | "/admin" {
  return value === "/admin" ? "/admin" : "/account";
}