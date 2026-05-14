import { Notice, Plugin, TFile } from "obsidian";
import { findContactFiles } from "./contacts/contact-finder";
import { parseContactNote } from "./contacts/contact-parser";
import { loadSchema } from "./schema/schema-loader";
import { DEFAULT_SETTINGS } from "./settings";
import { applySyncPreview, buildSyncPreview } from "./sync/sync-engine";
import type { PluginSettings, SyncMode } from "./types";
import { ContactSchemaSettingTab } from "./ui/settings-tab";
import { SchemaEditorModal } from "./ui/schema-editor-modal";
import { SyncPreviewModal } from "./ui/sync-preview-modal";
import { backupNote } from "./utils/backup";
import { hashContent } from "./utils/hash";

export default class ContactSchemaSyncPlugin extends Plugin {
  settings!: PluginSettings;

  async onload(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };

    this.addSettingTab(new ContactSchemaSettingTab(this.app, this));
    await this.checkForSchemaChanges();

    this.addCommand({
      id: "sync-all-contacts",
      name: "Contact Schema: Sync all contacts",
      callback: async () => this.previewSync(this.settings.defaultSyncMode)
    });

    this.addCommand({
      id: "preview-schema-changes",
      name: "Contact Schema: Preview schema changes",
      callback: async () => this.previewSync(this.settings.defaultSyncMode)
    });

    this.addCommand({
      id: "sync-current-contact",
      name: "Contact Schema: Sync current contact",
      callback: async () => this.previewCurrentContact(this.settings.defaultSyncMode)
    });

    this.addCommand({
      id: "edit-schema",
      name: "Contact Schema: Edit schema",
      callback: async () => {
        const schema = await loadSchema(this.app, this.settings.schemaYamlPath);
        new SchemaEditorModal(this.app, this, schema).open();
      }
    });

    this.addCommand({
      id: "create-contact-from-schema",
      name: "Contact Schema: Create new contact from schema",
      callback: async () => {
        new Notice("Create new contact from schema not implemented yet.");
      }
    });
  }

  async previewSync(mode: SyncMode): Promise<void> {
    const schema = await loadSchema(this.app, this.settings.schemaYamlPath);
    const files = await findContactFiles(this.app, this.settings.contactsFolder);
    const contacts = await Promise.all(
      files.map(async (file) => parseContactNote(file.path, await this.app.vault.read(file)))
    );

    const report = buildSyncPreview(contacts, schema, mode);
    const fileMap = new Map(files.map((file) => [file.path, file]));

    new SyncPreviewModal(this.app, report, async () => {
      if (this.settings.backupBeforeSync) {
        for (const file of files) {
          await backupNote(this.app, file);
        }
      }
      await applySyncPreview(this.app, fileMap, report);
      new Notice(`Applied changes to ${report.updated} contacts.`);
    }).open();
  }

  async previewCurrentContact(mode: SyncMode): Promise<void> {
    const file = this.getActiveContactFile();
    if (!file) {
      new Notice("Active file is not inside the contacts folder.");
      return;
    }

    const schema = await loadSchema(this.app, this.settings.schemaYamlPath);
    const raw = await this.app.vault.read(file);
    const parsed = parseContactNote(file.path, raw);
    const report = buildSyncPreview([parsed], schema, mode);

    new SyncPreviewModal(this.app, report, async () => {
      if (this.settings.backupBeforeSync) {
        await backupNote(this.app, file);
      }
      await applySyncPreview(this.app, new Map([[file.path, file]]), report);
      new Notice(`Applied changes to ${file.basename}.`);
    }).open();
  }

  async checkForSchemaChanges(): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(this.settings.schemaYamlPath);
    if (!file || !(file instanceof TFile)) {
      return;
    }

    const raw = await this.app.vault.read(file);
    const hash = hashContent(raw);

    if (this.settings.lastKnownSchemaHash && this.settings.lastKnownSchemaHash !== hash && this.settings.promptOnSchemaChange) {
      new Notice("Contact schema changed. Run preview or sync.");
    }

    this.settings.lastKnownSchemaHash = hash;
    await this.saveSettings();
  }

  getActiveContactFile(): TFile | null {
    const active = this.app.workspace.getActiveFile();
    if (!active) {
      return null;
    }

    if (!active.path.startsWith(`${this.settings.contactsFolder}/`)) {
      return null;
    }

    return active;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
