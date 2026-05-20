import { describe, expect, it } from "vitest";
import {
  buildStartupBaseline,
  enqueuePendingContact,
  isTrueNewContactFile,
  takePendingContacts
} from "../../src/contacts/contact-create-queue";

describe("contact create queue helpers", () => {
  it("builds startup baseline set from existing paths", () => {
    const baseline = buildStartupBaseline(["Contacts/Alice.md", "Contacts/Bob.md"]);
    expect(baseline.has("Contacts/Alice.md")).toBe(true);
    expect(baseline.has("Contacts/Bob.md")).toBe(true);
  });

  it("detects only true new contact files outside baseline", () => {
    const baseline = buildStartupBaseline(["Contacts/Alice.md"]);
    expect(isTrueNewContactFile("Contacts/Bob.md", baseline)).toBe(true);
    expect(isTrueNewContactFile("Contacts/Alice.md", baseline)).toBe(false);
  });

  it("queues pending contacts without duplicates and drains them in order", () => {
    const pending = new Map<string, string>();
    enqueuePendingContact(pending, "Contacts/Bob.md", "# Bob");
    enqueuePendingContact(pending, "Contacts/Bob.md", "# Bob");
    enqueuePendingContact(pending, "Contacts/Carol.md", "# Carol");

    expect(Array.from(pending.keys())).toEqual(["Contacts/Bob.md", "Contacts/Carol.md"]);
    expect(takePendingContacts(pending)).toEqual([
      { path: "Contacts/Bob.md", content: "# Bob" },
      { path: "Contacts/Carol.md", content: "# Carol" }
    ]);
    expect(pending.size).toBe(0);
  });
});
