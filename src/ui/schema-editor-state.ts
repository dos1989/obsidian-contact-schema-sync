import YAML from "yaml";
import type { ContactSchema, FrontmatterField } from "../types";

export type FieldGroup = "required" | "optional";

export function cloneSchemaDraft(schema: ContactSchema): ContactSchema {
  return {
    ...schema,
    frontmatter: {
      required: schema.frontmatter.required.map((field) => ({ ...field })),
      optional: schema.frontmatter.optional.map((field) => ({ ...field }))
    },
    sections: schema.sections.map((section) => ({ ...section }))
  };
}

export function addFieldToDraft(draft: ContactSchema, group: FieldGroup): void {
  const field: FrontmatterField = {
    key: "new_field",
    type: "string",
    default: ""
  };

  draft.frontmatter[group].push(field);
}

export function removeFieldFromDraft(draft: ContactSchema, group: FieldGroup, index: number): void {
  draft.frontmatter[group].splice(index, 1);
}

export function serializeSchemaPreview(schema: ContactSchema): string {
  return YAML.stringify(schema);
}
