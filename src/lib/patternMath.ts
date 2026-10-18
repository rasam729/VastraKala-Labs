/**
 * VastraShastra Pattern Mathematics Engine
 * Translates human body measurements into balanced, wearable garment patterns.
 * Supports Indian Ethnic, Western, and Indo-Western Fusion blocks.
 */

export interface BodyMeasurements {
  bust: number        // Bust circumference (cm)
  waist: number       // Natural waist circumference (cm)
  hip: number         // Fullest hip circumference (cm)
  shoulder: number    // Shoulder tip to tip (cm)
  upper_arm?: number  // Bicep circumference (cm)
  wrist?: number      // Wrist circumference (cm)
  blouse_length?: number // Shoulder to waist/hem (cm)
  skirt_length?: number  // Waist to floor/ankle (cm)
  height?: number     // Stature in cm (default 165)
}

export interface FormulaResult {
  value: number
  unit: string
  formula: string
  latex?: string
  explanation: string
}

export interface PatternMathOutput {
  // Bodice Block Proportions
  quarterBustWithEase: FormulaResult
  quarterWaist: FormulaResult
  armholeDepth: FormulaResult
  singleDartIntake: FormulaResult
  princessSeamCurve: FormulaResult
  frontNeckDepth: FormulaResult
  backNeckDepth: FormulaResult
  halfShoulder: FormulaResult
  neckWidthHalf: FormulaResult
  sideSeamBodice: FormulaResult

  // Sleeve Block Proportions
  sleeveCapHeight: FormulaResult
  halfSleeveBicepWidth: FormulaResult

  // Skirt / Lehenga Volume Geometry
  lehengaPanelHemWidth: FormulaResult
  circleSkirtWaistRadius: FormulaResult
  halfCircleSkirtWaistRadius: FormulaResult
  estimatedFabricMeters: FormulaResult

  // Seam & Shrinkage Allowances
  standardSeamAllowance: FormulaResult
  cottonPreWashCutLength: FormulaResult
}

export const DEFAULT_MEASUREMENTS: BodyMeasurements = {
  bust: 88,
  waist: 72,
  hip: 96,
  shoulder: 38,
  upper_arm: 28,
  wrist: 16,
  blouse_length: 38,
  skirt_length: 102,
  height: 165
}

/**
 * Computes all technical drafting calculations from body measurements
 */
export function calculatePatternMath(m: BodyMeasurements = DEFAULT_MEASUREMENTS): PatternMathOutput {
  const bust = m.bust || 88
  const waist = m.waist || 72
  const hip = m.hip || 96
  const shoulder = m.shoulder || 38
  const upperArm = m.upper_arm || 28
  const blouseLen = m.blouse_length || 38
  const skirtLen = m.skirt_length || 102

  // 1. Armhole depth = Bust / 6 + 7 cm
  const armholeDepthVal = +(bust / 6 + 7).toFixed(1)
  
  // 2. Quarter bust with ease = Bust / 4 + 2.5 cm ease
  const quarterBustVal = +(bust / 4 + 2.5).toFixed(1)
  
  // 3. Quarter waist = Waist / 4
  const quarterWaistVal = +(waist / 4).toFixed(1)

  // 4. Single dart allowance = (Bust - Waist) / 8
  const dartVal = +Math.max(0, (bust - waist) / 8).toFixed(1)

  // 5. Princess seam shaping = (Bust - Waist) / 8 across 4 curves
  const princessCurveVal = +Math.max(0, (bust - waist) / 8).toFixed(1)

  // 6. Front neck depth = Bust / 10
  const fNeckVal = +(bust / 10).toFixed(1)

  // 7. Back neck depth = Bust / 20
  const bNeckVal = +(bust / 20).toFixed(1)

  // 8. Half shoulder width = Shoulder / 2 + 0.5 cm seam
  const halfShoulderVal = +(shoulder / 2 + 0.5).toFixed(1)

  // 9. Half neck width = Bust / 20 + 0.5 cm
  const halfNeckWidthVal = +(bust / 20 + 0.5).toFixed(1)

  // 10. Side seam width at waist = Quarter waist + 1.5 cm dart allowance + 1.5 cm seam
  const sideSeamVal = +(waist / 4 + 1.5 + 1.5).toFixed(1)

  // 11. Sleeve cap height = Armhole depth - 3 cm
  const sleeveCapVal = +(armholeDepthVal - 3).toFixed(1)

  // 12. Half sleeve bicep width = Upper arm / 2 + 4 cm ease
  const sleeveWidthVal = +(upperArm / 2 + 4).toFixed(1)

  // 13. Lehenga panel hem (for 8-kali lehenga) = (Hip / 4 + 10 cm) * 1.8 flare multiplier
  const lehengaPanelHemVal = +((hip / 4 + 10) * 1.8).toFixed(1)

  // 14. Circle skirt waist radius = Waist / (2 * PI)
  const circleRadiusVal = +(waist / (2 * Math.PI)).toFixed(1)

  // 15. Half circle skirt waist radius = Waist / PI
  const halfCircleRadiusVal = +(waist / Math.PI).toFixed(1)

  // 16. Estimated fabric requirement for 8-kali lehenga
  const fabricMetersVal = +((8 * lehengaPanelHemVal * skirtLen) / (110 * 100) * 1.15).toFixed(1)

  // 17. Cotton pre-wash cut length (5% shrinkage allowance)
  const cottonCutLengthVal = +(blouseLen * 1.05).toFixed(1)

  return {
    quarterBustWithEase: {
      value: quarterBustVal,
      unit: "cm",
      formula: "Bust ÷ 4 + 2.5 cm ease",
      latex: "QB = \\frac{B}{4} + 2.5",
      explanation: "Standard wearing ease for woven silk, cotton, and georgette."
    },
    quarterWaist: {
      value: quarterWaistVal,
      unit: "cm",
      formula: "Waist ÷ 4",
      latex: "QW = \\frac{W}{4}",
      explanation: "Net quadrant measurement before dart intakes are formed."
    },
    armholeDepth: {
      value: armholeDepthVal,
      unit: "cm",
      formula: "Bust ÷ 6 + 7 cm",
      latex: "AD = \\frac{B}{6} + 7",
      explanation: "Governs sleeve crown fit and vertical arm elevation without pulling."
    },
    singleDartIntake: {
      value: dartVal,
      unit: "cm",
      formula: "(Bust − Waist) ÷ 8",
      latex: "D = \\frac{B - W}{8}",
      explanation: "Calculates individual intake for 4 standard bodice waist darts."
    },
    princessSeamCurve: {
      value: princessCurveVal,
      unit: "cm",
      formula: "(Bust − Waist) ÷ 8 per seam",
      latex: "\\Delta = \\frac{B - W}{8}",
      explanation: "Smooth S-curve contouring from mid-armhole down to waist."
    },
    frontNeckDepth: {
      value: fNeckVal,
      unit: "cm",
      formula: "Bust ÷ 10",
      latex: "FND = \\frac{B}{10}",
      explanation: "Classic front neckline depth before style neckline customization."
    },
    backNeckDepth: {
      value: bNeckVal,
      unit: "cm",
      formula: "Bust ÷ 20",
      latex: "BND = \\frac{B}{20}",
      explanation: "High back neckline foundation to anchor the shoulder slope."
    },
    halfShoulder: {
      value: halfShoulderVal,
      unit: "cm",
      formula: "Shoulder ÷ 2 + 0.5 cm",
      latex: "SW = \\frac{S}{2} + 0.5",
      explanation: "Half-back shoulder width from vertebrae to acromion tip."
    },
    neckWidthHalf: {
      value: halfNeckWidthVal,
      unit: "cm",
      formula: "Bust ÷ 20 + 0.5 cm",
      latex: "NW = \\frac{B}{20} + 0.5",
      explanation: "Controls neckline width spread to prevent shoulder strap slipping."
    },
    sideSeamBodice: {
      value: sideSeamVal,
      unit: "cm",
      formula: "Waist ÷ 4 + 1.5 cm dart + 1.5 cm seam",
      latex: "SS = \\frac{W}{4} + 3.0",
      explanation: "Horizontal side seam baseline at natural waistline."
    },
    sleeveCapHeight: {
      value: sleeveCapVal,
      unit: "cm",
      formula: "Armhole Depth − 3 cm",
      latex: "SCH = AD - 3",
      explanation: "Crown height for a fitted set-in sleeve. (Deduct 2.5 cm for puffed sleeves)."
    },
    halfSleeveBicepWidth: {
      value: sleeveWidthVal,
      unit: "cm",
      formula: "Upper Arm ÷ 2 + 4 cm ease",
      latex: "SW = \\frac{UA}{2} + 4",
      explanation: "Allows natural bicep expansion during movement."
    },
    lehengaPanelHemWidth: {
      value: lehengaPanelHemVal,
      unit: "cm",
      formula: "(Hip ÷ 4 + 10 cm) × 1.8",
      latex: "W_{hem} = (\\frac{H}{4} + 10) \\times 1.8",
      explanation: "Bottom hem flare per panel for an 8-kali flared Indian lehenga."
    },
    circleSkirtWaistRadius: {
      value: circleRadiusVal,
      unit: "cm",
      formula: "Waist ÷ (2 × π)",
      latex: "r = \\frac{W}{2\\pi}",
      explanation: "Radial waist cutout for zero-seam 360° umbrella flare."
    },
    halfCircleSkirtWaistRadius: {
      value: halfCircleRadiusVal,
      unit: "cm",
      formula: "Waist ÷ π",
      latex: "r = \\frac{W}{\\pi}",
      explanation: "Waist cutout for a 180° semi-circular drape."
    },
    estimatedFabricMeters: {
      value: fabricMetersVal,
      unit: "meters",
      formula: "8 kalis × Panel Width × Length ÷ Fabric Width + 15% wastage",
      latex: "Y = \\frac{8 \\times W \\times L}{1.10} \\times 1.15",
      explanation: "Estimated 44-inch handloom yardage required for this silhouette."
    },
    standardSeamAllowance: {
      value: 1.5,
      unit: "cm",
      formula: "Standard 1.5 cm (Side) / 0.75 cm (Neckline)",
      explanation: "Seam margin to allow for tailoring adjustments and French seam finishes."
    },
    cottonPreWashCutLength: {
      value: cottonCutLengthVal,
      unit: "cm",
      formula: "Finished Length × 1.05 (5% warp relaxation)",
      latex: "L_{cut} = L_{fin} \\times 1.05",
      explanation: "Pre-wash cut length factoring in natural cotton and khadi shrinkage."
    }
  }
}

/**
 * Checks a student's annotated dieline measurement against the reference math formula
 */
export function verifyDielineMeasurement(
  pieceName: string,
  parameter: string,
  studentValue: number,
  measurements: BodyMeasurements
): {
  isCorrect: boolean
  errorCm: number
  severity: "perfect" | "minor" | "moderate" | "critical"
  expectedValue: number
  feedback: string
} {
  const math = calculatePatternMath(measurements)
  let expected = 0
  let label = parameter

  if (parameter.includes("armhole") || parameter === "AD") {
    expected = math.armholeDepth.value
    label = "Armhole Depth"
  } else if (parameter.includes("bust") || parameter === "QB") {
    expected = math.quarterBustWithEase.value
    label = "Quarter Bust + Ease"
  } else if (parameter.includes("dart")) {
    expected = math.singleDartIntake.value
    label = "Dart Allowance"
  } else if (parameter.includes("cap") || parameter === "SCH") {
    expected = math.sleeveCapHeight.value
    label = "Sleeve Cap Height"
  } else if (parameter.includes("radius") || parameter.includes("circle")) {
    expected = math.circleSkirtWaistRadius.value
    label = "Waist Radius"
  } else if (parameter.includes("neck_depth")) {
    expected = math.frontNeckDepth.value
    label = "Front Neck Depth"
  } else {
    expected = math.quarterBustWithEase.value
  }

  const error = Math.abs(studentValue - expected)
  let severity: "perfect" | "minor" | "moderate" | "critical" = "perfect"

  if (error <= 0.3) {
    severity = "perfect"
  } else if (error <= 1.0) {
    severity = "minor"
  } else if (error <= 2.5) {
    severity = "moderate"
  } else {
    severity = "critical"
  }

  const isCorrect = error <= 0.8
  let feedback = ""

  if (severity === "perfect") {
    feedback = `Spot on! Your ${label} (${studentValue} cm) matches the mathematical formula exactly.`
  } else if (severity === "minor") {
    feedback = `Very close. Your ${label} is ${studentValue} cm, while standard formula yields ${expected} cm (off by ${error.toFixed(1)} cm). Within wearable ease.`
  } else if (severity === "moderate") {
    feedback = `Needs adjustment. Your ${label} is ${studentValue} cm (expected ${expected} cm). This will cause fit tension or loose sagging.`
  } else {
    feedback = `Critical measurement error. ${studentValue} cm deviates by ${error.toFixed(1)} cm from ${expected} cm. Review the formula: ${label}.`
  }

  return {
    isCorrect,
    errorCm: +error.toFixed(1),
    severity,
    expectedValue: expected,
    feedback
  }
}
