import type { ContactSchema, SchemaSection, SyncMode } from "../types";
import { buildEndMarker, buildStartMarker, findMarkerRanges } from "../utils/marker";

function renderSection(section: SchemaSection): string {
  const hashes = "#".repeat(section.level);
  const templateBody = section.template ? `${section.template.trimEnd()}\n` : "";
  return `${buildStartMarker(section.id)}\n${hashes} ${section.heading}\n${templateBody}${buildEndMarker(section.id)}`;
}

function splitBodyAroundManagedSections(body: string): { prefix: string; suffix: string } {
  const titleMatch = body.match(/^(# .+?\n)(\n)?/);
  if (!titleMatch) {
    return { prefix: "", suffix: body.trim() };
  }

  const titleBlock = titleMatch[0].trimEnd();
  const remaining = body.slice(titleMatch[0].length).trim();
  return {
    prefix: titleBlock,
    suffix: remaining
  };
}

export function syncSections(
  body: string,
  schema: ContactSchema,
  mode: SyncMode
): {
  body: string;
  addedSections: string[];
  removedSections: string[];
  updatedSections: string[];
  warnings: string[];
} {
  const sourceBody = body.trim();
  const addedSections: string[] = [];
  const removedSections: string[] = [];
  const updatedSections: string[] = [];
  const warnings: string[] = [];
  const existingMarkers = new Map(findMarkerRanges(sourceBody).map((marker) => [marker.id, marker.raw]));
  const schemaIds = new Set(schema.sections.map((section) => section.id));
  const renderedSections: string[] = [];

  for (const section of schema.sections) {
    const existing = existingMarkers.get(section.id);
    const rendered = renderSection(section);

    if (!existing) {
      addedSections.push(section.id);
      renderedSections.push(rendered);
      continue;
    }

    if (section.managed) {
      updatedSections.push(section.id);
      renderedSections.push(rendered);
    } else {
      renderedSections.push(existing);
    }
  }

  if (mode === "full-sync") {
    for (const marker of findMarkerRanges(sourceBody)) {
      if (!schemaIds.has(marker.id)) {
        removedSections.push(marker.id);
      }
    }
  }

  const bodyWithoutManagedBlocks = sourceBody
    .replace(/\n?<!-- schema:[a-z0-9-]+:start -->([\s\S]*?)<!-- schema:[a-z0-9-]+:end -->\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const { prefix, suffix } = splitBodyAroundManagedSections(bodyWithoutManagedBlocks);
  const parts = [prefix, renderedSections.join("\n\n"), suffix].filter((part) => part && part.trim().length > 0);
  const nextBody = parts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();

  return { body: `${nextBody}\n`, addedSections, removedSections, updatedSections, warnings };
}
