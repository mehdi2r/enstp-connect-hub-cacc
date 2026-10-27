// Official ENSTP class structure (S1 2026/2027), used by the timetable filters and the assistant.
export type Unit = { value: string; label: string };
export type Structure = { summary: string; unitName: string; units: Unit[]; note?: string; promo?: boolean };

const range = (n: number, label: (i: number) => string, value = (i: number) => String(i)) =>
  Array.from({ length: n }, (_, k) => ({ value: value(k + 1), label: label(k + 1) }));

const roomNote =
  "Particularité DIB : dans le planning, les en-têtes de colonnes sont des numéros de salles, mais les colonnes sont toujours les groupes dans l’ordre 1, 2, 3, 4 de gauche à droite. La salle affichée sur chaque cours est celle de votre groupe pour ce créneau.";

export const STRUCTURE: Record<string, Structure> = {
  CP1: { summary: "1ère année Prépa : 10 groupes répartis sur 2 sections", unitName: "Groupe", units: range(10, (i) => `Groupe ${i}`) },
  CP2: { summary: "2ème année Prépa : 12 groupes répartis sur 2 sections", unitName: "Groupe", units: range(12, (i) => `Groupe ${i}`) },
  DIB1: {
    summary: "3ème année DIB : 4 groupes — colonnes 1, 2, 3, 4 de gauche à droite (en-têtes = salles)",
    unitName: "Groupe",
    units: range(4, (i) => `Groupe ${i}`),
    note: roomNote,
  },
  DMS1: { summary: "3ème année DMS : 4 groupes / sections", unitName: "Section", units: range(4, (i) => `Section ${i}`, (i) => `SEC ${i}`) },
  DIB2: {
    summary: "4ème année DIB : 2 sections — colonnes 1, 2 de gauche à droite (en-têtes = salles)",
    unitName: "Section",
    units: range(2, (i) => `Section ${i}`),
    note: roomNote,
  },
  DMS2: { summary: "4ème année DMS : 2 sections", unitName: "Section", units: range(2, (i) => `Section ${i}`, (i) => `Section 0${i}`) },
  DIB3: { summary: "5ème année DIB : 1 promo (promotion complète)", unitName: "Promo", units: [], promo: true },
  DMS3: { summary: "5ème année DMS : 1 promo (promotion complète)", unitName: "Promo", units: [], promo: true },
};

type S = { sections: string[] };
type Timed = S & { day: string; start: string };

/**
 * DIB timetables label columns with room numbers, but columns are always groups 1..N left to right.
 * Within each time slot, the k-th single-column session (in reading order) belongs to group k.
 * Slots with only one, or more than N, single-column sessions are treated as common to everyone.
 */
export function normalizeSessions<T extends Timed>(group: string, sessions: T[]): T[] {
  if (group !== "DIB1" && group !== "DIB2") return sessions;
  const n = STRUCTURE[group]!.units.length;
  const slots = new Map<string, T[]>();
  for (const s of sessions) if (s.sections.length === 1) {
    const k = `${s.day}|${s.start}`;
    slots.set(k, [...(slots.get(k) ?? []), s]);
  }
  return sessions.map((s) => {
    if (s.sections.length !== 1) return { ...s, sections: [] };
    const slot = slots.get(`${s.day}|${s.start}`)!;
    if (slot.length < 2 || slot.length > n) return { ...s, sections: [] };
    return { ...s, sections: [String(slot.indexOf(s) + 1)] };
  });
}
/** A session applies to a unit when it lists it, or when it is common (no specific unit). */
export function sessionMatches(group: string, s: S, unit: string): boolean {
  const st = STRUCTURE[group];
  if (!unit || !st || st.promo) return true;
  const known = new Set(st.units.map((u) => u.value));
  const own = s.sections.filter((x) => known.has(x));
  return own.length === 0 || own.includes(unit);
}

export const STRUCTURE_TEXT = Object.entries(STRUCTURE)
  .map(([id, s]) => `- ${id} : ${s.summary}${s.note ? ` (${s.note})` : ""}`)
  .join("\n");
