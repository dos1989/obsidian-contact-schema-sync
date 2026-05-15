export function isPathInsideContactsFolder(path: string, contactsFolder: string): boolean {
  return path.startsWith(`${contactsFolder}/`);
}

export function isBlankContactNoteContent(content: string): boolean {
  return content.trim().length === 0;
}
