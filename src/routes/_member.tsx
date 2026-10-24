import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccountState } from "@/lib/account.functions";
import { safeAccountRedirect } from "@/lib/account-policy";
// Portable Better Auth gate, distinct from the integration-managed Cloud Auth layout.
export const Route = createFileRoute("/_member")({
  beforeLoad: async ({ location }) => {
    const state = await getAccountState();
    if (!state.account?.user.emailVerified) throw redirect({ to: "/auth", search: { redirect: safeAccountRedirect(location.pathname) } });
    return { account: state.account };
  }, component: () => <Outlet />,
});