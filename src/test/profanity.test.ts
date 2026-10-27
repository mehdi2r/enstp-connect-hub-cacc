import { describe, expect, it } from "vitest";
import { containsProfanity } from "@/lib/profanity";

describe("containsProfanity", () => {
  it("blocks French", () => expect(containsProfanity("Espèce de CONNARD")).toBe(true));
  it("blocks English", () => expect(containsProfanity("what the fuck")).toBe(true));
  it("blocks Arabic", () => expect(containsProfanity("يا قحبة")).toBe(true));
  it("blocks Darija arabizi", () => expect(containsProfanity("nikmok 3la had l'exam")).toBe(true));
  it("allows normal text", () => expect(containsProfanity("Qui a le cours de Chimie 3 ? Merci, la classe est super")).toBe(false));
  it("allows words containing a curse substring", () => expect(containsProfanity("Le concours de Constantine")).toBe(false));
});
