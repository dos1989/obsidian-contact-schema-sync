import { describe, expect, it } from "vitest";
import { syncFrontmatter } from "../../src/sync/frontmatter-sync";
import type { ContactSchema } from "../../src/types";

const schema: ContactSchema = {
  version: 1,
  noteType: "contact",
  frontmatter: {
    required: [
      { key: "name", type: "string", default: "" },
      { key: "relationship", type: "string", default: "" }
    ],
    optional: [{ key: "birthday", type: "date", default: "" }]
  },
  sections: []
};

describe("syncFrontmatter", () => {
  it("adds missing schema keys", () => {
    const result = syncFrontmatter({ name: "Alice" }, schema, "add-only");
    expect(result.frontmatter).toEqual({ name: "Alice", relationship: "", birthday: "" });
    expect(result.addedFields).toEqual(["relationship", "birthday"]);
  });

  it("orders schema keys before legacy keys", () => {
    const result = syncFrontmatter(
      { aliases: null, relationship: "Friend", name: "Alice", Gender: "F" },
      schema,
      "add-only"
    );

    expect(Object.keys(result.frontmatter)).toEqual(["name", "relationship", "birthday", "aliases", "Gender"]);
  });

  it("removes unknown keys in full-sync mode", () => {
    const result = syncFrontmatter({ name: "Alice", legacy: "x" }, schema, "full-sync");
    expect(result.frontmatter.legacy).toBeUndefined();
    expect(result.removedFields).toEqual(["legacy"]);
  });

  it("marks unknown keys as deprecated in mark-deprecated mode", () => {
    const result = syncFrontmatter({ name: "Alice", legacy: "x" }, schema, "mark-deprecated");
    expect(result.frontmatter.legacy).toBe("x");
    expect(result.deprecatedFields).toEqual(["legacy"]);
  });
});
