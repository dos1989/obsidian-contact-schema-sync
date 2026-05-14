import type { PluginSettings } from "../types";
import { hasDraftChanges } from "./settings-state";

export function canRunSettingsSync(
  saved: PluginSettings,
  draft: PluginSettings
): { allowed: true } | { allowed: false; reason: string } {
  if (hasDraftChanges(saved, draft)) {
    return {
      allowed: false,
      reason: "有未儲存設定，請先套用設定。"
    };
  }

  return { allowed: true };
}
