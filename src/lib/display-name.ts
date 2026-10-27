export type NameParts = {
  first_name?: string | null;
  last_name?: string | null;
  academic_year?: number | null;
  specialty?: string | null;
};

export function yearLabel(y: number | null | undefined): string {
  if (!y) return "";
  return y === 1 ? "1ère année" : `${y}ème année`;
}

/** "[Prénom] [Nom] • [Année] [Spécialité]" — Prépa for years 1–2. */
export function displayName(p: NameParts | null | undefined, fallback = ""): string {
  if (!p) return fallback;
  const who = `${(p.first_name ?? "").trim()} ${(p.last_name ?? "").trim()}`.trim();
  if (!who) return fallback;
  const y = p.academic_year;
  if (!y) return who;
  const spec = y <= 2 ? "Prépa" : (p.specialty ?? "");
  return `${who} • ${[yearLabel(y), spec].filter(Boolean).join(" ")}`;
}

export function isProfileComplete(p: NameParts | null | undefined): boolean {
  return !!(
    p &&
    p.first_name?.trim() &&
    p.last_name?.trim() &&
    p.academic_year &&
    p.academic_year >= 1 &&
    p.academic_year <= 5 &&
    (p.academic_year <= 2 || p.specialty === "DIB" || p.specialty === "DMS")
  );
}
