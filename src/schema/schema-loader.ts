import type { App, TFile } from "obsidian";
import YAML from "yaml";
import type { ContactSchema } from "../types";
import { isTFileLike } from "../utils/obsidian-runtime";
import { validateSchema } from "./schema-validator";

export async function loadSchema(app: App, path: string): Promise<ContactSchema> {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file || !isTFileLike(file)) {
    throw new Error(`Schema file not found: ${path}`);
  }

  const raw = await app.vault.read(file);
  const parsed = YAML.parse(raw) as ContactSchema;
  return validateSchema(parsed);
}
