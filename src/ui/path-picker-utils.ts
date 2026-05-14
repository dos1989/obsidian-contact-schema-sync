export interface SelectablePath {
  path: string;
  type: "file" | "folder";
}

export interface PickerFilterOptions {
  mode: "file" | "folder";
  allowedExtensions?: string[];
}

export function filterSelectablePaths(items: SelectablePath[], options: PickerFilterOptions): SelectablePath[] {
  if (options.mode === "folder") {
    return items.filter((item) => item.type === "folder");
  }

  const allowed = new Set((options.allowedExtensions ?? []).map((ext) => ext.toLowerCase()));

  return items.filter((item) => {
    if (item.type !== "file") {
      return false;
    }

    if (allowed.size === 0) {
      return true;
    }

    const extension = item.path.split(".").pop()?.toLowerCase() ?? "";
    return allowed.has(extension);
  });
}

export function sortSelectablePaths(items: SelectablePath[]): SelectablePath[] {
  return [...items].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "folder" ? -1 : 1;
    }

    return left.path.localeCompare(right.path, undefined, { sensitivity: "base" });
  });
}
