import { describe, expect, it } from "vitest";
import { parsePalette } from "./palette";

describe("parsePalette", () => {
  it("accepts the three prototype palettes and defaults otherwise", () => {
    expect(parsePalette("tangerine")).toBe("tangerine");
    expect(parsePalette("cobalt")).toBe("cobalt");
    expect(parsePalette("coral")).toBe("coral");
    expect(parsePalette(undefined)).toBe("tangerine");
    expect(parsePalette("pulse")).toBe("tangerine");
  });
});
