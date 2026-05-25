import { describe, expect, it } from "vitest";
import { getAffectedFileNames } from "../../src/ui/sync-preview-summary";

describe("getAffectedFileNames", () => {
  it("returns only changed file basenames", () => {
    const result = getAffectedFileNames([
      { path: "Contacts/Alice.md", changed: true },
      { path: "Contacts/Bob.md", changed: false },
      { path: "Contacts/Nested/Carol.md", changed: true }
    ]);

    expect(result).toEqual(["Alice.md", "Carol.md"]);
  });
});
