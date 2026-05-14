export interface SettingsPathValues {
  contactsFolder: string;
  schemaYamlPath: string;
  schemaDocPath: string;
}

export interface ExistingPathEntry {
  path: string;
  type: "file" | "folder";
}

export interface MissingCreatablePath {
  kind: "file" | "folder";
  label: "Contacts folder" | "Schema YAML path" | "Schema doc path";
  path: string;
}

export function validateSettingsPaths(
  values: SettingsPathValues,
  existingEntries: ExistingPathEntry[]
): string[] {
  const index = new Map(existingEntries.map((entry) => [entry.path, entry.type]));
  const errors: string[] = [];

  const contactsType = index.get(values.contactsFolder);
  if (contactsType !== undefined && contactsType !== "folder") {
    errors.push(`Contacts folder 必須指向資料夾：${values.contactsFolder}`);
  }

  const schemaYamlType = index.get(values.schemaYamlPath);
  if (schemaYamlType !== undefined && schemaYamlType !== "file") {
    errors.push(`Schema YAML path 必須指向檔案：${values.schemaYamlPath}`);
  }

  const schemaDocType = index.get(values.schemaDocPath);
  if (schemaDocType !== undefined && schemaDocType !== "file") {
    errors.push(`Schema doc path 必須指向檔案：${values.schemaDocPath}`);
  }

  return errors;
}

export function getMissingCreatablePaths(
  values: SettingsPathValues,
  existingEntries: ExistingPathEntry[]
): MissingCreatablePath[] {
  const index = new Map(existingEntries.map((entry) => [entry.path, entry.type]));
  const missing: MissingCreatablePath[] = [];

  if (!index.has(values.contactsFolder)) {
    missing.push({ kind: "folder", label: "Contacts folder", path: values.contactsFolder });
  }

  if (!index.has(values.schemaYamlPath)) {
    missing.push({ kind: "file", label: "Schema YAML path", path: values.schemaYamlPath });
  }

  if (!index.has(values.schemaDocPath)) {
    missing.push({ kind: "file", label: "Schema doc path", path: values.schemaDocPath });
  }

  return missing;
}
