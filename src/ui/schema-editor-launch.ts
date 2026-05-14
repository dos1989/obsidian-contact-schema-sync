export function shouldCreateSchemaBeforeOpening(
  schemaYamlPath: string,
  existingEntries: Array<{ path: string; type: "file" | "folder" }>
): boolean {
  return !existingEntries.some((entry) => entry.path === schemaYamlPath && entry.type === "file");
}
