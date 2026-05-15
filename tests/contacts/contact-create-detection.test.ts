import { describe, expect, it } from "vitest";
import { isBlankContactNoteContent, isPathInsideContactsFolder } from "../../src/contacts/contact-create-detection";

describe("contact create detection", () => {
  it("recognizes notes inside contacts folder", () => {
    expect(isPathInsideContactsFolder("Contacts/Alice.md", "Contacts")).toBe(true);
    expect(isPathInsideContactsFolder("Notes/Alice.md", "Contacts")).toBe(false);
  });

  it("treats empty or whitespace-only note as blank", () => {
    expect(isBlankContactNoteContent("")).toBe(true);
    expect(isBlankContactNoteContent("\n\n  ")).toBe(true);
  });

  it("treats notes with actual content as non-blank", () => {
    expect(isBlankContactNoteContent("# Alice")).toBe(false);
    expect(isBlankContactNoteContent("hello")).toBe(false);
  });
});
