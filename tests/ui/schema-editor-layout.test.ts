import { describe, expect, it } from "vitest";
import { getSchemaEditorLabels } from "../../src/ui/schema-editor-layout";

describe("schema editor layout labels", () => {
  it("uses shorter chinese section labels for better readability", () => {
    const labels = getSchemaEditorLabels();

    expect(labels.basic).toBe("基本設定");
    expect(labels.required).toBe("必要欄位");
    expect(labels.optional).toBe("可選欄位");
    expect(labels.preview).toBe("YAML 預覽");
    expect(labels.key).toBe("Key");
    expect(labels.type).toBe("Type");
    expect(labels.default).toBe("Default");
    expect(labels.delete).toBe("刪除欄位");
  });
});
