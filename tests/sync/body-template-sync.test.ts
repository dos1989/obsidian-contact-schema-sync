import { describe, expect, it } from "vitest";
import { applyBodyTemplateSections, parseBodyTemplateSections } from "../../src/sync/body-template-sync";

const template = `# Family :

# Occupation :

# Recreation :

# Message :
`;

describe("parseBodyTemplateSections", () => {
  it("parses markdown headings into body template sections", () => {
    expect(parseBodyTemplateSections(template).map((section) => section.heading)).toEqual([
      "# Family :",
      "# Occupation :",
      "# Recreation :",
      "# Message :"
    ]);
  });
});

describe("applyBodyTemplateSections", () => {
  it("inserts missing template sections after title without markers", () => {
    const result = applyBodyTemplateSections("# Sample Contact\n", parseBodyTemplateSections(template));
    expect(result.body).toContain("# Family :");
    expect(result.body).not.toContain("<!-- body-template:");
    expect(result.addedSections).toEqual(["family", "occupation", "recreation", "message"]);
  });

  it("does not overwrite existing same-heading content", () => {
    const body = `# Sample Contact\n\n# Family :\nExisting text\n`;
    const result = applyBodyTemplateSections(body, parseBodyTemplateSections(template));
    expect(result.body).toContain("# Family :\nExisting text");
    expect(result.body.match(/# Family :/g)?.length).toBe(1);
  });

  it("inserts missing template sections after existing body content when title exists", () => {
    const body = `# Sample Contact\n\n# Family :\nExisting text\n\n# Recreation :\nStuff\n`;
    const result = applyBodyTemplateSections(body, parseBodyTemplateSections(template));
    expect(result.body).toContain("# Occupation :");
    expect(result.body).toContain("# Message :");
    expect(result.body).toContain("Existing text");
  });

  it("does not duplicate template headings when note has no title and already contains all template headings", () => {
    const body = `# Family :\n\n# Occupation :\n\n# Recreation :\n\n# Message :\n`;
    const result = applyBodyTemplateSections(body, parseBodyTemplateSections(template));
    expect(result.addedSections).toEqual([]);
    expect(result.body.match(/# Family :/g)?.length).toBe(1);
  });

  it("respects old markers if they already exist", () => {
    const body = `# Sample Contact\n\n<!-- body-template:family:start -->\n# Family :\n<!-- body-template:family:end -->\n`;
    const result = applyBodyTemplateSections(body, parseBodyTemplateSections(template));
    expect(result.body.match(/# Family :/g)?.length).toBe(1);
  });
});
