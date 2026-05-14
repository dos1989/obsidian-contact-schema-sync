import { describe, expect, it } from "vitest";
import { validateSettingsPaths } from "../../src/ui/settings-validation";

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

  it("reports missing or mismatched paths", () => {
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

    expect(result).toEqual([
      "Contacts folder 必須指向資料夾：Contacts",
      "Schema YAML path 不存在：_config/contact-schema.yaml"
    ]);
  });
});
