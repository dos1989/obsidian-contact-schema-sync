import { Modal } from "obsidian";
import type { SyncReport } from "../types";

export class SyncPreviewModal extends Modal {
  constructor(
    app: Modal["app"],
    private readonly report: SyncReport,
    private readonly onApply?: () => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: `Sync Preview (${this.report.updated}/${this.report.total} changed)` });

    for (const note of this.report.notes) {
      const section = contentEl.createDiv();
      section.createEl("h3", { text: note.path });
      section.createEl("p", { text: `Added fields: ${note.addedFields.join(", ") || "none"}` });
      section.createEl("p", { text: `Removed fields: ${note.removedFields.join(", ") || "none"}` });
      section.createEl("p", { text: `Deprecated fields: ${note.deprecatedFields.join(", ") || "none"}` });
      section.createEl("p", { text: `Changed field types: ${note.coercedFields.join(", ") || "none"}` });
      section.createEl("p", { text: `Added sections: ${note.addedSections.join(", ") || "none"}` });
      section.createEl("p", { text: `Removed sections: ${note.removedSections.join(", ") || "none"}` });
      section.createEl("p", { text: `Updated sections: ${note.updatedSections.join(", ") || "none"}` });
    }

    if (this.onApply) {
      const applyButton = contentEl.createEl("button", { text: "Apply changes" });
      applyButton.onclick = async () => {
        await this.onApply?.();
        this.close();
      };
    }
  }
}
