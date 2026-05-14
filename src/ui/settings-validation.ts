export interface SettingsPathValues {
  contactsFolder: string;
  schemaYamlPath: string;
  schemaDocPath: string;
}

export interface ExistingPathEntry {
  path: string;
  type: "file" | "folder";
}

export function validateSettingsPaths(
  values: SettingsPathValues,
  existingEntries: ExistingPathEntry[]
): string[] {
  const index = new Map(existingEntries.map((entry) => [entry.path, entry.type]));
  const errors: string[] = [];

  const contactsType = index.get(values.contactsFolder);
  if (contactsType !== "folder") {
    errors.push(
      contactsType === undefined
        ? `Contacts folder 不存在：${values.contactsFolder}`
        : `Contacts folder 必須指向資料夾：${values.contactsFolder}`
    );
  }

  if (!index.has(values.schemaYamlPath)) {
    errors.push(`Schema YAML path 不存在：${values.schemaYamlPath}`);
  }

  if (!index.has(values.schemaDocPath)) {
    errors.push(`Schema doc path 不存在：${values.schemaDocPath}`);
  }

  return errors;
}
