import { describe, expect, it } from "vitest";
import { buildSyncPreview } from "../../src/sync/sync-engine";
import type { ContactSchema } from "../../src/types";

const schema: ContactSchema = {
  version: 1,
  noteType: "contact",
  frontmatter: {
    required: [{ key: "name", type: "string", default: "" }],
    optional: [{ key: "Tags", type: "list", default: [] }]
  },
  sections: []
};

describe("buildSyncPreview", () => {
  it("returns changed summary for a note missing fields and body template headings", () => {
    const report = buildSyncPreview(
      [{ path: "Contacts/Alice.md", fileName: "Alice.md", frontmatter: { name: "Alice" }, body: "# Alice\n", markers: [] }],
      schema,
      "add-only",
      "# Family :\n\n# Message :\n"
    );

    expect(report.total).toBe(1);
    expect(report.updated).toBe(1);
    expect(report.notes[0].addedFields).toEqual(["Tags"]);
    expect(report.notes[0].addedSections).toEqual(["family", "message"]);
  });

  it("marks preview as changed when field type coercion happens", () => {
    const report = buildSyncPreview(
      [{ path: "Contacts/Alice.md", fileName: "Alice.md", frontmatter: { name: "Alice", Tags: "營養師, Sales" }, body: "# Alice\n", markers: [] }],
      schema,
      "add-only",
      ""
    );

    expect(report.updated).toBe(1);
    expect(report.notes[0].changed).toBe(true);
    expect(report.notes[0].coercedFields).toEqual(["Tags"]);
  });
});
