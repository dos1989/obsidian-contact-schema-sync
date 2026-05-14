import { describe, expect, it } from "vitest";
import { isTFileLike, isTFolderLike } from "../../src/utils/obsidian-runtime";

describe("obsidian runtime guards", () => {
  it("detects file-like vault objects by shape", () => {
    const fileLike = {
      path: "a/b.md",
      basename: "b",
      extension: "md",
      stat: { ctime: 0, mtime: 0, size: 1 },
      parent: null
    };

    expect(isTFileLike(fileLike)).toBe(true);
    expect(isTFolderLike(fileLike)).toBe(false);
  });

  it("detects folder-like vault objects by shape", () => {
    const folderLike = {
      path: "a",
      name: "a",
      children: []
    };

    expect(isTFolderLike(folderLike)).toBe(true);
    expect(isTFileLike(folderLike)).toBe(false);
  });

  it("rejects null or unrelated values", () => {
    expect(isTFileLike(null)).toBe(false);
    expect(isTFolderLike(undefined)).toBe(false);
    expect(isTFileLike({ path: "x" })).toBe(false);
  });
});
