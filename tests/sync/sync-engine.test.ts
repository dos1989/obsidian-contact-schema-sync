import { describe, expect, it } from "vitest";
import { buildSyncPreview } from "../../src/sync/sync-engine";
import type { ContactSchema } from "../../src/types";

const schema: ContactSchema = {
  version: 1,
  noteType: "contact",
  frontmatter: {
    required: [{ key: "name", type: "string", default: "" }],
    optional: [{ key: "birthday", type: "date", default: "" }]
  },
  sections: [{ id: "basic-info", heading: "Basic Info", level: 2, managed: true, template: "- Name:" }]
};

describe("buildSyncPreview", () => {
  it("returns changed summary for a note missing fields and sections", () => {
    const report = buildSyncPreview(
      [{ path: "Contacts/Alice.md", fileName: "Alice.md", frontmatter: { name: "Alice" }, body: "# Alice\n", markers: [] }],
      schema,
      "add-only"
    );

    expect(report.total).toBe(1);
    expect(report.updated).toBe(1);
    expect(report.notes[0].addedFields).toEqual(["birthday"]);
    expect(report.notes[0].addedSections).toEqual(["basic-info"]);
  });
});
