import { Notice, PluginSettingTab, Setting, normalizePath } from "obsidian";
import type ContactSchemaSyncPlugin from "../main";
import type { PluginSettings } from "../types";
import { PathPickerModal } from "./path-picker-modal";
import { SchemaEditorModal } from "./schema-editor-modal";
import { shouldCreateSchemaBeforeOpening } from "./schema-editor-launch";
import { buildDefaultSchemaDoc, buildDefaultSchemaYaml } from "./settings-creation";
import { cloneSettingsDraft, hasDraftChanges } from "./settings-state";
import { canRunSettingsSync } from "./settings-sync-action";
import { getMissingCreatablePaths, validateSettingsPaths } from "./settings-validation";
import { isTFolderLike } from "../utils/obsidian-runtime";
import { loadSchema } from "../schema/schema-loader";

export class ContactSchemaSettingTab extends PluginSettingTab {
  plugin: ContactSchemaSyncPlugin;
  draftSettings: PluginSettings;

  constructor(app: ContactSchemaSyncPlugin["app"], plugin: ContactSchemaSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.draftSettings = cloneSettingsDraft(plugin.settings);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const dirty = hasDraftChanges(this.plugin.settings, this.draftSettings);

    this.buildPathSetting({
      containerEl,
      name: "Contacts folder",
      desc: "存放所有 contact notes 的資料夾路徑（vault 內相對路徑）",
      value: this.draftSettings.contactsFolder,
      onChange: (value) => {
        this.draftSettings.contactsFolder = value.trim();
      },
      onBrowse: () => {
        new PathPickerModal(this.app, { mode: "folder" }, (path) => {
          this.draftSettings.contactsFolder = path;
          this.display();
        }).open();
      }
    });

    this.buildPathSetting({
      containerEl,
      name: "Schema YAML path",
      desc: "Contact schema 設定檔路徑，用來定義欄位與 sections",
      value: this.draftSettings.schemaYamlPath,
      onChange: (value) => {
        this.draftSettings.schemaYamlPath = value.trim();
      },
      onBrowse: () => {
        new PathPickerModal(this.app, { mode: "file", allowedExtensions: ["yaml", "yml"] }, (path) => {
          this.draftSettings.schemaYamlPath = path;
          this.display();
        }).open();
      }
    });

    this.buildPathSetting({
      containerEl,
      name: "Schema doc path",
      desc: "Schema 說明文件路徑，供人閱讀與維護用途",
      value: this.draftSettings.schemaDocPath,
      onChange: (value) => {
        this.draftSettings.schemaDocPath = value.trim();
      },
      onBrowse: () => {
        new PathPickerModal(this.app, { mode: "file", allowedExtensions: ["md"] }, (path) => {
          this.draftSettings.schemaDocPath = path;
          this.display();
        }).open();
      }
    });

    const status = containerEl.createEl("p", {
      text: dirty ? "有未儲存變更" : "目前設定已同步"
    });
    status.style.marginTop = "1.5rem";

    const actionRow = containerEl.createDiv();
    actionRow.style.display = "flex";
    actionRow.style.gap = "0.75rem";
    actionRow.style.marginTop = "0.5rem";
    actionRow.style.flexWrap = "wrap";

    const openEditorButton = actionRow.createEl("button", { text: "開啟 Schema Editor" });
    openEditorButton.onclick = async () => {
      const existingEntries = this.getExistingEntries();
      const shouldCreate = shouldCreateSchemaBeforeOpening(this.draftSettings.schemaYamlPath, existingEntries);

      if (shouldCreate) {
        const confirmed = window.confirm(
          `Schema YAML 檔案未建立，是否立即建立預設 schema 並打開編輯器？\n\n- ${this.draftSettings.schemaYamlPath}`
        );

        if (!confirmed) {
          return;
        }

        await this.ensureParentFolder(this.draftSettings.schemaYamlPath);
        await this.app.vault.create(normalizePath(this.draftSettings.schemaYamlPath), buildDefaultSchemaYaml());
      }

      try {
        const schema = await loadSchema(this.app, this.draftSettings.schemaYamlPath);
        new SchemaEditorModal(this.app, this.plugin, schema).open();
      } catch (error) {
        new Notice(
          error instanceof Error ? `打開 Schema Editor 失敗：${error.message}` : "打開 Schema Editor 失敗。",
          6000
        );
      }
    };

    const validateButton = actionRow.createEl("button", { text: "驗證路徑" });
    validateButton.onclick = () => {
      const messages = validateSettingsPaths(this.draftSettings, this.getExistingEntries());
      const missing = getMissingCreatablePaths(this.draftSettings, this.getExistingEntries());
      const output = [
        ...messages,
        ...missing.map((item) => `${item.label} 尚未建立：${item.path}`)
      ];
      new Notice(output.length === 0 ? "所有路徑設定正確。" : output.join("\n"), 6000);
    };

    const syncButton = actionRow.createEl("button", { text: "預覽並同步 Contacts" });
    syncButton.onclick = async () => {
      const syncCheck = canRunSettingsSync(this.plugin.settings, this.draftSettings);
      if (!syncCheck.allowed) {
        new Notice(syncCheck.reason, 5000);
        return;
      }

      const validationErrors = validateSettingsPaths(this.draftSettings, this.getExistingEntries());
      if (validationErrors.length > 0) {
        new Notice(validationErrors.join("\n"), 6000);
        return;
      }

      await this.plugin.previewSync(this.plugin.settings.defaultSyncMode);
    };

    const resetButton = actionRow.createEl("button", { text: "還原未儲存變更" });
    resetButton.disabled = !dirty;
    resetButton.onclick = () => {
      this.draftSettings = cloneSettingsDraft(this.plugin.settings);
      this.display();
    };

    const applyButton = actionRow.createEl("button", { text: "套用設定" });
    applyButton.disabled = !dirty;
    applyButton.onclick = async () => {
      const validationErrors = validateSettingsPaths(this.draftSettings, this.getExistingEntries());
      if (validationErrors.length > 0) {
        new Notice(validationErrors.join("\n"), 6000);
        return;
      }

      const missing = getMissingCreatablePaths(this.draftSettings, this.getExistingEntries());
      if (missing.length > 0) {
        const confirmed = window.confirm(
          `以下項目尚未建立，是否立即建立？\n\n${missing.map((item) => `- ${item.label}: ${item.path}`).join("\n")}`
        );

        if (!confirmed) {
          return;
        }

        await this.createMissingPaths();
      }

      this.plugin.settings = cloneSettingsDraft(this.draftSettings);
      await this.plugin.saveSettings();
      new Notice("設定已儲存。", 4000);
      this.display();
    };
  }

  private async createMissingPaths(): Promise<void> {
    const entries = this.getExistingEntries();
    const missing = getMissingCreatablePaths(this.draftSettings, entries);

    for (const item of missing) {
      if (item.kind === "folder") {
        await this.ensureFolder(item.path);
        continue;
      }

      await this.ensureParentFolder(item.path);

      if (item.label === "Schema YAML path") {
        await this.app.vault.create(normalizePath(item.path), buildDefaultSchemaYaml());
      } else if (item.label === "Schema doc path") {
        await this.app.vault.create(normalizePath(item.path), buildDefaultSchemaDoc());
      }
    }
  }

  private async ensureParentFolder(filePath: string): Promise<void> {
    const parts = normalizePath(filePath).split("/");
    parts.pop();

    if (parts.length === 0) {
      return;
    }

    await this.ensureFolder(parts.join("/"));
  }

  private async ensureFolder(folderPath: string): Promise<void> {
    const normalized = normalizePath(folderPath);
    if (!normalized) {
      return;
    }

    const parts = normalized.split("/");
    let current = "";

    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (await this.app.vault.adapter.exists(current)) {
        continue;
      }
      await this.app.vault.createFolder(current);
    }
  }

  private getExistingEntries(): Array<{ path: string; type: "file" | "folder" }> {
    const folders = this.app.vault.getAllLoadedFiles().flatMap((file) => {
      if (isTFolderLike(file)) {
        return [{ path: file.path, type: "folder" as const }];
      }
      return [];
    });

    const files = this.app.vault.getFiles().map((file) => ({ path: file.path, type: "file" as const }));

    return [...folders, ...files];
  }

  private buildPathSetting({
    containerEl,
    name,
    desc,
    value,
    onChange,
    onBrowse
  }: {
    containerEl: HTMLElement;
    name: string;
    desc: string;
    value: string;
    onChange: (value: string) => void;
    onBrowse: () => void;
  }): void {
    new Setting(containerEl)
      .setName(name)
      .setDesc(desc)
      .addText((text) =>
        text
          .setPlaceholder("vault relative path")
          .setValue(value)
          .onChange((nextValue) => {
            onChange(nextValue);
          })
      )
      .addButton((button) =>
        button.setButtonText("瀏覽").onClick(() => {
          onBrowse();
        })
      );
  }
}
