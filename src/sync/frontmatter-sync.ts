import type { ContactSchema, SyncMode } from "../types";

export function syncFrontmatter(
  current: Record<string, unknown>,
  schema: ContactSchema,
  mode: SyncMode
): {
  frontmatter: Record<string, unknown>;
  addedFields: string[];
  removedFields: string[];
  deprecatedFields: string[];
} {
  const working = { ...current };
  const addedFields: string[] = [];
  const removedFields: string[] = [];
  const deprecatedFields: string[] = [];
  const allFields = [...schema.frontmatter.required, ...schema.frontmatter.optional];
  const orderedSchemaKeys = allFields.map((field) => field.key);
  const allowedKeys = new Set(orderedSchemaKeys);

  for (const field of allFields) {
    if (!(field.key in working)) {
      working[field.key] = field.default;
      addedFields.push(field.key);
    }
  }

  for (const key of Object.keys(working)) {
    if (allowedKeys.has(key)) {
      continue;
    }

    if (mode === "full-sync") {
      delete working[key];
      removedFields.push(key);
    } else if (mode === "mark-deprecated") {
      deprecatedFields.push(key);
    }
  }

  const orderedFrontmatter: Record<string, unknown> = {};

  for (const key of orderedSchemaKeys) {
    if (key in working) {
      orderedFrontmatter[key] = working[key];
    }
  }

  for (const key of Object.keys(working)) {
    if (!allowedKeys.has(key)) {
      orderedFrontmatter[key] = working[key];
    }
  }

  return {
    frontmatter: orderedFrontmatter,
    addedFields,
    removedFields,
    deprecatedFields
  };
}
