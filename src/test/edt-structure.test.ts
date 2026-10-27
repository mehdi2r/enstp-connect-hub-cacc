import { describe, it, expect } from "vitest";
import { STRUCTURE, normalizeSessions, sessionMatches } from "@/lib/edt-structure";
describe("ENSTP structure", () => {
  it("1ère année prépa has 10 groups", () => expect(STRUCTURE["CP1"]!.units).toHaveLength(10));
  it("2ème année prépa has 12 groups", () => expect(STRUCTURE["CP2"]!.units).toHaveLength(12));
  it("3ème année DMS has 4 sections", () => expect(STRUCTURE["DMS1"]!.units).toHaveLength(4));
  it("4ème année DMS has 2 sections", () => expect(STRUCTURE["DMS2"]!.units).toHaveLength(2));
  it("5ème année is one promo", () => { expect(STRUCTURE["DIB3"]!.promo).toBe(true); expect(STRUCTURE["DMS3"]!.promo).toBe(true); });
  it("filters other groups out", () => {
    expect(sessionMatches("CP1", { sections: ["3"] }, "4")).toBe(false);
    expect(sessionMatches("CP1", { sections: ["3"] }, "3")).toBe(true);
    expect(sessionMatches("CP1", { sections: [] }, "3")).toBe(true);
  });
});
describe("DIB columns are groups left to right", () => {
  it("assigns Sunday 8h rooms 7, 8, 9, 25 to groups 1-4", () => {
    const rows = ["7", "8", "9", "25"].map((r) => ({ day: "Sunday", start: "08h00", sections: [r] }));
    expect(normalizeSessions("DIB1", rows).map((s) => s.sections[0])).toEqual(["1", "2", "3", "4"]);
  });
  it("other rooms follow the same order (Tuesday 6, 7, 8, 9)", () => {
    const rows = ["6", "7", "8", "9"].map((r) => ({ day: "Tuesday", start: "08h00", sections: [r] }));
    expect(normalizeSessions("DIB1", rows).map((s) => s.sections[0])).toEqual(["1", "2", "3", "4"]);
  });
});
