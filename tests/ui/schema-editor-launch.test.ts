import { describe, expect, it } from "vitest";
import { shouldCreateSchemaBeforeOpening } from "../../src/ui/schema-editor-launch";

describe("schema editor launch helpers", () => {
  it("asks to create schema when yaml path is missing", () => {
    expect(
      shouldCreateSchemaBeforeOpening(
        "1. index/1. System/_config/contact-schema.yaml",
        [{ path: "Contacts", type: "folder" }]
      )
    ).toBe(true);
  });

  it("does not ask to create schema when yaml file already exists", () => {
    expect(
      shouldCreateSchemaBeforeOpening(
        "1. index/1. System/_config/contact-schema.yaml",
        [{ path: "1. index/1. System/_config/contact-schema.yaml", type: "file" }]
      )
    ).toBe(false);
  });
});
