export interface PendingContactCreate {
  path: string;
  content: string;
}

export function buildStartupBaseline(paths: string[]): Set<string> {
  return new Set(paths);
}

export function isTrueNewContactFile(path: string, baseline: Set<string>): boolean {
  return !baseline.has(path);
}

export function enqueuePendingContact(pending: Map<string, string>, path: string, content: string): void {
  if (!pending.has(path)) {
    pending.set(path, content);
  }
}

export function takePendingContacts(pending: Map<string, string>): PendingContactCreate[] {
  const items = Array.from(pending.entries()).map(([path, content]) => ({ path, content }));
  pending.clear();
  return items;
}
