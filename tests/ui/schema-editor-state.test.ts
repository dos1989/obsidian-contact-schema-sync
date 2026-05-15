import { describe, expect, it } from "vitest";
import type { ContactSchema } from "../../src/types";
import {
  addFieldToDraft,
  cloneSchemaDraft,
  removeFieldFromDraft,
  serializeDefaultValue,
  serializeSchemaPreview
} from "../../src/ui/schema-editor-state";

const baseSchema: ContactSchema = {
  version: 1,
  noteType: "contact",
  frontmatter: {
    required: [{ key: "name", type: "string", default: "" }],
    optional: [{ key: "birthday", type: "date", default: "" }]
  },
  sections: []
};

describe("schema-editor-state", () => {
  it("clones schema into editable draft", () => {
    const draft = cloneSchemaDraft(baseSchema);
    expect(draft).toEqual(baseSchema);
    expect(draft).not.toBe(baseSchema);
    expect(draft.frontmatter.required).not.toBe(baseSchema.frontmatter.required);
  });

  it("adds a new required field with default starter values", () => {
    const draft = cloneSchemaDraft(baseSchema);
    addFieldToDraft(draft, "required");

    expect(draft.frontmatter.required.at(-1)).toEqual({
      key: "new_field",
      type: "string",
      default: ""
    });
  });

  it("uses array starter value for list fields", () => {
    const draft = cloneSchemaDraft(baseSchema);
    addFieldToDraft(draft, "optional", "list");

    expect(draft.frontmatter.optional.at(-1)).toEqual({
      key: "new_field",
      type: "list",
      default: []
    });
  });

  it("serializes list defaults as comma-separated text for editor input", () => {
    expect(serializeDefaultValue(["營養師", "Sales"])).toBe("營養師, Sales");
  });

  it("removes an optional field by index", () => {
    const draft = cloneSchemaDraft(baseSchema);
    removeFieldFromDraft(draft, "optional", 0);
    expect(draft.frontmatter.optional).toEqual([]);
  });

  it("serializes current draft into yaml preview", () => {
    const preview = serializeSchemaPreview(baseSchema);
    expect(preview).toContain("version: 1");
    expect(preview).toContain("noteType: contact");
    expect(preview).toContain("key: name");
  });
});
