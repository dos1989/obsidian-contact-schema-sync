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
  const next = { ...current };
  const addedFields: string[] = [];
  const removedFields: string[] = [];
  const deprecatedFields: string[] = [];
  const allFields = [...schema.frontmatter.required, ...schema.frontmatter.optional];
  const allowedKeys = new Set(allFields.map((field) => field.key));

  for (const field of allFields) {
    if (!(field.key in next)) {
      next[field.key] = field.default;
      addedFields.push(field.key);
    }
  }

  for (const key of Object.keys(next)) {
    if (allowedKeys.has(key)) {
      continue;
    }

    if (mode === "full-sync") {
      delete next[key];
      removedFields.push(key);
    } else if (mode === "mark-deprecated") {
      deprecatedFields.push(key);
    }
  }

  return { frontmatter: next, addedFields, removedFields, deprecatedFields };
}
