import { describe, expect, it } from "vitest";
import { canApproveStatement, canEditStatement } from "../../src/lib/statements";
describe("kebijakan statement", () => {
  const issue = { ownerId: "u1", assigneeId: "u2" };
  it("membatasi contributor pada isu milik atau tugasnya", () => {
    expect(canEditStatement({ id: "u1", roles: ["CONTRIBUTOR"] }, issue)).toBe(true);
    expect(canEditStatement({ id: "u3", roles: ["CONTRIBUTOR"] }, issue)).toBe(false);
    expect(canEditStatement({ id: "u3", roles: ["EDITOR"] }, issue)).toBe(true);
  });
  it("hanya role Approver yang dapat menyetujui, termasuk karya sendiri", () => {
    expect(canApproveStatement({ id: "u1", roles: ["APPROVER", "CONTRIBUTOR"] })).toBe(true);
    expect(canApproveStatement({ id: "u1", roles: ["EDITOR"] })).toBe(false);
  });
});
