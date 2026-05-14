import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/settings";
import { cloneSettingsDraft, hasDraftChanges } from "../../src/ui/settings-state";

describe("settings-state", () => {
  it("clones settings into an editable draft", () => {
    const draft = cloneSettingsDraft(DEFAULT_SETTINGS);
    expect(draft).toEqual(DEFAULT_SETTINGS);
    expect(draft).not.toBe(DEFAULT_SETTINGS);
  });

  it("detects unchanged draft state", () => {
    const draft = cloneSettingsDraft(DEFAULT_SETTINGS);
    expect(hasDraftChanges(DEFAULT_SETTINGS, draft)).toBe(false);
  });

  it("detects modified draft state", () => {
    const draft = cloneSettingsDraft(DEFAULT_SETTINGS);
    draft.contactsFolder = "People";
    expect(hasDraftChanges(DEFAULT_SETTINGS, draft)).toBe(true);
  });
});
