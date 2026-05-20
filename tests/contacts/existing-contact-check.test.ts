import { describe, expect, it } from "vitest";
import { buildExistingContactsSummary } from "../../src/contacts/existing-contact-check";

describe("buildExistingContactsSummary", () => {
  it("returns null when no contacts need updates", () => {
    expect(buildExistingContactsSummary(0)).toBeNull();
  });

  it("returns one-shot summary message when contacts need updates", () => {
    expect(buildExistingContactsSummary(3)).toBe("偵測到 3 份 existing contacts 可更新，請手動按「預覽並同步 Contacts」。");
  });
});
