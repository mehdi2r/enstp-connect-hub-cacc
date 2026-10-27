import { describe, expect, it } from "vitest";
import { displayName } from "@/lib/display-name";

describe("displayName", () => {
  it("formats engineering-cycle students with specialty", () => {
    expect(displayName({ first_name: "Rafik", last_name: "Bengrine", academic_year: 3, specialty: "DMS" })).toBe(
      "Rafik Bengrine • 3ème année DMS",
    );
  });
  it("shows Prépa for 1st year", () => {
    expect(displayName({ first_name: "Sarra", last_name: "Khiat", academic_year: 1, specialty: null })).toBe(
      "Sarra Khiat • 1ère année Prépa",
    );
  });
});
