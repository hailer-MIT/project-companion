import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const chain = {
      inputValidator: () => chain,
      handler: (handler: (context: { data: unknown }) => unknown) => handler,
    };
    return chain;
  },
}));

import { listApplications, setApplicationStatus } from "@/lib/applications.functions";
import { listTelegramChats, sendDemoNotification, listBotRequests, resolveBotRequest } from "@/lib/telegram.functions";

describe("Every live admin server boundary fails closed", () => {
  const handlers = [
    ["application listing", listApplications],
    ["application approval", setApplicationStatus],
    ["Telegram chat listing", listTelegramChats],
    ["outgoing Telegram notification", sendDemoNotification],
    ["Telegram request listing", listBotRequests],
    ["Telegram request resolution", resolveBotRequest],
  ] as const;

  it.each(handlers)("denies %s before any private access", async (_name, handler) => {
    const invoke = handler as unknown as (context: { data: unknown }) => Promise<unknown>;
    await expect(invoke({ data: {} })).rejects.toThrow("Live administration is unavailable");
  });
});