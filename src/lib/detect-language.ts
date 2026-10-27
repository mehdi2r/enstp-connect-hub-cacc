export type Lang = "fr" | "en" | "ar";

const FR = /\b(je|tu|le|la|les|des|est|où|ou|quel|quelle|salle|bonjour|salut|merci|comment|pour|avec|mon|ma|une|un|qui|que|pas|c'est|j'ai)\b/gi;
const EN = /\b(i|you|the|is|are|where|what|which|room|hello|hi|thanks|how|for|with|my|a|an|who|not|it's|do|can)\b/gi;

/** Detects the user's language from their own text; falls back to the browser language. */
export function detectLanguage(text: string, fallback: Lang = "fr"): Lang {
  const t = text.trim();
  if (!t) return fallback;
  const arabic = (t.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latin = (t.match(/[a-zA-ZÀ-ÿ]/g) ?? []).length;
  if (arabic > latin) return "ar";
  const fr = (t.match(FR) ?? []).length + (t.match(/[éèêàçùœ]/gi) ?? []).length;
  const en = (t.match(EN) ?? []).length;
  if (fr === en) return fallback;
  return fr > en ? "fr" : "en";
}

export function browserLanguage(): Lang {
  if (typeof navigator === "undefined") return "fr";
  const l = navigator.language.slice(0, 2);
  return l === "ar" || l === "en" ? l : "fr";
}

export const LANG_NAME: Record<Lang, string> = {
  fr: "français",
  en: "English",
  ar: "العربية (arabe standard moderne)",
};

export const UI_TEXT: Record<Lang, { hello: string; ask: string; thinking: string; placeholder: string; idle: string }> = {
  fr: {
    hello: "Salut ! Où est ta salle ? À qui t’adresser ? Pose-moi ta question.",
    ask: "Pose-moi ta question !",
    thinking: "Je réfléchis…",
    placeholder: "Écris ta question…",
    idle: "Pose-moi ta question !",
  },
  en: {
    hello: "Hi! Where is your classroom? Who should you contact? Ask me your question.",
    ask: "Ask me anything!",
    thinking: "Thinking…",
    placeholder: "Type your question…",
    idle: "Ask me anything!",
  },
  ar: {
    hello: "مرحبًا! أين قاعتك؟ إلى من تتوجه؟ اطرح سؤالك.",
    ask: "اطرح سؤالك!",
    thinking: "أفكّر…",
    placeholder: "اكتب سؤالك…",
    idle: "اطرح سؤالك!",
  },
};
