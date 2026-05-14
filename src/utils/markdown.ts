import YAML from "yaml";

export function splitFrontmatter(input: string): { frontmatter: Record<string, unknown>; body: string } {
  if (!input.startsWith("---\n")) {
    return { frontmatter: {}, body: input };
  }

  const endIndex = input.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { frontmatter: {}, body: input };
  }

  const yamlText = input.slice(4, endIndex);
  const body = input.slice(endIndex + 5);

  return {
    frontmatter: (YAML.parse(yamlText) as Record<string, unknown>) ?? {},
    body
  };
}

export function joinFrontmatter(frontmatter: Record<string, unknown>, body: string): string {
  const yamlText = YAML.stringify(frontmatter).trimEnd();
  return `---\n${yamlText}\n---\n\n${body.trimStart()}`;
}
