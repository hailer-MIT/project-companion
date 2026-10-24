import { afterEach, describe, expect, it, vi } from "vitest";
import { accountEmailConfigured, sendAccountEmail } from "@/lib/account-email.server";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function configure() {
  vi.stubEnv("AUTH_EMAIL_PROVIDER", "agentcourier");
  vi.stubEnv("AGENTCOURIER_API_KEY", "test-only-key");
  vi.stubEnv("AUTH_EMAIL_FROM", "accounts@brightpathtutors.de5.net");
}
describe("AgentCourier account email transport", () => {
  it("uses the documented send API for verification and recovery without Resend", async () => {
    configure(); vi.stubEnv("RESEND_API_KEY", ""); vi.stubEnv("LOVABLE_API_KEY", "");
    expect(accountEmailConfigured()).toBe(true);
    const request = vi.fn().mockResolvedValue(Response.json({ status: "queued" }, { status: 201 }));
    vi.stubGlobal("fetch", request);
    await sendAccountEmail("test@example.test", "https://example.test/verify?token=fake", false);
    await sendAccountEmail("test@example.test", "https://example.test/reset?token=fake", true);
    expect(request).toHaveBeenCalledTimes(2);
    const [endpoint, options] = request.mock.calls[0];
    expect(endpoint).toBe("https://api.apimail.cc/v1/messages/send");
    expect(options.headers["X-API-Key"]).toBe("test-only-key");
    const body = JSON.parse(options.body);
    expect(body.from).toBe("accounts@brightpathtutors.de5.net");
    expect(body.to).toEqual(["test@example.test"]);
    expect(body.body_text).toContain("https://example.test/verify?token=fake");
    expect(JSON.parse(request.mock.calls[1][1].body).body_text).toContain("https://example.test/reset?token=fake");
  });
  it("fails closed without the selected provider key even when Resend is present", async () => {
    configure(); vi.stubEnv("AGENTCOURIER_API_KEY", ""); vi.stubEnv("RESEND_API_KEY", "test-only-other-key");
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    expect(accountEmailConfigured()).toBe(false);
    await expect(sendAccountEmail("test@example.test", "https://example.test", false)).rejects.toThrow("not configured");
    expect(request).not.toHaveBeenCalled();
  });
  it("rejects unsupported providers", () => {
    configure(); vi.stubEnv("AUTH_EMAIL_PROVIDER", "unknown");
    expect(accountEmailConfigured()).toBe(false);
  });
  it("rejects failed or bounced jobs even on successful HTTP responses", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "failed" }, { status: 201 })));
    await expect(sendAccountEmail("test@example.test", "https://example.test", true)).rejects.toThrow("not accepted");
  });
  it("surfaces provider status without exposing echoed sensitive data or retrying", async () => {
    configure(); const request = vi.fn().mockResolvedValue(new Response("echoed-sensitive-token", { status: 403 }));
    vi.stubGlobal("fetch", request);
    const failure = await sendAccountEmail("test@example.test", "https://example.test", false).catch((error: Error) => error);
    expect(failure).toBeInstanceOf(Error);
    expect(String(failure)).toContain("403");
    expect(String(failure)).not.toContain("echoed-sensitive-token");
    expect(request).toHaveBeenCalledTimes(1);
  });
});