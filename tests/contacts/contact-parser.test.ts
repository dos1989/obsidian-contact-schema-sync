import { describe, expect, it } from "vitest";
import { parseContactNote } from "../../src/contacts/contact-parser";

const input = `---
name: Alice Chan
relationship: Friend
---

# Alice Chan

<!-- schema:basic-info:start -->
## Basic Info
- Name:
<!-- schema:basic-info:end -->
`;

describe("parseContactNote", () => {
  it("extracts frontmatter and body", () => {
    const parsed = parseContactNote("Contacts/Alice Chan.md", input);
    expect(parsed.frontmatter.name).toBe("Alice Chan");
    expect(parsed.body).toContain("# Alice Chan");
  });

  it("finds managed schema markers", () => {
    const parsed = parseContactNote("Contacts/Alice Chan.md", input);
    expect(parsed.markers.map((marker) => marker.id)).toEqual(["basic-info"]);
  });
});
