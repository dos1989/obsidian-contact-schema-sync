import type { App, TFile } from "obsidian";
import YAML from "yaml";
import type { ContactSchema } from "../types";
import { validateSchema } from "./schema-validator";

export async function writeSchema(app: App, path: string, schema: ContactSchema): Promise<void> {
  const validated = validateSchema(schema);
  const payload = YAML.stringify(validated);
  const existing = app.vault.getAbstractFileByPath(path);

  if (existing && existing instanceof TFile) {
    await app.vault.modify(existing, payload);
    return;
  }

  await app.vault.create(path, payload);
}
