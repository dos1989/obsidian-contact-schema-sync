import type { App, TFile } from "obsidian";

export async function findContactFiles(app: App, contactsFolder: string): Promise<TFile[]> {
  return app.vault
    .getMarkdownFiles()
    .filter((file) => file.path === `${contactsFolder}/${file.name}` || file.path.startsWith(`${contactsFolder}/`));
}
