import { StarEntry } from "./types";

// Parse a simple TSV/CSV star catalog into StarEntry[]
export function parseCatalog(text: string): StarEntry[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const sep = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes(",")
    ? ","
    : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());

  const lookup = (keys: RegExp[]) => {
    for (let i = 0; i < headers.length; i++) {
      if (keys.some((k) => k.test(headers[i]))) return i;
    }
    return -1;
  };

  const raIdx = lookup([/\bra\b/, /ra_deg/]);
  const decIdx = lookup([/\bdec\b/, /dec_deg/]);
  const magIdx = lookup([/\bmag\b/, /vmag\b/, /m_v\b/]);
  const bvIdx = lookup([/\bbv\b/, /b-?v/]);

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(sep).map((c) => c.trim());
      const ra = parseFloat(cols[raIdx] ?? "NaN");
      const dec = parseFloat(cols[decIdx] ?? "NaN");
      const mag = parseFloat(cols[magIdx] ?? "NaN");
      const bv = bvIdx >= 0 ? parseFloat(cols[bvIdx] ?? "NaN") : undefined;
      return { ra, dec, mag, bv } as StarEntry;
    })
    .filter((s) => isFinite(s.ra) && isFinite(s.dec) && isFinite(s.mag));
}

export async function loadCatalog(url: string): Promise<StarEntry[]> {
  const res = await fetch(url);
  const txt = await res.text();
  return parseCatalog(txt);
}
