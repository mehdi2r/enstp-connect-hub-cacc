import cp from "@/assets/edt-cp.pdf.asset.json";
import cp1 from "@/assets/edt-CP_0-2.jpg.asset.json";
import cp2 from "@/assets/edt-CP_0-1.jpg.asset.json";
import dib1 from "@/assets/edt-DIB-1.jpg.asset.json";
import dib2 from "@/assets/edt-DIB-2.jpg.asset.json";
import dib3 from "@/assets/edt-DIB-3.jpg.asset.json";
import dms1 from "@/assets/edt-DMS-1.jpg.asset.json";
import dms2 from "@/assets/edt-DMS-2.jpg.asset.json";
import dms3 from "@/assets/edt-DMS-3.jpg.asset.json";
import dib from "@/assets/edt-dib.pdf.asset.json";
import dms from "@/assets/edt-dms.pdf.asset.json";

export const DEPTS = {
  DIB: "Département des Infrastructures et du Bâtiment",
  DMS: "Département Matériaux et Structures",
} as const;

export type Group = { id: string; label: string; pdf: string; page: number; img: string };

export const GROUPS: Group[] = [
  { id: "CP1", label: "1ère année · Classe Préparatoire", pdf: cp.url, page: 2, img: cp1.url },
  { id: "CP2", label: "2ème année · Classe Préparatoire", pdf: cp.url, page: 1, img: cp2.url },
  { id: "DIB1", label: "DIB · 1ère année ingénieur (3ème année)", pdf: dib.url, page: 1, img: dib1.url },
  { id: "DIB2", label: "DIB · 2ème année ingénieur (4ème année)", pdf: dib.url, page: 2, img: dib2.url },
  { id: "DIB3", label: "DIB · 3ème année ingénieur (5ème année)", pdf: dib.url, page: 3, img: dib3.url },
  { id: "DMS1", label: "DMS · 1ère année ingénieur (3ème année)", pdf: dms.url, page: 1, img: dms1.url },
  { id: "DMS2", label: "DMS · 2ème année ingénieur (4ème année)", pdf: dms.url, page: 2, img: dms2.url },
  { id: "DMS3", label: "DMS · 3ème année ingénieur (5ème année)", pdf: dms.url, page: 3, img: dms3.url },
];

export function groupFor(year: number | null, specialty: string | null): string {
  if (!year || year <= 1) return "CP1";
  if (year === 2) return "CP2";
  return `${specialty === "DMS" ? "DMS" : "DIB"}${year - 2}`;
}

export type Place = {
  id: string;
  name: string;
  kind: "Amphi" | "Salle" | "Labo" | "Bibliothèque" | "Sport" | "Administration";
  zone: string;
  steps: string[];
};

// Directions are indicative until the official campus plan is added.
export const PLACES: Place[] = [
  { id: "amphi-a", name: "Amphithéâtre A", kind: "Amphi", zone: "Bloc pédagogique central", steps: ["Entrée principale : avancez tout droit dans l’allée centrale.", "Au bloc pédagogique, entrez par la grande porte.", "L’Amphi A est à gauche du hall."] },
  { id: "amphi-b", name: "Amphithéâtre B", kind: "Amphi", zone: "Bloc pédagogique central", steps: ["Entrée principale : allée centrale jusqu’au bloc pédagogique.", "Dans le hall, prenez à droite.", "L’Amphi B est au bout du couloir."] },
  { id: "salles", name: "Salles de cours (1 → 25)", kind: "Salle", zone: "Bloc des salles", steps: ["Entrée principale : allée centrale.", "Dépassez les amphis et suivez les panneaux « Salles ».", "Les numéros sont affichés au-dessus de chaque porte (ex. Salle 13, Salle 19, Salle 22)."] },
  { id: "labo-phys", name: "Laboratoire de Physique", kind: "Labo", zone: "Bloc laboratoires", steps: ["Entrée principale, puis direction bloc laboratoires.", "Rez-de-chaussée, première porte."] },
  { id: "labo-chim", name: "Laboratoire de Chimie", kind: "Labo", zone: "Bloc laboratoires", steps: ["Entrée principale, puis direction bloc laboratoires.", "Rez-de-chaussée, à côté du labo de physique."] },
  { id: "labo-info", name: "Salle informatique", kind: "Labo", zone: "Bloc laboratoires", steps: ["Bloc laboratoires, premier étage.", "Demandez l’accès à l’agent si la porte est fermée."] },
  { id: "labo-meca", name: "Laboratoire de Mécanique / Sols", kind: "Labo", zone: "Halle d’essais", steps: ["Contournez le bloc laboratoires par l’arrière.", "La halle d’essais est le grand bâtiment au toit haut."] },
  { id: "biblio", name: "Bibliothèque", kind: "Bibliothèque", zone: "Près de l’administration", steps: ["Entrée principale, à droite vers l’administration.", "La bibliothèque est juste après le bâtiment administratif."] },
  { id: "sport", name: "Terrains de sport", kind: "Sport", zone: "Fond du campus", steps: ["Traversez tout le campus par l’allée centrale.", "Les terrains sont au fond, derrière les blocs pédagogiques."] },
  { id: "scolarite", name: "Scolarité / Administration", kind: "Administration", zone: "Bâtiment administratif", steps: ["Entrée principale, première à droite.", "Guichets de la scolarité au rez-de-chaussée."] },
];

export const ORG = [
  { title: "Direction de l’École", items: ["Directeur", "Conseil d’administration", "Conseil scientifique"] },
  { title: "Directions adjointes", items: ["Études et diplômes", "Post-graduation et recherche", "Relations extérieures et stages"] },
  { title: "Départements", items: ["Classes Préparatoires", `DIB — ${DEPTS.DIB}`, `DMS — ${DEPTS.DMS}`] },
  { title: "Services", items: ["Scolarité", "Bibliothèque", "Œuvres universitaires (bourse, résidence, transport)", "Médecine / santé", "Activités sportives et culturelles"] },
];

export const WHO_TO_ASK = [
  { problem: "Inscription, certificat de scolarité, carte étudiant", who: "Scolarité" },
  { problem: "Emploi du temps, absence d’un enseignant, changement de groupe", who: "Chef de département (CP, DIB ou DMS)" },
  { problem: "Notes, rattrapage, recours", who: "Direction adjointe des études" },
  { problem: "Bourse, résidence, transport", who: "Œuvres universitaires" },
  { problem: "Stage, convention, partenariats", who: "Relations extérieures" },
  { problem: "Santé, urgence", who: "Service médical" },
];

import { GUIDE_KB } from "./guide-kb";

export const SCHOOL_KNOWLEDGE = `
ENSTP (École Nationale Supérieure des Travaux Publics « Francis Jeanson »), Alger, Gué de Constantine (Kouba).
Fondée en 1966 (EITP), institut national d’enseignement supérieur en 1987 sous double tutelle (Enseignement supérieur & Travaux publics), statut d’école en 1998. Plus de 6 000 ingénieurs algériens et 300+ ingénieurs étrangers de 32 pays formés.
Cursus : 2 ans de Classes Préparatoires (maths, physique, chimie, mécanique rationnelle, informatique, électricité), puis 3 ans de cycle ingénieur. Départements : DIB = ${DEPTS.DIB} ; DMS = ${DEPTS.DMS}.
Lieux : ${PLACES.map((p) => `${p.name} (${p.zone}) : ${p.steps.join(" ")}`).join(" | ")}
Les itinéraires sont indicatifs (le plan officiel du campus n’est pas encore intégré).
Emplois du temps disponibles dans l’onglet « Où est ma salle ? » pour : ${GROUPS.map((g) => g.label).join(", ")}.
À qui s’adresser : ${WHO_TO_ASK.map((w) => `${w.problem} → ${w.who}`).join(" ; ")}.

Plateforme ENSTP Go : connexion par email (personnel ou d’école) + mot de passe ; à l’inscription on saisit prénom, nom, email, année et spécialité (DIB/DMS dès la 3ème année), puis un code à 6 chiffres reçu par email (bouton « Renvoyer le code », vérifier les spams). Accueil = le guide ; la carte « Salles & cours » ouvre « Où est ma salle ? » (emploi du temps selon le profil, téléchargement PDF, plein écran, recherche de lieux avec itinéraire) ; le lien « L’École » du menu ouvre la présentation (vidéo, histoire, organigramme, contacts). Déconnexion via le menu du guide. Pour modifier son année/spécialité, contacter le support (pas encore modifiable en ligne).
Contenu complet du guide :
${GUIDE_KB}
`;

/** Text itinerary between two places via the main entrance hub.
 *  Kept as a pure function so a graph-based campus map can replace it later. */
export function routeBetween(fromId: string, toId: string): string[] {
  const a = PLACES.find((p) => p.id === fromId);
  const b = PLACES.find((p) => p.id === toId);
  if (!a || !b) return [];
  if (a.id === b.id) return [`Vous êtes déjà à : ${a.name}.`];
  if (a.zone === b.zone)
    return [`Depuis ${a.name}, restez dans la zone « ${a.zone} ».`, ...b.steps.slice(-1)];
  return [
    `Sortez de ${a.name} (${a.zone}) et rejoignez l’allée centrale.`,
    ...b.steps.map((s) => s.replace(/^Entrée principale\s*[:,]?\s*/i, "")),
  ];
}
