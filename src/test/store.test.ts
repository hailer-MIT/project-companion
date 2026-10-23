import { afterEach, describe, expect, it, vi } from "vitest";
import { dbKind } from "@/lib/store.server";

afterEach(() => vi.unstubAllEnvs());

describe("database choice", () => {
  it("uses Neon when DATABASE_URL is set, even if the Cloud database is also configured", () => {
    vi.stubEnv("DATABASE_URL", "postgres://x");
    vi.stubEnv("SUPABASE_URL", "https://x");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    expect(dbKind()).toBe("neon");
  });
  it("uses the Cloud database when only it is configured", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("SUPABASE_URL", "https://x");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    expect(dbKind()).toBe("cloud");
  });
  it("falls back to demo mode with no database", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(dbKind()).toBe("none");
  });
});
