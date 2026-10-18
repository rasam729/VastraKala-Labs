import React, { useState } from "react"
import { Calculator, Download, ExternalLink, HelpCircle, ArrowRight } from "lucide-react"
import { calculatePatternMath, DEFAULT_MEASUREMENTS, type BodyMeasurements } from "../lib/patternMath"

export default function FormulaLibraryView() {
  const [measurements, setMeasurements] = useState<BodyMeasurements>(DEFAULT_MEASUREMENTS)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const math = calculatePatternMath(measurements)

  const FORMULAS_DATA = [
    {
      id: "armhole-depth",
      category: "bodice",
      name: "Armhole Depth",
      formula: "Bust ÷ 6 + 7 cm",
      latex: "AD = \\frac{B}{6} + 7",
      calc: `${measurements.bust} ÷ 6 + 7 = ${math.armholeDepth.value} cm`,
      value: `${math.armholeDepth.value} cm`,
      purpose: "Determines armhole depth drop from high shoulder. Crucial for comfortable vertical arm reach without lifting the bodice hem.",
      note: "Standard starting formula for Indian blouses and Western tailored blocks. Add 1 cm for heavy winter velvet or brocades."
    },
    {
      id: "quarter-bust-ease",
      category: "bodice",
      name: "Quarter Bust + Wearing Ease",
      formula: "Bust ÷ 4 + 2.5 cm",
      latex: "QB = \\frac{B}{4} + 2.5",
      calc: `${measurements.bust} ÷ 4 + 2.5 = ${math.quarterBustWithEase.value} cm`,
      value: `${math.quarterBustWithEase.value} cm`,
      purpose: "Forms the quadrant baseline for the front and back bodice pattern.",
      note: "2.5 cm allows for respiration and movement in woven fabrics (silks, cottons). Reduce to 1.0 cm for knit stretch fabrics."
    },
    {
      id: "dart-allowance",
      category: "bodice",
      name: "Waist Dart Intake",
      formula: "(Bust − Waist) ÷ 8",
      latex: "D = \\frac{B - W}{8}",
      calc: `(${measurements.bust} − ${measurements.waist}) ÷ 8 = ${math.singleDartIntake.value} cm`,
      value: `${math.singleDartIntake.value} cm`,
      purpose: "Shapes a flat 2D fabric plane around the 3D conical curvature of the human bust.",
      note: "Calculated per dart across 4 waist darts (2 front, 2 back). For Princess seams, distribute smoothly along the apex curve."
    },
    {
      id: "sleeve-cap-height",
      category: "sleeve",
      name: "Sleeve Cap Crown Height",
      formula: "Armhole Depth − 3 cm",
      latex: "SCH = AD - 3",
      calc: `${math.armholeDepth.value} − 3 = ${math.sleeveCapHeight.value} cm`,
      value: `${math.sleeveCapHeight.value} cm`,
      purpose: "Governs the height of the sleeve cap curve. Lower caps allow maximum arm mobility; higher caps create formal tailored structure.",
      note: "Deduct an additional 2.5 cm for gathered puffed or balloon sleeves."
    },
    {
      id: "sleeve-bicep-width",
      category: "sleeve",
      name: "Half Sleeve Bicep Width",
      formula: "Upper Arm ÷ 2 + 4 cm ease",
      latex: "SW = \\frac{UA}{2} + 4",
      calc: `${measurements.upper_arm || 28} ÷ 2 + 4 = ${math.halfSleeveBicepWidth.value} cm`,
      value: `${math.halfSleeveBicepWidth.value} cm`,
      purpose: "Provides muscular expansion ease around the upper bicep during bending.",
      note: "Always verify with client flexed arm measurement before cutting luxury silks."
    },
    {
      id: "lehenga-panel-width",
      category: "skirt",
      name: "Lehenga Panel Hem Width (8 Kalis)",
      formula: "(Hip ÷ 4 + 10 cm) × 1.8",
      latex: "W_{hem} = (\\frac{H}{4} + 10) \\times 1.8",
      calc: `(${measurements.hip} ÷ 4 + 10) × 1.8 = ${math.lehengaPanelHemWidth.value} cm`,
      value: `${math.lehengaPanelHemWidth.value} cm`,
      purpose: "Calculates the base width for each flared trapezoid kali of an 8-panel Indian lehenga.",
      note: "Multiply across 8 panels to get the total circumference: ${(math.lehengaPanelHemWidth.value * 8 / 100).toFixed(2)} meters."
    },
    {
      id: "circle-skirt-radius",
      category: "skirt",
      name: "360° Umbrella Circle Waist Radius",
      formula: "Waist ÷ (2 × π)",
      latex: "r = \\frac{W}{2\\pi}",
      calc: `${measurements.waist} ÷ (2 × 3.14159) = ${math.circleSkirtWaistRadius.value} cm`,
      value: `${math.circleSkirtWaistRadius.value} cm`,
      purpose: "Radial center cutout formula for seamless circular skirts and modern Indo-Western gowns.",
      note: "Allows zero-vertical-seam drape with continuous waterfall gathers."
    },
    {
      id: "prewash-shrinkage",
      category: "dieline",
      name: "Cotton & Khadi Pre-Wash Cut Length",
      formula: "Finished Length × 1.05",
      latex: "L_{cut} = L_{fin} \\times 1.05",
      calc: `${measurements.blouse_length || 38} × 1.05 = ${math.cottonPreWashCutLength.value} cm`,
      value: `${math.cottonPreWashCutLength.value} cm`,
      purpose: "Accounts for the longitudinal warp relaxation of natural plant fibres during first wash.",
      note: "Applies to 100% natural cottons, hand-spun khadi, and open linen weaves."
    }
  ]

  const filtered = FORMULAS_DATA.filter((f) => activeCategory === "all" || f.category === activeCategory)

  return (
    <div className="space-y-8 bg-[#fdfbf7] p-6 lg:p-10 rounded-2xl border border-[#ded8cd]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-[#e8e0d2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#c9513e]">Technical Pattern Mathematics</span>
          <h2 className="text-3xl font-serif text-[#172b2b] mt-1">Indian & Western Drafting Formulas</h2>
          <p className="text-xs text-[#666] max-w-2xl mt-1">
            Every garment pattern is an engineering equation. Change your measurements below to see all formulas calculate in real time.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/measurement-worksheet.csv"
            download
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#d6ccbe] text-xs font-bold text-[#172b2b] rounded-lg hover:bg-[#f7f2e8] shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#c9513e]" /> Download CSV Grid
          </a>
          <a
            href="/vastrashastra-pattern-blueprint.pdf"
            download
            className="flex items-center gap-1.5 px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#e8b547]" /> PDF Blueprint
          </a>
        </div>
      </div>

      {/* Measurement Parameters Grid */}
      <div className="bg-[#faf6ee] p-5 rounded-xl border border-[#e5dccf]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#194b65] block mb-3">
          Interactive Parameter Inputs
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[11px] text-[#777] block mb-1">Full Bust (cm)</label>
            <input
              type="number"
              value={measurements.bust}
              onChange={(e) => setMeasurements({ ...measurements, bust: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 rounded border border-[#d6ccbe] font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#777] block mb-1">Natural Waist (cm)</label>
            <input
              type="number"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 rounded border border-[#d6ccbe] font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#777] block mb-1">Full Hip (cm)</label>
            <input
              type="number"
              value={measurements.hip}
              onChange={(e) => setMeasurements({ ...measurements, hip: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 rounded border border-[#d6ccbe] font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#777] block mb-1">Shoulder Width (cm)</label>
            <input
              type="number"
              value={measurements.shoulder}
              onChange={(e) => setMeasurements({ ...measurements, shoulder: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 rounded border border-[#d6ccbe] font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-[#e8dfd1] pb-3 text-xs">
        {["all", "bodice", "sleeve", "skirt", "dieline"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md font-bold capitalize transition-all ${
              activeCategory === cat ? "bg-[#172b2b] text-white" : "bg-[#f2ede4] text-[#666] hover:bg-[#e8e0d2]"
            }`}
          >
            {cat} Block
          </button>
        ))}
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl border border-[#ded8cd] shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#aa7917] bg-[#fdf8ee] px-2.5 py-0.5 rounded border border-[#faecd2]">
                {item.category}
              </span>
              <strong className="text-xl font-serif text-[#c9513e]">{item.value}</strong>
            </div>

            <h3 className="text-lg font-serif text-[#172b2b] font-bold">{item.name}</h3>

            <div className="bg-[#f7f2e8] p-3 rounded-lg border border-[#e5dccf] space-y-1">
              <span className="text-[10px] text-[#888] uppercase font-bold block">Formula & Derivation</span>
              <code className="text-xs font-mono font-bold text-[#172b2b] block">{item.formula}</code>
              <span className="text-xs font-mono text-[#c9513e] block pt-1 border-t border-[#ded5c6]">
                {item.calc}
              </span>
            </div>

            <p className="text-xs text-[#555] leading-relaxed">{item.purpose}</p>

            <div className="text-[11px] text-[#777] bg-[#fffdfa] p-2.5 rounded border border-[#eee] flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#aa7917] flex-shrink-0 mt-0.5" />
              <span>{item.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
