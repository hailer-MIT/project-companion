import { describe, expect, it } from "vitest";
import { assertAdmin, assertVerified, safeAccountRedirect } from "@/lib/account-policy";
describe("Portable account access", () => {
  it("denies private access without a verified email", () => { expect(() => assertVerified(null)).toThrow(); expect(() => assertVerified({ emailVerified: false })).toThrow(); expect(() => assertVerified({ emailVerified: true })).not.toThrow(); });
  it("keeps administrator permission separate from ordinary profiles", () => { expect(() => assertAdmin(["parent", "student", "tutor"])).toThrow(); expect(() => assertAdmin(["admin"])).not.toThrow(); });
  it("rejects external redirect destinations", () => { expect(safeAccountRedirect("https://evil.example")).toBe("/account"); expect(safeAccountRedirect("//evil.example")).toBe("/account"); expect(safeAccountRedirect("/admin")).toBe("/admin"); });
});