/**
 * VastraShastra Colour Theory & Skin Harmony Engine
 * Applies optical physics, WCAG luminance contrast, and classical Indian colour theory
 * to evaluate garment colours against human body skin tones.
 */

export interface SkinTone {
  id: string
  name: string
  hex: string
  undertone: "cool" | "warm" | "neutral"
  description: string
}

export const SKIN_TONES: SkinTone[] = [
  { id: "fair-cool", name: "Fair Porcelain", hex: "#FDDCB5", undertone: "cool", description: "Pink/rosy cool undertones; high contrast with deep jewel tones." },
  { id: "light-neutral", name: "Light Ivory", hex: "#F0C08A", undertone: "neutral", description: "Balanced neutral undertone; pairs well with soft pastels and terracotta." },
  { id: "wheatish-warm", name: "Wheatish Golden", hex: "#D4956A", undertone: "warm", description: "Golden peachy undertone typical of Central/Northern India; pairs with emerald, mustard, and madder." },
  { id: "medium-warm", name: "Medium Amber", hex: "#C07B52", undertone: "warm", description: "Warm radiant amber; excels in royal sapphire, rich maroon, and metallic zari." },
  { id: "olive-neutral", name: "Olive Sandalwood", hex: "#9C6644", undertone: "neutral", description: "Subtle green/olive neutral undertones; harmonizes with coral, turmeric, and antique gold." },
  { id: "deep-warm", name: "Deep Bronze", hex: "#7D4E3D", undertone: "warm", description: "Deep golden-bronze; striking contrast with vibrant fuchsia, bright ivory, and royal peacock teal." },
  { id: "rich-espresso", name: "Rich Espresso", hex: "#4A2C2A", undertone: "cool", description: "Deep luminous dark tone; extraordinary contrast with canary gold, bright emerald, and pearl cream." }
]

export interface Rgb { r: number; g: number; b: number }
export interface Hsl { h: number; s: number; l: number }

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "").trim()
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break
      case gNorm: h = (bNorm - rNorm) / d + 2; break
      case bNorm: h = (rNorm - gNorm) / d + 4; break
    }
    h = Math.round(h * 60)
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hNorm = (h % 360 + 360) % 360 / 360
  const sNorm = s / 100
  const lNorm = l / 100

  if (sNorm === 0) {
    const v = Math.round(lNorm * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tNorm = t
    if (tNorm < 0) tNorm += 1
    if (tNorm > 1) tNorm -= 1
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm
    if (tNorm < 1 / 2) return q
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6
    return p
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
  const p = 2 * lNorm - q
  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255)
  }
}

/**
 * Calculates WCAG 2.1 relative luminance for contrast ratios
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const a = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

/**
 * Calculates Contrast Ratio (CR) between two hex colours
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter colour
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1)
  const l2 = getRelativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return +((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}

/**
 * Generates an optical harmony palette based on classical colour theory
 */
export function generateHarmonyPalette(
  baseHex: string,
  mode: "analogous" | "complementary" | "triadic" | "split-complementary" | "monochromatic"
): string[] {
  const rgb = hexToRgb(baseHex)
  const hsl = rgbToHsl(rgb)

  switch (mode) {
    case "analogous":
      return [
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h - 30 + 360) % 360 })),
        baseHex,
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 30) % 360 }))
      ]
    case "complementary":
      return [
        baseHex,
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360, s: Math.min(100, hsl.s + 10) }))
      ]
    case "triadic":
      return [
        baseHex,
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 120) % 360 })),
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 240) % 360 }))
      ]
    case "split-complementary":
      return [
        baseHex,
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 150) % 360 })),
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 210) % 360 }))
      ]
    case "monochromatic":
      return [
        rgbToHex(hslToRgb({ ...hsl, l: Math.min(92, hsl.l + 25), s: Math.max(15, hsl.s - 20) })),
        baseHex,
        rgbToHex(hslToRgb({ ...hsl, l: Math.max(15, hsl.l - 25), s: Math.min(100, hsl.s + 15) }))
      ]
    default:
      return [baseHex]
  }
}

export interface SkinHarmonyAnalysis {
  skinTone: SkinTone
  contrastRatio: number
  harmonyVerdict: "Flawless Harmony" | "Strong & Radiant" | "Subtle Tonal" | "Low Contrast (Washout Risk)"
  score: number // 0 to 100
  critique: string
  suggestedAccentHex: string
}

/**
 * Evaluates how harmoniously a dress primary colour pairs with a chosen skin tone
 */
export function evaluateSkinAndDressHarmony(dressHex: string, skin: SkinTone): SkinHarmonyAnalysis {
  const cr = calculateContrastRatio(dressHex, skin.hex)
  const dressHsl = rgbToHsl(hexToRgb(dressHex))
  const isWarmHue = dressHsl.h < 70 || dressHsl.h > 330 || (dressHsl.h >= 70 && dressHsl.h <= 95) // Red, Orange, Amber, Warm Yellow

  let score = 50
  let verdict: SkinHarmonyAnalysis["harmonyVerdict"] = "Subtle Tonal"
  let critique = ""

  // Contrast scoring
  if (cr >= 4.5) {
    score += 35
    verdict = "Flawless Harmony"
    critique = `Exceptional visual pop with a contrast ratio of ${cr}:1. The dress illuminates ${skin.name} without optical vibration.`
  } else if (cr >= 2.8) {
    score += 25
    verdict = "Strong & Radiant"
    critique = `Balanced elegance (${cr}:1 contrast). Creates a refined ethnic silhouette that complements ${skin.name}'s ${skin.undertone} undertone.`
  } else if (cr >= 1.6) {
    score += 10
    verdict = "Subtle Tonal"
    critique = `Gentle monochrome contrast (${cr}:1). For evening couture, consider adding a metallic zari or jewel border to define neckline edges.`
  } else {
    score -= 20
    verdict = "Low Contrast (Washout Risk)"
    critique = `Very low contrast (${cr}:1). The garment value is too close to ${skin.name}, creating a visual blending effect. Add a contrasting border or dupatta.`
  }

  // Undertone alignment bonus
  if (skin.undertone === "warm" && isWarmHue) {
    score += 15
    critique += " The warm hues resonate naturally with the golden undertone."
  } else if (skin.undertone === "cool" && !isWarmHue) {
    score += 15
    critique += " The jewel cool tone flatters the porcelain undertone."
  } else {
    score += 10 // Dynamic complementary contrast
  }

  score = Math.min(100, Math.max(10, score))
  const suggestedAccentHex = generateHarmonyPalette(dressHex, "complementary")[1] || "#e8b547"

  return {
    skinTone: skin,
    contrastRatio: cr,
    harmonyVerdict: verdict,
    score,
    critique,
    suggestedAccentHex
  }
}
