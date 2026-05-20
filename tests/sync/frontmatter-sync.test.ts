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
    const result = syncFrontmatter({ name: "Sample Contact" }, schema, "add-only");
    expect(result.frontmatter).toEqual({ name: "Sample Contact", relationship: "", birthday: "" });
    expect(result.addedFields).toEqual(["relationship", "birthday"]);
  });

  it("uses array defaults for list fields", () => {
    const listSchema: ContactSchema = {
      ...schema,
      frontmatter: {
        required: [...schema.frontmatter.required],
        optional: [{ key: "Tags", type: "list", default: [] }]
      }
    };

    const result = syncFrontmatter({ name: "Sample Contact", relationship: "Friend" }, listSchema, "add-only");
    expect(result.frontmatter.Tags).toEqual([]);
    expect(Array.isArray(result.frontmatter.Tags)).toBe(true);
  });

  it("conservatively migrates empty string to empty list", () => {
    const listSchema: ContactSchema = {
      ...schema,
      frontmatter: {
        required: [...schema.frontmatter.required],
        optional: [{ key: "Tags", type: "list", default: [] }]
      }
    };

    const result = syncFrontmatter(
      { name: "Sample Contact", relationship: "Friend", Tags: "" },
      listSchema,
      "add-only"
    );

    expect(result.frontmatter.Tags).toEqual([]);
  });

  it("conservatively migrates comma-separated string to list", () => {
    const listSchema: ContactSchema = {
      ...schema,
      frontmatter: {
        required: [...schema.frontmatter.required],
        optional: [{ key: "Tags", type: "list", default: [] }]
      }
    };

    const result = syncFrontmatter(
      { name: "Sample Contact", relationship: "Friend", Tags: "營養師, Sales" },
      listSchema,
      "add-only"
    );

    expect(result.frontmatter.Tags).toEqual(["營養師", "Sales"]);
  });

  it("orders schema keys before legacy keys", () => {
    const result = syncFrontmatter(
      { aliases: null, relationship: "Friend", name: "Sample Contact", Gender: "F" },
      schema,
      "add-only"
    );

    expect(Object.keys(result.frontmatter)).toEqual(["name", "relationship", "birthday", "aliases", "Gender"]);
  });

  it("removes unknown keys in full-sync mode", () => {
    const result = syncFrontmatter({ name: "Sample Contact", legacy: "x" }, schema, "full-sync");
    expect(result.frontmatter.legacy).toBeUndefined();
    expect(result.removedFields).toEqual(["legacy"]);
  });

  it("marks unknown keys as deprecated in mark-deprecated mode", () => {
    const result = syncFrontmatter({ name: "Sample Contact", legacy: "x" }, schema, "mark-deprecated");
    expect(result.frontmatter.legacy).toBe("x");
    expect(result.deprecatedFields).toEqual(["legacy"]);
  });
});
