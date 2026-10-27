import { describe, expect, it } from "vitest";
import { splitTrilingual } from "@/lib/trilingual";

describe("Trilingual responses", () => {
  it("separates translations and applies Arabic direction", () => {
    const sections = splitTrilingual("## Français\nBonjour\n## English\nHello\n## العربية\nمرحبا");
    expect(sections.map((section) => section.text)).toEqual(["Bonjour", "Hello", "مرحبا"]);
    expect(sections[2]?.direction).toBe("rtl");
  });
  it("supports streaming without copying one language into another", () => {
    expect(splitTrilingual("## Français\nBonjour").map((section) => section.text)).toEqual([
      "Bonjour",
      "",
      "",
    ]);
  });
  it("does not invent translations for old history", () => {
    expect(splitTrilingual("Bonjour").every((section) => section.text === "")).toBe(true);
  });
});
