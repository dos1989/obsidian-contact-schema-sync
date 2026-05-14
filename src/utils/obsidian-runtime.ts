export function isTFileLike(value: unknown): value is {
  path: string;
  basename: string;
  extension: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "path" in value &&
    typeof value.path === "string" &&
    "basename" in value &&
    typeof value.basename === "string" &&
    "extension" in value &&
    typeof value.extension === "string"
  );
}

export function isTFolderLike(value: unknown): value is {
  path: string;
  name: string;
  children: unknown[];
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "path" in value &&
    typeof value.path === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "children" in value &&
    Array.isArray(value.children)
  );
}
