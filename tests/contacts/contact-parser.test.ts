import { describe, expect, it } from "vitest";
import { parseContactNote } from "../../src/contacts/contact-parser";

const input = `---
name: Sample Contact
relationship: Friend
---

# Sample Contact

<!-- schema:basic-info:start -->
## Basic Info
- Name:
<!-- schema:basic-info:end -->
`;

describe("parseContactNote", () => {
  it("extracts frontmatter and body", () => {
    const parsed = parseContactNote("Contacts/Sample Contact.md", input);
    expect(parsed.frontmatter.name).toBe("Sample Contact");
    expect(parsed.body).toContain("# Sample Contact");
  });

  it("finds managed schema markers", () => {
    const parsed = parseContactNote("Contacts/Sample Contact.md", input);
    expect(parsed.markers.map((marker) => marker.id)).toEqual(["basic-info"]);
  });
});
