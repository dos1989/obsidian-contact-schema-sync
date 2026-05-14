import type { ContactSchema, SchemaSection, SyncMode } from "../types";
import { buildEndMarker, buildStartMarker, findMarkerRanges } from "../utils/marker";

function renderSection(section: SchemaSection): string {
  const hashes = "#".repeat(section.level);
  const templateBody = section.template ? `${section.template.trimEnd()}\n` : "";
  return `${buildStartMarker(section.id)}\n${hashes} ${section.heading}\n${templateBody}${buildEndMarker(section.id)}`;
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
  let nextBody = body.trimEnd();
  const addedSections: string[] = [];
  const removedSections: string[] = [];
  const updatedSections: string[] = [];
  const warnings: string[] = [];
  let currentMarkers = new Map(findMarkerRanges(nextBody).map((marker) => [marker.id, marker]));
  const schemaIds = new Set(schema.sections.map((section) => section.id));

  for (const section of schema.sections) {
    const existing = currentMarkers.get(section.id);
    const rendered = renderSection(section);

    if (!existing) {
      nextBody = `${nextBody}\n\n${rendered}`.trimStart();
      addedSections.push(section.id);
      currentMarkers = new Map(findMarkerRanges(nextBody).map((marker) => [marker.id, marker]));
      continue;
    }

    if (section.managed) {
      nextBody = `${nextBody.slice(0, existing.start)}${rendered}${nextBody.slice(existing.end)}`;
      updatedSections.push(section.id);
      currentMarkers = new Map(findMarkerRanges(nextBody).map((marker) => [marker.id, marker]));
    }
  }

  if (mode === "full-sync") {
    for (const marker of [...findMarkerRanges(nextBody)].reverse()) {
      if (!schemaIds.has(marker.id)) {
        nextBody = `${nextBody.slice(0, marker.start)}${nextBody.slice(marker.end)}`;
        removedSections.push(marker.id);
      }
    }
  }

  return { body: `${nextBody.trim()}\n`, addedSections, removedSections, updatedSections, warnings };
}
