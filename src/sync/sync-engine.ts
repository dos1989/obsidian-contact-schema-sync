import type { App, TFile } from "obsidian";
import { buildContactContent } from "../contacts/contact-writer";
import type { ContactSchema, ParsedContact, SyncMode, SyncReport } from "../types";
import { syncFrontmatter } from "./frontmatter-sync";
import { buildReport } from "./sync-report";
import { syncSections } from "./section-sync";

export function buildSyncPreview(
  contacts: ParsedContact[],
  schema: ContactSchema,
  mode: SyncMode
): SyncReport {
  const noteSummaries = contacts.map((contact) => {
    const fm = syncFrontmatter(contact.frontmatter, schema, mode);
    const sections = syncSections(contact.body, schema, mode);
    const nextContent = buildContactContent(fm.frontmatter, sections.body);
    const changed =
      fm.addedFields.length > 0 ||
      fm.removedFields.length > 0 ||
      fm.deprecatedFields.length > 0 ||
      sections.addedSections.length > 0 ||
      sections.removedSections.length > 0 ||
      sections.updatedSections.length > 0;

    return {
      path: contact.path,
      changed,
      addedFields: fm.addedFields,
      removedFields: fm.removedFields,
      deprecatedFields: fm.deprecatedFields,
      addedSections: sections.addedSections,
      removedSections: sections.removedSections,
      updatedSections: sections.updatedSections,
      warnings: sections.warnings,
      nextContent
    };
  });

  return buildReport(mode, noteSummaries);
}

export async function applySyncPreview(
  app: App,
  fileMap: Map<string, TFile>,
  report: SyncReport
): Promise<void> {
  for (const note of report.notes) {
    if (!note.changed) {
      continue;
    }

    const file = fileMap.get(note.path);
    if (!file) {
      continue;
    }

    await app.vault.modify(file, note.nextContent);
  }
}
