import React, { useState } from "react"
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Sliders, Check } from "lucide-react"
import FashionModelPreview, { type DressStyle } from "./FashionModelPreview"
import { SKIN_TONES, type SkinTone, evaluateSkinAndDressHarmony, type SkinHarmonyAnalysis } from "../lib/colourTheory"
import { calculatePatternMath, type BodyMeasurements } from "../lib/patternMath"

interface GarmentViewer3DProps {
  initialDressColor?: string
  initialStyle?: DressStyle
  initialBodyParams?: BodyMeasurements
  onSkinSelected?: (skins: SkinTone[], analysis: SkinHarmonyAnalysis[]) => void
}

const SUPPORTED_STYLES: { id: DressStyle; label: string }[] = [
  { id: "Anarkali Suit", label: "Anarkali Suit" },
  { id: "Ghagra / Lehenga", label: "Ghagra / Lehenga" },
  { id: "Kurta", label: "Kurta & Churidar" },
  { id: "Blouse (Saree)", label: "Saree & Blouse" },
  { id: "Salwar Kameez", label: "Salwar Kameez" },
  { id: "Daily Wear Dress", label: "Indo-Western Dress" }
]

export default function GarmentViewer3D({
  initialDressColor = "#c9513e",
  initialStyle = "Anarkali Suit",
  initialBodyParams = { bust: 88, waist: 72, hip: 96, shoulder: 38, height: 165 },
  onSkinSelected
}: GarmentViewer3DProps) {
  // Body measurements - exact parameters from GarmentForge
  const [waistCm, setWaistCm] = useState<number>(initialBodyParams.waist)
  const [hipCm, setHipCm] = useState<number>(initialBodyParams.hip)
  const [chestCm, setChestCm] = useState<number>(initialBodyParams.bust)
  const [heightCm, setHeightCm] = useState<number>(initialBodyParams.height || 165)
  const [shoulderCm, setShoulderCm] = useState<number>(initialBodyParams.shoulder || 38)

  // Color & Silhouette state
  const [dressColor, setDressColor] = useState<string>(initialDressColor)
  const [selectedStyle, setSelectedStyle] = useState<DressStyle>(initialStyle)
  const [currentSkinHex, setCurrentSkinHex] = useState<string>("#ffffff") // starts pure white as requested!
  const [isFestive, setIsFestive] = useState<boolean>(true)

  // 3-Skin Selection state
  const [selectedSkinList, setSelectedSkinList] = useState<SkinTone[]>([])
  const [harmonyAnalyses, setHarmonyAnalyses] = useState<SkinHarmonyAnalysis[]>([])

  // Viewport Transform Controls (CSS 3D perspective rotation & zoom)
  const [rotateY, setRotateY] = useState<number>(0)
  const [zoom, setZoom] = useState<number>(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

  const patternMath = calculatePatternMath({
    bust: chestCm,
    waist: waistCm,
    hip: hipCm,
    shoulder: shoulderCm,
    height: heightCm
  })

  // Mouse drag orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX
    setRotateY((prev) => prev + deltaX * 0.45)
    setDragStartX(e.clientX)
  }

  const handleMouseUp = () => setIsDragging(false)

  // Select up to 3 skin tones
  const handleSelectSkin = (skin: SkinTone) => {
    setCurrentSkinHex(skin.hex)
    let updated = [...selectedSkinList]
    const exists = updated.find((s) => s.id === skin.id)

    if (exists) {
      updated = updated.filter((s) => s.id !== skin.id)
    } else {
      if (updated.length >= 3) {
        updated = [updated[1], updated[2], skin]
      } else {
        updated.push(skin)
      }
    }

    setSelectedSkinList(updated)
    const analyses = updated.map((s) => evaluateSkinAndDressHarmony(dressColor, s))
    setHarmonyAnalyses(analyses)

    if (onSkinSelected) {
      onSkinSelected(updated, analyses)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 lg:p-8 rounded-2xl border border-[#ded8cd] shadow-xs">
      {/* 3D Fit Viewport */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd4] mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#c9513e]">GarmentForge Human Avatar</span>
            <h3 className="text-xl font-serif text-[#172b2b]">Parametric 3D Fit & Try-On</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRotateY(0)
                setZoom(1)
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-[#d6ccbe] text-[#555] hover:bg-[#f7f2e8] flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" /> Reset View
            </button>
            <button
              onClick={() => setCurrentSkinHex("#ffffff")}
              className="text-xs px-3 py-1.5 rounded-full bg-[#f2ede4] font-semibold text-[#172b2b] hover:bg-[#e8e0d2]"
              title="Reset body model to pure white"
            >
              Reset to White
            </button>
          </div>
        </div>

        {/* Interactive Viewport Canvas */}
        <div
          className="relative w-full h-[580px] rounded-xl bg-gradient-to-b from-[#f9f5ed] to-[#eee4d2] overflow-hidden cursor-grab active:cursor-grabbing border border-[#e2d8c7] flex items-center justify-center select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Studio Backdrop Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(#283e39 1px, transparent 1px), linear-gradient(90deg, #283e39 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Perspective 3D Turntable Wrapper */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{
              perspective: "1000px"
            }}
          >
            <div
              className="w-[320px] h-[520px] flex items-center justify-center"
              style={{
                transform: `rotateY(${rotateY}deg) scale(${zoom})`,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Exact GarmentForge Human Model SVG */}
              <FashionModelPreview
                skinHex={currentSkinHex}
                dressColor={dressColor}
                style={selectedStyle}
                waistCm={waistCm}
                hipCm={hipCm}
                chestCm={chestCm}
                heightCm={heightCm}
                isFestive={isFestive}
              />
            </div>
          </div>

          {/* Zoom Floating Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-[#ded4c3] shadow-sm">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 hover:bg-[#f0e8dc] rounded text-[#555]"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:bg-[#f0e8dc] rounded text-[#555]"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-[11px] font-medium text-[#666] shadow-xs">
            Drag to Orbit Mannequin · Click Skin Tones to Try On
          </div>
        </div>

        {/* Style Preset Selector */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          {SUPPORTED_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s.id)}
              className={`text-xs px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedStyle === s.id
                  ? "bg-[#172b2b] text-white shadow-sm"
                  : "bg-[#f5efe2] text-[#555] hover:bg-[#ece2d1]"
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setIsFestive(!isFestive)}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-all ml-auto ${
              isFestive ? "bg-[#e8b547] text-[#172b2b]" : "bg-[#f5efe2] text-[#888]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Zari Buti
          </button>
        </div>
      </div>

      {/* Control Panels: Skin Tone Challenge & Parametric Sliders */}
      <div className="lg:col-span-5 flex flex-col gap-5 overflow-y-auto max-h-[660px] pr-1">
        {/* 1. Skin Tone Harmony Picker */}
        <div className="bg-[#faf6ee] p-5 rounded-xl border border-[#e5dccf]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#aa7917]">Skin Tone Harmony Challenge</span>
            <span className="text-xs text-[#777] font-bold">{selectedSkinList.length}/3 Chosen</span>
          </div>
          <p className="text-xs text-[#666] mb-3">
            Pick 3 skin tones to test optical contrast and undertone resonance against the {dressColor} dress.
          </p>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {SKIN_TONES.map((skin) => {
              const isSelected = selectedSkinList.some((s) => s.id === skin.id)
              return (
                <button
                  key={skin.id}
                  onClick={() => handleSelectSkin(skin)}
                  className={`group relative h-10 rounded-lg flex items-center justify-center transition-all ${
                    isSelected ? "ring-2 ring-[#c9513e] scale-105 shadow-md" : "hover:scale-102"
                  }`}
                  style={{ backgroundColor: skin.hex }}
                  title={`${skin.name} (${skin.undertone})`}
                >
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              )
            })}
          </div>

          {/* AI Color Harmony Critiques */}
          {harmonyAnalyses.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-[#e2d6c4]">
              {harmonyAnalyses.map((ana) => (
                <div key={ana.skinTone.id} className="bg-white p-3 rounded-lg border border-[#e0d6c5] text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: ana.skinTone.hex }} />
                      {ana.skinTone.name}
                    </span>
                    <span className="text-[#c9513e] font-serif font-bold text-sm">{ana.score}% Harmony</span>
                  </div>
                  <p className="text-[11px] text-[#666] leading-relaxed">{ana.critique}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Parametric Body Measurements */}
        <div className="bg-[#fffdfa] p-5 rounded-xl border border-[#e5dccf] space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f0e8dc]">
            <span className="text-xs uppercase font-bold tracking-wider text-[#194b65] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#c9513e]" /> Parametric Dimensions
            </span>
            <span className="text-[11px] text-[#888]">GarmentForge Spec</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Bust / Chest Circumference</span>
                <span className="font-mono font-bold text-[#c9513e]">{chestCm} cm</span>
              </div>
              <input
                type="range"
                min="76"
                max="120"
                value={chestCm}
                onChange={(e) => setChestCm(Number(e.target.value))}
                className="w-full accent-[#c9513e]"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Natural Waist</span>
                <span className="font-mono font-bold text-[#c9513e]">{waistCm} cm</span>
              </div>
              <input
                type="range"
                min="58"
                max="105"
                value={waistCm}
                onChange={(e) => setWaistCm(Number(e.target.value))}
                className="w-full accent-[#c9513e]"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Hip Circumference</span>
                <span className="font-mono font-bold text-[#c9513e]">{hipCm} cm</span>
              </div>
              <input
                type="range"
                min="80"
                max="130"
                value={hipCm}
                onChange={(e) => setHipCm(Number(e.target.value))}
                className="w-full accent-[#c9513e]"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Stature Height</span>
                <span className="font-mono font-bold text-[#c9513e]">{heightCm} cm</span>
              </div>
              <input
                type="range"
                min="145"
                max="185"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-[#c9513e]"
              />
            </div>
          </div>

          {/* Quick Pattern Math Formulas Derived in Real-Time */}
          <div className="pt-3 border-t border-[#f0e8da] grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-[#f7f2e8] p-2.5 rounded-lg border border-[#e8dfd1]">
              <span className="text-[#888] font-bold uppercase block">Armhole Depth</span>
              <strong className="text-sm font-serif text-[#172b2b]">{patternMath.armholeDepth.value} cm</strong>
              <small className="text-[#777] block text-[9px] mt-0.5">Bust ÷ 6 + 7 cm</small>
            </div>
            <div className="bg-[#f7f2e8] p-2.5 rounded-lg border border-[#e8dfd1]">
              <span className="text-[#888] font-bold uppercase block">Dart Allowance</span>
              <strong className="text-sm font-serif text-[#172b2b]">{patternMath.singleDartIntake.value} cm</strong>
              <small className="text-[#777] block text-[9px] mt-0.5">(Bust − Waist) ÷ 8</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
