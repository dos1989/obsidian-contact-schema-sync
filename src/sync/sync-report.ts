import type { NoteChangeSummary, SyncMode, SyncReport } from "../types";

export function buildReport(mode: SyncMode, notes: NoteChangeSummary[]): SyncReport {
  const updated = notes.filter((note) => note.changed).length;
  const unchanged = notes.filter((note) => !note.changed && note.warnings.length === 0).length;
  const conflicts = notes.filter((note) => note.warnings.length > 0).length;

  return {
    mode,
    total: notes.length,
    updated,
    unchanged,
    skipped: 0,
    conflicts,
    notes
  };
}
