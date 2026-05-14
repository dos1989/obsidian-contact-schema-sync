import { Modal, Notice, Setting } from "obsidian";
import type ContactSchemaSyncPlugin from "../main";
import { validateSchema } from "../schema/schema-validator";
import { writeSchema } from "../schema/schema-writer";
import type { ContactSchema, FrontmatterField } from "../types";
import { addFieldToDraft, cloneSchemaDraft, removeFieldFromDraft, serializeSchemaPreview, type FieldGroup } from "./schema-editor-state";

export class SchemaEditorModal extends Modal {
  private draftSchema: ContactSchema;

  constructor(
    app: ContactSchemaSyncPlugin["app"],
    private readonly plugin: ContactSchemaSyncPlugin,
    private readonly schema: ContactSchema
  ) {
    super(app);
    this.draftSchema = cloneSchemaDraft(schema);
  }

  onOpen(): void {
    this.render();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit Contact Schema" });

    contentEl.createEl("h3", { text: "Basic" });

    new Setting(contentEl)
      .setName("Version")
      .setDesc("Schema 版本")
      .addText((text) =>
        text.setValue(String(this.draftSchema.version)).onChange((value) => {
          this.draftSchema.version = Number.parseInt(value || "1", 10) || 1;
          this.render();
        })
      );

    new Setting(contentEl)
      .setName("Note type")
      .setDesc("Schema 對應的 note 類型")
      .addText((text) =>
        text.setValue(this.draftSchema.noteType).onChange((value) => {
          this.draftSchema.noteType = value.trim() || "contact";
          this.render();
        })
      );

    this.renderFieldGroup(contentEl, "required", "Required Fields", "必要欄位");
    this.renderFieldGroup(contentEl, "optional", "Optional Fields", "可選欄位");

    contentEl.createEl("h3", { text: "YAML Preview" });
    const preview = contentEl.createEl("textarea");
    preview.value = serializeSchemaPreview(this.draftSchema);
    preview.rows = 16;
    preview.cols = 80;
    preview.readOnly = true;
    preview.style.width = "100%";
    preview.style.fontFamily = "monospace";
    preview.style.marginTop = "0.5rem";

    const actionRow = contentEl.createDiv();
    actionRow.style.display = "flex";
    actionRow.style.gap = "0.75rem";
    actionRow.style.marginTop = "1rem";
    actionRow.style.flexWrap = "wrap";

    const validateButton = actionRow.createEl("button", { text: "Validate schema" });
    validateButton.onclick = () => {
      try {
        validateSchema(this.draftSchema);
        new Notice("Schema 驗證成功。", 4000);
      } catch (error) {
        new Notice(error instanceof Error ? error.message : "Schema 驗證失敗。", 6000);
      }
    };

    const saveButton = actionRow.createEl("button", { text: "Save schema" });
    saveButton.onclick = async () => {
      try {
        validateSchema(this.draftSchema);
        await writeSchema(this.app, this.plugin.settings.schemaYamlPath, this.draftSchema);
        this.plugin.settings.lastKnownSchemaHash = "";
        await this.plugin.saveSettings();
        new Notice("Schema 已儲存。", 4000);
        this.close();
      } catch (error) {
        new Notice(error instanceof Error ? error.message : "Schema 儲存失敗。", 6000);
      }
    };
  }

  private renderFieldGroup(
    containerEl: HTMLElement,
    group: FieldGroup,
    heading: string,
    description: string
  ): void {
    containerEl.createEl("h3", { text: heading });
    containerEl.createEl("p", { text: description });

    const fields = this.draftSchema.frontmatter[group];
    for (const [index, field] of fields.entries()) {
      this.renderFieldEditor(containerEl, group, field, index);
    }

    const addButton = containerEl.createEl("button", {
      text: group === "required" ? "Add required field" : "Add optional field"
    });
    addButton.style.marginTop = "0.5rem";
    addButton.onclick = () => {
      addFieldToDraft(this.draftSchema, group);
      this.render();
    };
  }

  private renderFieldEditor(
    containerEl: HTMLElement,
    group: FieldGroup,
    field: FrontmatterField,
    index: number
  ): void {
    new Setting(containerEl)
      .setName(`${group === "required" ? "Required" : "Optional"} field #${index + 1}`)
      .setDesc("編輯 key / type / default")
      .addText((text) =>
        text.setPlaceholder("key").setValue(field.key).onChange((value) => {
          field.key = value.trim() || "new_field";
          this.render();
        })
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            string: "string",
            date: "date",
            number: "number",
            boolean: "boolean",
            list: "list"
          })
          .setValue(field.type)
          .onChange((value) => {
            field.type = value as FrontmatterField["type"];
            this.render();
          })
      )
      .addText((text) =>
        text.setPlaceholder("default").setValue(field.default).onChange((value) => {
          field.default = value;
        })
      )
      .addButton((button) =>
        button.setButtonText("Delete").onClick(() => {
          removeFieldFromDraft(this.draftSchema, group, index);
          this.render();
        })
      );
  }
}
