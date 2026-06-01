import { rangesOverlap } from "../../lib/availability/slots";
import { describe, expect, it } from "vitest";

describe("rangesOverlap", () => {
  it("detects partial overlap", () => {
    expect(
      rangesOverlap(
        { start: "10:00", end: "10:30" },
        { start: "10:15", end: "10:45" },
      ),
    ).toBe(true);
  });

  it("allows back-to-back slots", () => {
    expect(
      rangesOverlap(
        { start: "10:00", end: "10:30" },
        { start: "10:30", end: "11:00" },
      ),
    ).toBe(false);
  });
});
