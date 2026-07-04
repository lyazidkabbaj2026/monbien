// Comparateur de quartiers : /comparer/[ville]/[a]-vs-[b]
// Convention canonique : slugs triés alphabétiquement (a < b).

export function duoSlug(a: string, b: string): string {
  const [first, second] = [a, b].sort();
  return `${first}-vs-${second}`;
}

/** "agdal-vs-hay-riad" -> ["agdal", "hay-riad"] — null si malformé. */
export function parseDuo(duo: string): [string, string] | null {
  const parts = duo.split("-vs-");
  if (parts.length !== 2 || !parts[0] || !parts[1] || parts[0] === parts[1]) {
    return null;
  }
  return [parts[0], parts[1]];
}

/** Toutes les paires canoniques d'une liste de slugs de quartiers. */
export function allPairs(slugs: string[]): [string, string][] {
  const sorted = [...slugs].sort();
  const pairs: [string, string][] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      pairs.push([sorted[i], sorted[j]]);
    }
  }
  return pairs;
}
