import { describe, expect, it } from "vitest";
import { requireLiveAdminAccess, telegramCanGrantAdmin } from "@/lib/admin-access";

describe("Pre-account administration lockdown", () => {
  it("denies access to live administration before verified sessions are configured", () => {
    expect(() => requireLiveAdminAccess()).toThrow("Live administration is unavailable");
  });

  it("never allows Telegram commands to grant administrator privileges", () => {
    expect(telegramCanGrantAdmin()).toBe(false);
  });
});