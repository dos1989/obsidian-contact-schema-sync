import { describe, expect, it } from "vitest";
import { shouldAutoApplyNewContact } from "../../src/contacts/contact-create-policy";

describe("contact create policy", () => {
  it("disables auto apply entirely when master switch is off", () => {
    expect(
      shouldAutoApplyNewContact({
        autoApplyEnabled: false,
        blankOnly: true,
        isBlank: true
      })
    ).toEqual({ action: "ignore" });
  });

  it("auto applies blank notes when enabled and blank-only is on", () => {
    expect(
      shouldAutoApplyNewContact({
        autoApplyEnabled: true,
        blankOnly: true,
        isBlank: true
      })
    ).toEqual({ action: "auto-apply" });
  });

  it("queues non-blank notes when enabled and blank-only is on", () => {
    expect(
      shouldAutoApplyNewContact({
        autoApplyEnabled: true,
        blankOnly: true,
        isBlank: false
      })
    ).toEqual({ action: "queue-confirm" });
  });

  it("auto applies non-blank notes when blank-only is off", () => {
    expect(
      shouldAutoApplyNewContact({
        autoApplyEnabled: true,
        blankOnly: false,
        isBlank: false
      })
    ).toEqual({ action: "auto-apply" });
  });
});
