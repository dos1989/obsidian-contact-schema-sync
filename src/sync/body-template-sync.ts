export interface BodyTemplateSection {
  id: string;
  heading: string;
}

function slugifyHeading(heading: string): string {
  return heading
    .replace(/^#+\s*/, "")
    .replace(/[:：]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function looksLikeTemplateHeading(heading: string, templateSections: BodyTemplateSection[]): boolean {
  return templateSections.some((section) => section.heading === heading);
}

export function parseBodyTemplateSections(template: string): BodyTemplateSection[] {
  const matches = template.match(/^#+\s.*$/gm) ?? [];
  return matches.map((heading) => ({
    id: slugifyHeading(heading),
    heading
  }));
}

function renderTemplateSection(section: BodyTemplateSection): string {
  return section.heading;
}

export function applyBodyTemplateSections(
  body: string,
  templateSections: BodyTemplateSection[]
): {
  body: string;
  addedSections: string[];
} {
  const source = body.trim();
  const firstHeadingMatch = source.match(/^(# .+?)(\n|$)/);
  const firstHeading = firstHeadingMatch?.[1] ?? "";
  const hasRealTitle = firstHeading.length > 0 && !looksLikeTemplateHeading(firstHeading, templateSections);
  const title = hasRealTitle ? firstHeading : "";
  const remainder = hasRealTitle && firstHeadingMatch ? source.slice(firstHeadingMatch[0].length).trim() : source;
  const addedSections: string[] = [];
  const renderedMissing: string[] = [];

  for (const section of templateSections) {
    if (remainder.includes(section.heading) || source.includes(`<!-- body-template:${section.id}:start -->`)) {
      continue;
    }

    addedSections.push(section.id);
    renderedMissing.push(renderTemplateSection(section));
  }

  const parts = [title, remainder, renderedMissing.join("\n\n")].filter((part) => part && part.trim().length > 0);
  return {
    body: `${parts.join("\n\n").trim()}\n`,
    addedSections
  };
}
