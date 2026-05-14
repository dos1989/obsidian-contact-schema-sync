import { describe, expect, it } from "vitest";
import { buildDefaultSchemaDoc, buildDefaultSchemaYaml } from "../../src/ui/settings-creation";

describe("settings creation helpers", () => {
  it("builds a minimal default schema yaml", () => {
    expect(buildDefaultSchemaYaml()).toContain("version: 1");
    expect(buildDefaultSchemaYaml()).toContain("noteType: contact");
    expect(buildDefaultSchemaYaml()).toContain("key: name");
  });

  it("builds a default schema doc", () => {
    expect(buildDefaultSchemaDoc()).toContain("# Contact Schema");
  });
});
