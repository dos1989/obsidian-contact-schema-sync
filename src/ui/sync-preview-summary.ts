export function getAffectedFileNames(notes: Array<{ path: string; changed: boolean }>): string[] {
  return notes
    .filter((note) => note.changed)
    .map((note) => note.path.split("/").pop() ?? note.path);
}
