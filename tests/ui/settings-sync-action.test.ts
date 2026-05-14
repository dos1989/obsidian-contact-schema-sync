import { describe, expect, it } from "vitest";
import { canRunSettingsSync } from "../../src/ui/settings-sync-action";
import { DEFAULT_SETTINGS } from "../../src/settings";

describe("settings sync action", () => {
  it("blocks sync when settings draft has unsaved changes", () => {
    const draft = { ...DEFAULT_SETTINGS, contactsFolder: "People" };
    expect(canRunSettingsSync(DEFAULT_SETTINGS, draft)).toEqual({
      allowed: false,
      reason: "有未儲存設定，請先套用設定。"
    });
  });

  it("allows sync when draft matches saved settings", () => {
    expect(canRunSettingsSync(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS })).toEqual({
      allowed: true
    });
  });
});
