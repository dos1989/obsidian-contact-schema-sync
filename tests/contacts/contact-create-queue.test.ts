import { describe, expect, it } from "vitest";
import {
  buildStartupBaseline,
  enqueuePendingContact,
  isTrueNewContactFile,
  takePendingContacts
} from "../../src/contacts/contact-create-queue";

describe("contact create queue helpers", () => {
  it("builds startup baseline set from existing paths", () => {
    const baseline = buildStartupBaseline(["Contacts/Sample One.md", "Contacts/Sample Two.md"]);
    expect(baseline.has("Contacts/Sample One.md")).toBe(true);
    expect(baseline.has("Contacts/Sample Two.md")).toBe(true);
  });

  it("detects only true new contact files outside baseline", () => {
    const baseline = buildStartupBaseline(["Contacts/Sample One.md"]);
    expect(isTrueNewContactFile("Contacts/Sample Two.md", baseline)).toBe(true);
    expect(isTrueNewContactFile("Contacts/Sample One.md", baseline)).toBe(false);
  });

  it("queues pending contacts without duplicates and drains them in order", () => {
    const pending = new Map<string, string>();
    enqueuePendingContact(pending, "Contacts/Sample One.md", "# Sample One");
    enqueuePendingContact(pending, "Contacts/Sample One.md", "# Sample One");
    enqueuePendingContact(pending, "Contacts/Sample Two.md", "# Sample Two");

    expect(Array.from(pending.keys())).toEqual(["Contacts/Sample One.md", "Contacts/Sample Two.md"]);
    expect(takePendingContacts(pending)).toEqual([
      { path: "Contacts/Sample One.md", content: "# Sample One" },
      { path: "Contacts/Sample Two.md", content: "# Sample Two" }
    ]);
    expect(pending.size).toBe(0);
  });
});
