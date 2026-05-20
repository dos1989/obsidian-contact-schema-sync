import { describe, expect, it } from "vitest";
import { shouldAutoApplyNewBlankContact } from "../../src/contacts/new-contact-policy";

describe("shouldAutoApplyNewBlankContact", () => {
  it("returns true only when switch is on and note is blank", () => {
    expect(shouldAutoApplyNewBlankContact(true, true)).toBe(true);
    expect(shouldAutoApplyNewBlankContact(true, false)).toBe(false);
    expect(shouldAutoApplyNewBlankContact(false, true)).toBe(false);
  });
});
