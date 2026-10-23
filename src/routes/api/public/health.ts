import { createFileRoute } from "@tanstack/react-router";

// Lightweight uptime check (used by keep-alive pings on the Render fallback). Returns no private data.
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        }),
    },
  },
});
