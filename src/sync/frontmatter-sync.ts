import type { ContactSchema, FrontmatterDefaultValue, FrontmatterField, SyncMode } from "../types";

function coerceExistingValue(value: unknown, field: FrontmatterField): { value: unknown; changed: boolean } {
  if (field.type === "list") {
    if (Array.isArray(value)) {
      return { value, changed: false };
    }

    if (typeof value === "string") {
      if (value.trim() === "") {
        return { value: [], changed: true };
      }

      if (value.includes(",")) {
        return {
          value: value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
          changed: true
        };
      }
    }
  }

  return { value, changed: false };
}

function cloneDefaultValue(value: FrontmatterDefaultValue): FrontmatterDefaultValue {
  return Array.isArray(value) ? [...value] : value;
}

export function syncFrontmatter(
  current: Record<string, unknown>,
  schema: ContactSchema,
  mode: SyncMode
): {
  frontmatter: Record<string, unknown>;
  addedFields: string[];
  removedFields: string[];
  deprecatedFields: string[];
  coercedFields: string[];
} {
  const working = { ...current };
  const addedFields: string[] = [];
  const removedFields: string[] = [];
  const deprecatedFields: string[] = [];
  const coercedFields: string[] = [];
  const allFields = [...schema.frontmatter.required, ...schema.frontmatter.optional];
  const orderedSchemaKeys = allFields.map((field) => field.key);
  const allowedKeys = new Set(orderedSchemaKeys);

  for (const field of allFields) {
    if (!(field.key in working)) {
      working[field.key] = cloneDefaultValue(field.default);
      addedFields.push(field.key);
      continue;
    }

    const coerced = coerceExistingValue(working[field.key], field);
    working[field.key] = coerced.value;
    if (coerced.changed) {
      coercedFields.push(field.key);
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
    deprecatedFields,
    coercedFields
  };
}
