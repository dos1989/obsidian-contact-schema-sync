import type { ContactSchema } from "../types";

export function validateSchema(schema: ContactSchema): ContactSchema {
  const fieldKeys = [...schema.frontmatter.required, ...schema.frontmatter.optional].map((field) => field.key);
  const seenFields = new Set<string>();

  for (const key of fieldKeys) {
    if (seenFields.has(key)) {
      throw new Error(`Duplicate frontmatter field key: ${key}`);
    }
    seenFields.add(key);
  }

  const seenSections = new Set<string>();
  for (const section of schema.sections) {
    if (seenSections.has(section.id)) {
      throw new Error(`Duplicate section id: ${section.id}`);
    }
    seenSections.add(section.id);
  }

  return schema;
}
