import type { PluginSettings } from "./types";

export const DEFAULT_SETTINGS: PluginSettings = {
  contactsFolder: "Contacts",
  schemaYamlPath: "_config/contact-schema.yaml",
  schemaDocPath: "_config/contact-schema.md",
  defaultSyncMode: "add-only",
  promptOnSchemaChange: true,
  dryRunByDefault: true,
  backupBeforeSync: true,
  checkExistingContactsOnStartup: false,
  autoApplyNewBlankContacts: true,
  lastKnownSchemaHash: ""
};
