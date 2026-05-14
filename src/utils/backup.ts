import { normalizePath, type App, type TFile } from "obsidian";

export async function backupNote(app: App, file: TFile): Promise<void> {
  const raw = await app.vault.read(file);
  const backupPath = normalizePath(`.contact-schema-sync-backups/${file.path}.${Date.now()}.bak.md`);
  const parent = backupPath.split("/").slice(0, -1).join("/");

  if (parent && !(await app.vault.adapter.exists(parent))) {
    await app.vault.createFolder(parent);
  }

  await app.vault.create(backupPath, raw);
}
