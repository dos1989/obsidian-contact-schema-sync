import type { App } from "obsidian";
import YAML from "yaml";
import type { ContactSchema } from "../types";
import { isTFileLike } from "../utils/obsidian-runtime";
import { validateSchema } from "./schema-validator";

export async function writeSchema(app: App, path: string, schema: ContactSchema): Promise<void> {
  const validated = validateSchema(schema);
  const payload = YAML.stringify(validated);
  const existing = app.vault.getAbstractFileByPath(path);

  if (existing && isTFileLike(existing)) {
    await app.vault.modify(existing, payload);
    return;
  }

  await app.vault.create(path, payload);
}
