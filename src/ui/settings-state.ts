import type { PluginSettings } from "../types";

export function cloneSettingsDraft(settings: PluginSettings): PluginSettings {
  return { ...settings };
}

export function hasDraftChanges(saved: PluginSettings, draft: PluginSettings): boolean {
  return JSON.stringify(saved) !== JSON.stringify(draft);
}
