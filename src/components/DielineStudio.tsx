import React, { useState, useRef } from "react"
import {
  Ruler,
  Scissors,
  Upload,
  Download,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  FileCheck,
  RotateCcw,
  Eye,
  ArrowRight
} from "lucide-react"
import { calculatePatternMath, type BodyMeasurements } from "../lib/patternMath"
import { generateTechnicalDielineFromDress, type TechnicalDielineResult } from "../lib/aiServices"

interface DielineStudioProps {
  dressImageUrl?: string
  measurements?: BodyMeasurements
}

const PRESET_DRESSES = [
  {
    name: "Royal Kalidar Anarkali",
    category: "Anarkali Suit",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    desc: "Empire-cut bodice with 8 kalis flare and puffed sleeves"
  },
  {
    name: "Banarasi Silk Kurti",
    category: "Straight Kurti",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    desc: "Structured front placket with side hip slits"
  },
  {
    name: "Princess-Cut Saree Blouse",
    category: "Blouse",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    desc: "Contoured armhole princess seams with deep back cutout"
  },
  {
    name: "Mughal Heritage Sherwani",
    category: "Sherwani",
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    desc: "Rigid mandarin stand collar with padded shoulders"
  }
]

export default function DielineStudio({
  dressImageUrl = PRESET_DRESSES[0].imageUrl,
  measurements = { bust: 88, waist: 72, hip: 96, shoulder: 38 }
}: DielineStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current active dress image (from prop, preset, or uploaded file)
  const [activeDressImage, setActiveDressImage] = useState<string>(dressImageUrl)
  const [dressName, setDressName] = useState<string>("Royal Kalidar Anarkali")

  // Measurement Blanks (Editable input fields for the student)
  const [bust, setBust] = useState<number>(measurements.bust || 88)
  const [waist, setWaist] = useState<number>(measurements.waist || 72)
  const [hip, setHip] = useState<number>(measurements.hip || 96)
  const [shoulder, setShoulder] = useState<number>(measurements.shoulder || 38)
  const [sleeveLength, setSleeveLength] = useState<number>(45)
  const [garmentLength, setGarmentLength] = useState<number>(110)
  const [seamAllowance, setSeamAllowance] = useState<number>(1.5)

  // Computed pattern math
  const calculatedMath = calculatePatternMath({ bust, waist, hip, shoulder })
  const defaultArmholeDepth = Math.round(calculatedMath.armholeDepth * 10) / 10
  const [armholeDepth, setArmholeDepth] = useState<number>(defaultArmholeDepth)

  // AI Dieline Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [dielineResult, setDielineResult] = useState<TechnicalDielineResult | null>(null)
  const [selectedPieceId, setSelectedPieceId] = useState<string>("front_bodice")

  // Handle Dress Image Upload from storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDressName(file.name.replace(/\.[^/.]+$/, ""))
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      setActiveDressImage(dataUrl)
      setDielineResult(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Generate Technical Dieline with Gemini
  const handleGenerateDieline = async () => {
    setIsGenerating(true)
    try {
      const result = await generateTechnicalDielineFromDress(activeDressImage, {
        bust,
        waist,
        hip,
        shoulder,
        sleeveLength,
        garmentLength
      })
      setDielineResult(result)
      if (result.pieces.length > 0) {
        setSelectedPieceId(result.pieces[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Download Generated Dieline Diagram
  const handleDownloadDieline = () => {
    if (!dielineResult?.patternSvgDataUrl) return
    const a = document.createElement("a")
    a.download = `vastrashastra-dieline-${Date.now()}.svg`
    a.href = dielineResult.patternSvgDataUrl
    a.click()
  }

  const selectedPiece = dielineResult?.pieces.find((p) => p.id === selectedPieceId) || dielineResult?.pieces[0]

  return (
    <div className="space-y-8 bg-[#fdfbf7] p-6 lg:p-8 rounded-2xl border border-[#ded8cd]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#e8e0d2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#c9513e]">Technical Dieline Lab</span>
          <h2 className="text-2xl lg:text-3xl font-serif text-[#172b2b] mt-1">
            Reverse-Engineer 2D Flat Patterns
          </h2>
          <p className="text-sm text-[#666] max-w-2xl mt-1">
            Upload any dress image from storage or pick a couture style. Enter your custom tailoring measurements in the blanks on the side, and let Gemini analyze the garment silhouette to synthesize the exact cutting dieline blueprint.
          </p>
        </div>

        <button
          onClick={handleGenerateDieline}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#c9513e] hover:bg-[#b04332] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
        >
          <Scissors className="w-4 h-4 text-[#e8b547]" />
          {isGenerating ? "Synthesizing Dieline with Gemini..." : "Generate Technical Dieline"}
        </button>
      </div>

      {/* Main Studio Columns: Image Input & Measurement Blanks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Dress Image & Presets */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-[#f5efe2] px-4 py-2.5 rounded-lg border border-[#e5dccf] text-xs">
            <span className="font-bold text-[#172b2b]">Source Dress Image</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-[#c9513e] font-bold hover:underline"
            >
              <Upload className="w-3.5 h-3.5" /> Upload from Device
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Active Dress Image Preview */}
          <div className="relative border border-[#d8cdbe] rounded-xl overflow-hidden bg-black shadow-md group">
            <img
              src={activeDressImage}
              alt="Source couture dress"
              className="w-full h-80 object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <div className="text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#e8b547]">Target Silhouette</span>
                <h4 className="text-base font-serif font-bold">{dressName}</h4>
              </div>
            </div>
          </div>

          {/* Preset Dress Switcher for Quick Experiments */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-[#888] tracking-wider block">
              Experiment with Different Garment Silhouettes:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_DRESSES.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveDressImage(d.imageUrl)
                    setDressName(d.name)
                    setDielineResult(null)
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    activeDressImage === d.imageUrl
                      ? "border-[#c9513e] bg-[#fbf2f0] ring-2 ring-[#c9513e]/20"
                      : "border-[#e0d6c5] bg-white hover:bg-[#faf7f0]"
                  }`}
                >
                  <img src={d.imageUrl} alt={d.name} className="w-10 h-10 object-cover rounded-md" />
                  <div>
                    <strong className="block text-[11px] text-[#172b2b] truncate">{d.name}</strong>
                    <span className="text-[9px] text-[#777] block">{d.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Measurement Blanks Form */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#faf7f0] p-5 rounded-xl border border-[#ded4c3] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e5dccf]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#c9513e]" />
                <h3 className="text-xs uppercase font-bold text-[#172b2b] tracking-wider">
                  Measurement Blanks (To Inject into Dieline Prompt)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#888]">Units: Centimetres (CM)</span>
            </div>

            <p className="text-xs text-[#666]">
              Fill in the blanks below with your client or target body specifications. Gemini will convert these 3D body girths into 2D flat pattern dimensions including ease and dart intake.
            </p>

            {/* Measurement Input Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Bust Girth (cm)</label>
                <input
                  type="number"
                  value={bust}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setBust(val)
                    setArmholeDepth(Math.round((val / 6 + 7) * 10) / 10)
                  }}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">¼ Bust = {(bust / 4).toFixed(1)} cm</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Waist Girth (cm)</label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">¼ Waist = {(waist / 4).toFixed(1)} cm</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Hip Girth (cm)</label>
                <input
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">Used for kali flare</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Shoulder Width (cm)</label>
                <input
                  type="number"
                  value={shoulder}
                  onChange={(e) => setShoulder(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">½ Shoulder = {(shoulder / 2).toFixed(1)} cm</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Sleeve Length (cm)</label>
                <input
                  type="number"
                  value={sleeveLength}
                  onChange={(e) => setSleeveLength(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">Cap drop ~{(armholeDepth * 0.72).toFixed(1)} cm</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Garment Length (cm)</label>
                <input
                  type="number"
                  value={garmentLength}
                  onChange={(e) => setGarmentLength(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">Nape to hem sweep</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Armhole Depth (cm)</label>
                <input
                  type="number"
                  value={armholeDepth}
                  onChange={(e) => setArmholeDepth(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#c9513e] font-semibold mt-0.5 block">Formula: Bust/6 + 7</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444] block mb-1">Seam Margin (cm)</label>
                <input
                  type="number"
                  step={0.5}
                  value={seamAllowance}
                  onChange={(e) => setSeamAllowance(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
                />
                <span className="text-[9px] text-[#777] mt-0.5 block">Standard tailor margin</span>
              </div>
            </div>

            <button
              onClick={handleGenerateDieline}
              disabled={isGenerating}
              className="w-full py-3 rounded-lg bg-[#172b2b] hover:bg-[#28453c] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow"
            >
              <Scissors className="w-4 h-4 text-[#e8b547]" />
              {isGenerating ? "Analyzing Silhouette & Calculating Dieline Geometry..." : "Synthesize Technical Dieline with Measurements"}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Technical Dieline Blueprint Viewer */}
      {dielineResult && (
        <div className="mt-8 pt-6 border-t border-[#e8e0d2] space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#aa7917] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Gemini Verified Technical Blueprint
              </span>
              <h3 className="text-xl lg:text-2xl font-serif text-[#172b2b] mt-0.5">
                {dielineResult.garmentTitle} — Flat Pattern Cutting Dieline
              </h3>
              <p className="text-xs text-[#666] mt-0.5">
                Deconstructed into {dielineResult.pieces.length} distinct drafting blocks scaled to your inputted measurements.
              </p>
            </div>

            <button
              onClick={handleDownloadDieline}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#c9513e] hover:bg-[#b04332] text-white text-xs font-bold rounded-lg shadow transition-all"
            >
              <Download className="w-4 h-4 text-[#e8b547]" /> Download Dieline (SVG / Blueprint)
            </button>
          </div>

          {/* SVG Blueprint Viewer */}
          <div className="rounded-2xl overflow-hidden border border-[#1f3d45] shadow-2xl bg-[#0e1e24] p-2">
            <img
              src={dielineResult.patternSvgDataUrl}
              alt="Generated Technical Dieline Blueprint"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Pattern Pieces Breakdown & Pedagogical Directives */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pieces Selector */}
            <div className="lg:col-span-5 bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] space-y-3">
              <span className="text-xs uppercase font-bold text-[#888] tracking-wider block">
                Pattern Pieces ({dielineResult.pieces.length})
              </span>
              <div className="space-y-2">
                {dielineResult.pieces.map((piece) => (
                  <button
                    key={piece.id}
                    onClick={() => setSelectedPieceId(piece.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedPiece?.id === piece.id
                        ? "border-[#c9513e] bg-white ring-2 ring-[#c9513e]/20 shadow-sm"
                        : "border-[#e5dccf] bg-[#f5efe4] hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-xs font-bold text-[#172b2b]">{piece.name}</strong>
                      <span className="text-[10px] bg-[#172b2b] text-white px-2 py-0.5 rounded font-mono font-bold">
                        Qty: {piece.cutQuantity}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#777] block mt-1">{piece.cuttingDirection}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Piece Inspection & Measurements */}
            {selectedPiece && (
              <div className="lg:col-span-7 bg-[#faf7f0] p-5 rounded-xl border border-[#ded4c3] space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#e5dccf]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c9513e] tracking-wider">
                      Piece Geometry & Notches
                    </span>
                    <h4 className="text-sm font-bold text-[#172b2b]">{selectedPiece.name}</h4>
                  </div>
                  <span className="text-xs text-[#555] font-semibold">Grainline: {selectedPiece.grainline}</span>
                </div>

                {/* Dimension Tags */}
                <div>
                  <span className="text-[11px] font-bold text-[#555] block mb-2">Calculated Mathematical Dimensions:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPiece.dimensions.map((dim, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-[#e5dccf]">
                        <span className="text-[10px] text-[#777] block">{dim.label}</span>
                        <strong className="text-xs font-mono text-[#c9513e]">
                          {dim.value} {dim.unit}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cutting & Assembly Directive */}
                <div className="p-3 bg-white rounded-lg border border-[#e5dccf] text-xs text-[#555] space-y-1">
                  <strong className="text-[#172b2b] block">Tailor Cutting Directives:</strong>
                  <p>{selectedPiece.notes}</p>
                  <p className="text-[#c9513e] font-semibold">Seam allowance included: {selectedPiece.seamAllowanceCm} cm</p>
                </div>

                {/* Pedagogical Advice */}
                <div className="p-3 bg-[#f5efe2] rounded-lg border border-[#e2d5c0] space-y-1.5">
                  <strong className="text-xs font-bold text-[#1a5b3a] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2c7a4b]" /> Patternmaker Insight
                  </strong>
                  <ul className="list-disc list-inside text-[11px] text-[#444] space-y-1">
                    {dielineResult.pedagogyNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
