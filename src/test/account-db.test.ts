import { afterEach, describe, expect, it, vi } from "vitest";
import { accountDbConfigured } from "@/lib/account-db.server";

afterEach(() => vi.unstubAllEnvs());

describe("account database selection", () => {
  it("is configured on external hosts with only DATABASE_URL", () => {
    vi.stubEnv("LOVABLE_API_KEY", ""); vi.stubEnv("NEON_API_KEY", "");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@ep-x.neon.tech/db");
    expect(accountDbConfigured()).toBe(true);
  });
  it("is configured through the Lovable connection when both keys exist", () => {
    vi.stubEnv("DATABASE_URL", ""); vi.stubEnv("LOVABLE_API_KEY", "a"); vi.stubEnv("NEON_API_KEY", "b");
    expect(accountDbConfigured()).toBe(true);
  });
  it("stays closed with no database settings", () => {
    vi.stubEnv("DATABASE_URL", ""); vi.stubEnv("LOVABLE_API_KEY", ""); vi.stubEnv("NEON_API_KEY", "");
    expect(accountDbConfigured()).toBe(false);
  });
});
