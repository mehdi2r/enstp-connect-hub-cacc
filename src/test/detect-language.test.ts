import { describe, expect, it } from "vitest";
import { detectLanguage } from "@/lib/detect-language";

describe("detectLanguage", () => {
  it("detects French", () => expect(detectLanguage("Où est la salle 12 ?")).toBe("fr"));
  it("detects English", () => expect(detectLanguage("Where is the library?")).toBe("en"));
  it("detects Arabic", () => expect(detectLanguage("أين المكتبة؟")).toBe("ar"));
  it("falls back when unclear", () => expect(detectLanguage("Amphi A", "en")).toBe("en"));
});
