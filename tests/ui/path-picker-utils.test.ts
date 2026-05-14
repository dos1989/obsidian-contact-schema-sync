import { describe, expect, it } from "vitest";
import { filterSelectablePaths, sortSelectablePaths } from "../../src/ui/path-picker-utils";

describe("filterSelectablePaths", () => {
  const items = [
    { path: "z-folder", type: "folder" as const },
    { path: "A-folder", type: "folder" as const },
    { path: "_config/contact-schema.yaml", type: "file" as const },
    { path: "_config/contact-schema.yml", type: "file" as const },
    { path: "_config/contact-schema.md", type: "file" as const },
    { path: "notes/random.txt", type: "file" as const }
  ];

  it("returns only folders in folder mode", () => {
    expect(filterSelectablePaths(items, { mode: "folder" }).map((item) => item.path)).toEqual([
      "z-folder",
      "A-folder"
    ]);
  });

  it("filters files by extension", () => {
    expect(
      filterSelectablePaths(items, { mode: "file", allowedExtensions: ["yaml", "yml"] }).map((item) => item.path)
    ).toEqual(["_config/contact-schema.yaml", "_config/contact-schema.yml"]);
  });
});

describe("sortSelectablePaths", () => {
  it("sorts folders before files and then alphabetically", () => {
    const items = [
      { path: "z-folder", type: "folder" as const },
      { path: "b-file.md", type: "file" as const },
      { path: "A-folder", type: "folder" as const },
      { path: "a-file.md", type: "file" as const }
    ];

    expect(sortSelectablePaths(items).map((item) => `${item.type}:${item.path}`)).toEqual([
      "folder:A-folder",
      "folder:z-folder",
      "file:a-file.md",
      "file:b-file.md"
    ]);
  });
});
