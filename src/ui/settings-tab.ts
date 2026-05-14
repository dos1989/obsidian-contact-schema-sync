import { PluginSettingTab, Setting } from "obsidian";
import type ContactSchemaSyncPlugin from "../main";

export class ContactSchemaSettingTab extends PluginSettingTab {
  plugin: ContactSchemaSyncPlugin;

  constructor(app: ContactSchemaSyncPlugin["app"], plugin: ContactSchemaSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Contacts folder")
      .addText((text) =>
        text.setValue(this.plugin.settings.contactsFolder).onChange(async (value) => {
          this.plugin.settings.contactsFolder = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Schema YAML path")
      .addText((text) =>
        text.setValue(this.plugin.settings.schemaYamlPath).onChange(async (value) => {
          this.plugin.settings.schemaYamlPath = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Schema doc path")
      .addText((text) =>
        text.setValue(this.plugin.settings.schemaDocPath).onChange(async (value) => {
          this.plugin.settings.schemaDocPath = value.trim();
          await this.plugin.saveSettings();
        })
      );
  }
}
