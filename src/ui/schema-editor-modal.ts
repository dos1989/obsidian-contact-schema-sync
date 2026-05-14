import { Modal, Notice, Setting } from "obsidian";
import type ContactSchemaSyncPlugin from "../main";
import { validateSchema } from "../schema/schema-validator";
import { writeSchema } from "../schema/schema-writer";
import type { ContactSchema, FrontmatterField } from "../types";
import { getSchemaEditorLabels } from "./schema-editor-layout";
import {
  addFieldToDraft,
  cloneSchemaDraft,
  removeFieldFromDraft,
  serializeSchemaPreview,
  type FieldGroup
} from "./schema-editor-state";

export class SchemaEditorModal extends Modal {
  private draftSchema: ContactSchema;
  private readonly labels = getSchemaEditorLabels();

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
    contentEl.style.maxHeight = "80vh";
    contentEl.style.overflowY = "auto";
    contentEl.createEl("h2", { text: this.labels.title });

    contentEl.createEl("h3", { text: this.labels.basic });

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

    this.renderFieldGroup(contentEl, "required", this.labels.required);
    this.renderFieldGroup(contentEl, "optional", this.labels.optional);

    contentEl.createEl("h3", { text: this.labels.preview });
    const preview = contentEl.createEl("textarea");
    preview.value = serializeSchemaPreview(this.draftSchema);
    preview.rows = 16;
    preview.readOnly = true;
    preview.style.width = "100%";
    preview.style.fontFamily = "monospace";
    preview.style.marginTop = "0.5rem";
    preview.style.boxSizing = "border-box";

    const actionRow = contentEl.createDiv();
    actionRow.style.display = "flex";
    actionRow.style.gap = "0.75rem";
    actionRow.style.marginTop = "1rem";
    actionRow.style.flexWrap = "wrap";

    const validateButton = actionRow.createEl("button", { text: this.labels.validate });
    validateButton.onclick = () => {
      try {
        validateSchema(this.draftSchema);
        new Notice("Schema 驗證成功。", 4000);
      } catch (error) {
        new Notice(error instanceof Error ? error.message : "Schema 驗證失敗。", 6000);
      }
    };

    const saveButton = actionRow.createEl("button", { text: this.labels.save });
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

  private renderFieldGroup(containerEl: HTMLElement, group: FieldGroup, heading: string): void {
    containerEl.createEl("h3", { text: heading });

    const fields = this.draftSchema.frontmatter[group];
    for (const [index, field] of fields.entries()) {
      this.renderFieldCard(containerEl, group, field, index);
    }

    const addButton = containerEl.createEl("button", {
      text: group === "required" ? this.labels.addRequired : this.labels.addOptional
    });
    addButton.style.marginTop = "0.5rem";
    addButton.onclick = () => {
      addFieldToDraft(this.draftSchema, group);
      this.render();
    };
  }

  private renderFieldCard(
    containerEl: HTMLElement,
    group: FieldGroup,
    field: FrontmatterField,
    index: number
  ): void {
    const card = containerEl.createDiv();
    card.style.border = "1px solid var(--background-modifier-border)";
    card.style.borderRadius = "8px";
    card.style.padding = "12px";
    card.style.marginTop = "0.75rem";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.gap = "0.75rem";

    const title = card.createEl("strong", {
      text: `${group === "required" ? this.labels.required : this.labels.optional} #${index + 1}`
    });
    title.style.display = "block";

    this.renderFieldInput(card, this.labels.key, field.key, (value) => {
      field.key = value.trim() || "new_field";
    });

    const typeRow = card.createDiv();
    typeRow.style.display = "flex";
    typeRow.style.flexDirection = "column";
    typeRow.style.gap = "0.35rem";
    typeRow.createEl("label", { text: this.labels.type });
    const select = typeRow.createEl("select");
    const options: FrontmatterField["type"][] = ["string", "date", "number", "boolean", "list"];
    for (const option of options) {
      const optionEl = select.createEl("option", { text: option, value: option });
      optionEl.selected = option === field.type;
    }
    select.onchange = () => {
      field.type = select.value as FrontmatterField["type"];
      this.render();
    };

    this.renderFieldInput(card, this.labels.default, field.default, (value) => {
      field.default = value;
    });

    const deleteButton = card.createEl("button", { text: this.labels.delete });
    deleteButton.style.alignSelf = "flex-start";
    deleteButton.onclick = () => {
      removeFieldFromDraft(this.draftSchema, group, index);
      this.render();
    };
  }

  private renderFieldInput(
    containerEl: HTMLElement,
    label: string,
    value: string,
    onChange: (value: string) => void
  ): void {
    const row = containerEl.createDiv();
    row.style.display = "flex";
    row.style.flexDirection = "column";
    row.style.gap = "0.35rem";
    row.createEl("label", { text: label });
    const input = row.createEl("input", { type: "text", value });
    input.onchange = () => {
      onChange(input.value);
      this.render();
    };
  }
}
