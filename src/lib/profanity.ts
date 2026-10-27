// Insults/curses in French, English, Arabic and Algerian Darija (Latin + Arabic script).
const LATIN = [
  // French
  "putain", "pute", "salope", "salaud", "connard", "connasse", "encule", "enculé", "nique", "niquer", "ntm", "fdp",
  "batard", "bâtard", "merde", "con", "conne", "pd", "tg", "ta gueule", "fils de pute", "bordel", "couille", "bite",
  // English
  "fuck", "fucking", "fucker", "shit", "bitch", "asshole", "bastard", "dick", "cunt", "whore", "slut", "motherfucker", "wtf", "stfu",
  // Darija (Latin / arabizi)
  "zebi", "zbi", "zeb", "nik", "nikmok", "nik mok", "nikomok", "qahba", "kahba", "9ahba", "9a7ba", "qa7ba", "zamel", "zamal",
  "tabon", "tbon", "t9awed", "tqawed", "mnayek", "manyak", "hmar", "7mar", "kelb", "kalb", "khra", "5ra", "zok", "zokk", "sowa", "nikmouk",
];
const ARABIC = [
  "زبي", "زب", "نيك", "نيكمك", "قحبة", "قحبه", "شرموطة", "شرموطه", "زامل", "طبون", "عاهرة", "كلب", "حمار", "خرا", "منيك",
  "منايك", "تقود", "يلعن", "لعنة", "حقير", "زك", "كس", "متناك", "ابن الكلب", "ولد القحبة",
];

const normLatin = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[@]/g, "a").replace(/\$/g, "s").replace(/(.)\1{2,}/g, "$1");
const normArabic = (s: string) =>
  s.replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/(.)\1{2,}/g, "$1");

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const latinRe = new RegExp(`(^|[^a-z0-9])(${[...new Set(LATIN.map(normLatin))].map(esc).join("|")})(?=$|[^a-z0-9])`, "i");
const arabicRe = new RegExp(`(^|[^\\u0621-\\u064A])(${ARABIC.map(normArabic).map(esc).join("|")})(?=$|[^\\u0621-\\u064A])`);

/** True when the text contains a curse/insult in FR, EN, AR or Darija. */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return latinRe.test(normLatin(text)) || arabicRe.test(normArabic(text));
}

export const PROFANITY_MSG = {
  fr: "Votre message contient un langage inapproprié. Merci de le reformuler.",
  en: "Your message contains inappropriate language. Please rephrase it.",
  ar: "رسالتك تحتوي على كلمات غير لائقة. يرجى إعادة صياغتها.",
} as const;
