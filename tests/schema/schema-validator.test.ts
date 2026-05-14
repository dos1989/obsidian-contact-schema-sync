import { describe, expect, it } from "vitest";
import { validateSchema } from "../../src/schema/schema-validator";
import type { ContactSchema } from "../../src/types";

const validSchema: ContactSchema = {
  version: 1,
  noteType: "contact",
  frontmatter: {
    required: [{ key: "name", type: "string", default: "" }],
    optional: [{ key: "birthday", type: "date", default: "" }]
  },
  sections: [
    { id: "basic-info", heading: "Basic Info", level: 2, managed: true, template: "- Name:" }
  ]
};

describe("validateSchema", () => {
  it("accepts a valid schema", () => {
    expect(() => validateSchema(validSchema)).not.toThrow();
  });

  it("rejects duplicate field keys", () => {
    const schema: ContactSchema = {
      ...validSchema,
      frontmatter: {
        required: [{ key: "name", type: "string", default: "" }],
        optional: [{ key: "name", type: "string", default: "" }]
      }
    };

    expect(() => validateSchema(schema)).toThrow("Duplicate frontmatter field key: name");
  });

  it("rejects duplicate section ids", () => {
    const schema: ContactSchema = {
      ...validSchema,
      sections: [
        { id: "basic-info", heading: "Basic Info", level: 2, managed: true, template: "" },
        { id: "basic-info", heading: "Other", level: 2, managed: true, template: "" }
      ]
    };

    expect(() => validateSchema(schema)).toThrow("Duplicate section id: basic-info");
  });
});
