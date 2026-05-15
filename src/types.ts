export type SyncMode = "add-only" | "full-sync" | "mark-deprecated";

export type FrontmatterDefaultValue = string | number | boolean | string[];

export interface FrontmatterField {
  key: string;
  type: "string" | "date" | "number" | "boolean" | "list";
  default: FrontmatterDefaultValue;
}

export interface SchemaSection {
  id: string;
  heading: string;
  level: number;
  managed: boolean;
  template: string;
}

export interface ContactSchema {
  version: number;
  noteType: string;
  frontmatter: {
    required: FrontmatterField[];
    optional: FrontmatterField[];
  };
  sections: SchemaSection[];
}

export interface PluginSettings {
  contactsFolder: string;
  schemaYamlPath: string;
  schemaDocPath: string;
  defaultSyncMode: SyncMode;
  promptOnSchemaChange: boolean;
  dryRunByDefault: boolean;
  backupBeforeSync: boolean;
  lastKnownSchemaHash: string;
}

export interface ParsedContact {
  path: string;
  fileName: string;
  frontmatter: Record<string, unknown>;
  body: string;
  markers: { id: string; start: number; end: number; raw: string }[];
}

export interface NoteChangeSummary {
  path: string;
  changed: boolean;
  addedFields: string[];
  removedFields: string[];
  deprecatedFields: string[];
  coercedFields: string[];
  addedSections: string[];
  removedSections: string[];
  updatedSections: string[];
  warnings: string[];
  nextContent: string;
}

export interface SyncReport {
  mode: SyncMode;
  total: number;
  updated: number;
  unchanged: number;
  skipped: number;
  conflicts: number;
  notes: NoteChangeSummary[];
}
