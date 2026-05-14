import { joinFrontmatter } from "../utils/markdown";

export function buildContactContent(frontmatter: Record<string, unknown>, body: string): string {
  return joinFrontmatter(frontmatter, body);
}
