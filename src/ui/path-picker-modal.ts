import { FuzzySuggestModal, type App } from "obsidian";
import { isTFolderLike } from "../utils/obsidian-runtime";
import { filterSelectablePaths, sortSelectablePaths, type PickerFilterOptions, type SelectablePath } from "./path-picker-utils";

export class PathPickerModal extends FuzzySuggestModal<SelectablePath> {
  private readonly items: SelectablePath[];

  constructor(
    app: App,
    options: PickerFilterOptions,
    private readonly onChoose: (path: string) => void
  ) {
    super(app);

    const folders = app.vault.getAllLoadedFiles().flatMap((file) => {
      if (isTFolderLike(file)) {
        return [{ path: file.path, type: "folder" as const }];
      }
      return [];
    });

    const files = app.vault.getFiles().map((file) => ({
      path: file.path,
      type: "file" as const
    }));

    this.items = sortSelectablePaths(filterSelectablePaths([...folders, ...files], options));
    this.setPlaceholder(options.mode === "folder" ? "選擇資料夾…" : "選擇檔案…");
  }

  getItems(): SelectablePath[] {
    return this.items;
  }

  getItemText(item: SelectablePath): string {
    return item.path;
  }

  onChooseItem(item: SelectablePath): void {
    this.onChoose(item.path);
  }
}
