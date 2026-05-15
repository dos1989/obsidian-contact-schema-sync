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

export function parseBodyTemplateSections(template: string): BodyTemplateSection[] {
  const matches = template.match(/^#+\s.*$/gm) ?? [];
  return matches.map((heading) => ({
    id: slugifyHeading(heading),
    heading
  }));
}

function renderTemplateSection(section: BodyTemplateSection): string {
  return `<!-- body-template:${section.id}:start -->\n${section.heading}\n<!-- body-template:${section.id}:end -->`;
}

export function applyBodyTemplateSections(
  body: string,
  templateSections: BodyTemplateSection[]
): {
  body: string;
  addedSections: string[];
} {
  const source = body.trim();
  const titleMatch = source.match(/^(# .+?)(\n|$)/);
  const title = titleMatch?.[1] ?? "";
  const remainder = titleMatch ? source.slice(titleMatch[0].length).trim() : source;
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
