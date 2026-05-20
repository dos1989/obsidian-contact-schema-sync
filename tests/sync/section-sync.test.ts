import { describe, expect, it } from "vitest";
import { syncSections } from "../../src/sync/section-sync";
import type { ContactSchema } from "../../src/types";

const schema: ContactSchema = {
  version: 1,
  noteType: "contact",
  frontmatter: { required: [], optional: [] },
  sections: [
    { id: "basic-info", heading: "Basic Info", level: 2, managed: true, template: "- Name:" },
    { id: "personal-notes", heading: "Personal Notes", level: 2, managed: false, template: "" }
  ]
};

describe("syncSections", () => {
  it("inserts missing schema sections immediately after title", () => {
    const result = syncSections("# Sample Contact\n\n# Family :\n", schema, "add-only");
    expect(result.body).toContain("# Sample Contact\n\n<!-- schema:basic-info:start -->");
    expect(result.body.indexOf("<!-- schema:basic-info:start -->")).toBeLessThan(result.body.indexOf("# Family :"));
    expect(result.addedSections).toEqual(["basic-info", "personal-notes"]);
  });

  it("replaces managed section content", () => {
    const body = `# Sample Contact\n\n<!-- schema:basic-info:start -->\n## Basic Info\nold\n<!-- schema:basic-info:end -->\n`;
    const result = syncSections(body, schema, "add-only");
    expect(result.body).toContain("- Name:");
    expect(result.updatedSections).toEqual(["basic-info"]);
  });

  it("keeps legacy headings after managed sections", () => {
    const body = `# Sample Contact\n\n# Family :\n\n# Occupation :\n`;
    const result = syncSections(body, schema, "add-only");
    expect(result.body.indexOf("# Family :")).toBeGreaterThan(result.body.indexOf("<!-- schema:personal-notes:end -->"));
  });
});
