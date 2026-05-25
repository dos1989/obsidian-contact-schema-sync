import { Modal } from "obsidian";
import type { SyncReport } from "../types";
import { getAffectedFileNames } from "./sync-preview-summary";

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
    const affectedFiles = getAffectedFileNames(this.report.notes);

    contentEl.empty();
    contentEl.createEl("h2", { text: "Sync Preview" });
    contentEl.createEl("p", {
      text:
        affectedFiles.length === 0
          ? "No files need updates."
          : `${affectedFiles.length} file${affectedFiles.length === 1 ? "" : "s"} will be updated.`
    });

    if (affectedFiles.length > 0) {
      const details = contentEl.createEl("details");
      const summary = details.createEl("summary", { text: "Show affected files" });
      summary.style.cursor = "pointer";

      const list = details.createEl("ul");
      for (const fileName of affectedFiles) {
        list.createEl("li", { text: fileName });
      }
    }

    if (this.onApply && affectedFiles.length > 0) {
      const applyButton = contentEl.createEl("button", { text: "Apply changes" });
      applyButton.onclick = async () => {
        await this.onApply?.();
        this.close();
      };
    }
  }
}
