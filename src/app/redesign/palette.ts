export const PALETTES = ["tangerine", "cobalt", "coral"] as const;

export type Palette = (typeof PALETTES)[number];

export function parsePalette(value: string | undefined | null): Palette {
  if (value === "cobalt" || value === "coral" || value === "tangerine") return value;
  return "tangerine";
}
