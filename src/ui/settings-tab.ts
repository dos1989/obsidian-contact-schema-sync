import { Notice, PluginSettingTab, Setting, TFolder } from "obsidian";
import type ContactSchemaSyncPlugin from "../main";
import type { PluginSettings } from "../types";
import { PathPickerModal } from "./path-picker-modal";
import { cloneSettingsDraft, hasDraftChanges } from "./settings-state";
import { validateSettingsPaths } from "./settings-validation";

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

    const validateButton = actionRow.createEl("button", { text: "驗證路徑" });
    validateButton.onclick = () => {
      const messages = validateSettingsPaths(this.draftSettings, this.getExistingEntries());
      new Notice(messages.length === 0 ? "所有路徑設定正確。" : messages.join("\n"), 6000);
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

      this.plugin.settings = cloneSettingsDraft(this.draftSettings);
      await this.plugin.saveSettings();
      new Notice("設定已儲存。");
      this.display();
    };
  }

  private getExistingEntries(): Array<{ path: string; type: "file" | "folder" }> {
    const folders = this.app.vault.getAllLoadedFiles().flatMap((file) => {
      if (file instanceof TFolder) {
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
