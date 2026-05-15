import YAML from "yaml";
import type { ContactSchema, FrontmatterDefaultValue, FrontmatterField } from "../types";

export type FieldGroup = "required" | "optional";

export function cloneSchemaDraft(schema: ContactSchema): ContactSchema {
  return {
    ...schema,
    frontmatter: {
      required: schema.frontmatter.required.map((field) => ({
        ...field,
        default: Array.isArray(field.default) ? [...field.default] : field.default
      })),
      optional: schema.frontmatter.optional.map((field) => ({
        ...field,
        default: Array.isArray(field.default) ? [...field.default] : field.default
      }))
    },
    sections: schema.sections.map((section) => ({ ...section }))
  };
}

function buildStarterDefault(type: FrontmatterField["type"]): FrontmatterDefaultValue {
  switch (type) {
    case "list":
      return [];
    case "number":
      return 0;
    case "boolean":
      return false;
    case "string":
    case "date":
    default:
      return "";
  }
}

export function addFieldToDraft(
  draft: ContactSchema,
  group: FieldGroup,
  type: FrontmatterField["type"] = "string"
): void {
  const field: FrontmatterField = {
    key: "new_field",
    type,
    default: buildStarterDefault(type)
  };

  draft.frontmatter[group].push(field);
}

export function removeFieldFromDraft(draft: ContactSchema, group: FieldGroup, index: number): void {
  draft.frontmatter[group].splice(index, 1);
}

export function serializeDefaultValue(value: FrontmatterDefaultValue): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

export function parseDefaultValue(
  rawValue: string,
  type: FrontmatterField["type"]
): FrontmatterDefaultValue {
  switch (type) {
    case "list":
      return rawValue
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    case "number": {
      const parsed = Number(rawValue);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    case "boolean":
      return rawValue.trim().toLowerCase() === "true";
    case "string":
    case "date":
    default:
      return rawValue;
  }
}

export function serializeSchemaPreview(schema: ContactSchema): string {
  return YAML.stringify(schema);
}
