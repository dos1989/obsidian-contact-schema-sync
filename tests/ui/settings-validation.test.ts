import { describe, expect, it } from "vitest";
import { getMissingCreatablePaths, validateSettingsPaths } from "../../src/ui/settings-validation";

describe("validateSettingsPaths", () => {
  it("returns no errors when all required paths exist with expected types", () => {
    const result = validateSettingsPaths(
      {
        contactsFolder: "Contacts",
        schemaYamlPath: "_config/contact-schema.yaml",
        schemaDocPath: "_config/contact-schema.md"
      },
      [
        { path: "Contacts", type: "folder" },
        { path: "_config/contact-schema.yaml", type: "file" },
        { path: "_config/contact-schema.md", type: "file" }
      ]
    );

    expect(result).toEqual([]);
  });

  it("reports only type mismatches as hard validation errors", () => {
    const result = validateSettingsPaths(
      {
        contactsFolder: "Contacts",
        schemaYamlPath: "_config/contact-schema.yaml",
        schemaDocPath: "_config/contact-schema.md"
      },
      [
        { path: "Contacts", type: "file" },
        { path: "_config/contact-schema.md", type: "file" }
      ]
    );

    expect(result).toEqual(["Contacts folder 必須指向資料夾：Contacts"]);
  });
});

describe("getMissingCreatablePaths", () => {
  it("returns missing folder and files that can be created on apply", () => {
    const result = getMissingCreatablePaths(
      {
        contactsFolder: "Contacts",
        schemaYamlPath: "_config/contact-schema.yaml",
        schemaDocPath: "_config/contact-schema.md"
      },
      [{ path: "_config/contact-schema.md", type: "file" }]
    );

    expect(result).toEqual([
      { kind: "folder", label: "Contacts folder", path: "Contacts" },
      { kind: "file", label: "Schema YAML path", path: "_config/contact-schema.yaml" }
    ]);
  });
});
