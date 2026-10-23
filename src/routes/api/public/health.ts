import { createFileRoute } from "@tanstack/react-router";
import { dbKind, pingDb } from "@/lib/store.server";

// Uptime check (also used by keep-alive pings on Render). Reports only yes/no status, never secrets.
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const kind = dbKind();
        const database = kind === "none" ? "demo-mode" : (await pingDb()) ? "ok" : "unreachable";
        return new Response(JSON.stringify({ ok: true, database }), {
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        });
      },
    },
  },
});
