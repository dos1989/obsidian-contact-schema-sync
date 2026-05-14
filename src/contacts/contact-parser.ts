import { findMarkerRanges } from "../utils/marker";
import { splitFrontmatter } from "../utils/markdown";
import type { ParsedContact } from "../types";

export function parseContactNote(path: string, content: string): ParsedContact {
  const { frontmatter, body } = splitFrontmatter(content);

  return {
    path,
    fileName: path.split("/").pop() ?? path,
    frontmatter,
    body,
    markers: findMarkerRanges(body)
  };
}
