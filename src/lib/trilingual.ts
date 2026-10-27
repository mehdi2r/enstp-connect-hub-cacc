export const RESPONSE_LANGUAGES = [
  { id: "fr", label: "Français", direction: "ltr" },
  { id: "en", label: "English", direction: "ltr" },
  { id: "ar", label: "العربية", direction: "rtl" },
] as const;

/** Accepts older unstructured history without pretending it is translated. */
export function splitTrilingual(text: string) {
  const headers = [...text.matchAll(/^##\s+(Français|English|العربية)\s*$/gm)];
  return RESPONSE_LANGUAGES.map((language) => {
    const index = headers.findIndex((header) => header[1] === language.label);
    const header = headers[index];
    if (!header || header.index === undefined) return { ...language, text: "" };
    const start = header.index + header[0].length;
    const next = headers[index + 1];
    return { ...language, text: text.slice(start, next?.index ?? text.length).trim() };
  });
}
