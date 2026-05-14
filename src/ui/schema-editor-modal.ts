import { Modal, Notice, Setting } from "obsidian";
import type ContactSchemaSyncPlugin from "../main";
import { writeSchema } from "../schema/schema-writer";
import type { ContactSchema } from "../types";

export class SchemaEditorModal extends Modal {
  constructor(
    app: ContactSchemaSyncPlugin["app"],
    private readonly plugin: ContactSchemaSyncPlugin,
    private readonly schema: ContactSchema
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit Contact Schema" });

    for (const field of this.schema.frontmatter.required) {
      new Setting(contentEl)
        .setName(`Required field: ${field.key}`)
        .addText((text) =>
          text.setValue(field.default).onChange((value) => {
            field.default = value;
          })
        );
    }

    const saveButton = contentEl.createEl("button", { text: "Save schema" });
    saveButton.onclick = async () => {
      await writeSchema(this.app, this.plugin.settings.schemaYamlPath, this.schema);
      this.plugin.settings.lastKnownSchemaHash = "";
      await this.plugin.saveSettings();
      new Notice("Schema saved.");
      this.close();
    };
  }
}
