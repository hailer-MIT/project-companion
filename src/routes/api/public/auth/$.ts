import { createFileRoute } from "@tanstack/react-router";
async function handle({ request }: { request: Request }) {
  const { accountsConfigured, createAccounts } = await import("@/lib/accounts.server");
  if (!accountsConfigured()) return Response.json({ message: "Account sign-in is awaiting owner setup." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return createAccounts().handler(request);
}
export const Route = createFileRoute("/api/public/auth/$")({ server: { handlers: { GET: handle, POST: handle } } });