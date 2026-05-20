export function buildExistingContactsSummary(count: number): string | null {
  if (count <= 0) {
    return null;
  }

  return `偵測到 ${count} 份 existing contacts 可更新，請手動按「預覽並同步 Contacts」。`;
}
