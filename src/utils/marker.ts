export interface MarkerRange {
  id: string;
  start: number;
  end: number;
  raw: string;
}

export function buildStartMarker(id: string): string {
  return `<!-- schema:${id}:start -->`;
}

export function buildEndMarker(id: string): string {
  return `<!-- schema:${id}:end -->`;
}

export function findMarkerRanges(body: string): MarkerRange[] {
  const pattern = /<!-- schema:([a-z0-9-]+):start -->([\s\S]*?)<!-- schema:\1:end -->/g;
  const markers: MarkerRange[] = [];

  for (const match of body.matchAll(pattern)) {
    markers.push({
      id: match[1],
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      raw: match[0]
    });
  }

  return markers;
}
