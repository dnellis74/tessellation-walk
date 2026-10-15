export const TERRACOTTA = { r: 198, g: 93, b: 59 } as const
export const POWDER_BLUE = { r: 176, g: 224, b: 230 } as const

export type RGB = { r: number; g: number; b: number }

export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  const u = Math.min(1, Math.max(0, t))
  return {
    r: Math.round(a.r + (b.r - a.r) * u),
    g: Math.round(a.g + (b.g - a.g) * u),
    b: Math.round(a.b + (b.b - a.b) * u),
  }
}

export function rgbToCss(c: RGB): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`
}

/** Age 0 = terracotta (fresh); age >= 1 = powder blue (fully aged). */
export function ageToColor(normalizedAge: number): string {
  return rgbToCss(lerpColor(TERRACOTTA, POWDER_BLUE, normalizedAge))
}
