import React, { useState } from "react"
import { Sparkles, Palette, Box, Scissors, Layers } from "lucide-react"
import AIDesignStudio from "./AIDesignStudio"
import GarmentViewer3D from "./GarmentViewer3D"
import ThreeModelTester from "./ThreeModelTester"
import DielineStudio from "./DielineStudio"
import { type DressStyle } from "./FashionModelPreview"

type StudioSubTab = "sketch" | "colour-fit" | "3d-testing" | "dieline"

export default function UnifiedAIStudio() {
  const [activeSubTab, setActiveSubTab] = useState<StudioSubTab>("sketch")

  // Shared design state across the experimentation lab tools
  const [dressColor, setDressColor] = useState<string>("#c9513e")
  const [dressStyle, setDressStyle] = useState<DressStyle>("Anarkali Suit")
  const [dressImageUrl, setDressImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800"
  )

  return (
    <div className="space-y-6">
      {/* Unified Lab Header & Sub-Tab Switcher */}
      <div className="bg-[#172b2b] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#28453c]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Experimentation & Self-Testing Lab
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif mt-0.5">VastraShastra AI Couture Lab</h2>
          <p className="text-xs text-[#cad5cf] mt-1 max-w-xl">
            A 4-tier pedagogical sandbox: draft on metric grid or upload sketches, verify skin tone optical harmony, test 3D multi-asset drape in Three.js with Trellis, and synthesize technical pattern dielines.
          </p>
        </div>

        {/* 4 Lab Sub-Tabs */}
        <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/15 flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab("sketch")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "sketch"
                ? "bg-[#c9513e] text-white shadow"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8b547]" /> 1. Sketch & Studio
          </button>

          <button
            onClick={() => setActiveSubTab("colour-fit")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "colour-fit"
                ? "bg-[#c9513e] text-white shadow"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#e8b547]" /> 2. Skin Match & Colour Theory
          </button>

          <button
            onClick={() => setActiveSubTab("3d-testing")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "3d-testing"
                ? "bg-[#c9513e] text-white shadow"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Box className="w-3.5 h-3.5 text-[#e8b547]" /> 3. 3D Model Testing
          </button>

          <button
            onClick={() => setActiveSubTab("dieline")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "dieline"
                ? "bg-[#c9513e] text-white shadow"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-[#e8b547]" /> 4. Technical Dieline
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: AI Sketch Studio */}
      {activeSubTab === "sketch" && (
        <AIDesignStudio
          onDressGenerated={(data) => {
            setDressColor(data.color)
            setDressImageUrl(data.imageUrl)
            if (data.style.type) {
              setDressStyle(data.style.type as DressStyle)
            }
          }}
          onNavigateTo3D={() => setActiveSubTab("3d-testing")}
        />
      )}

      {/* Sub-Tab 2: Skin Colour Match & Colour Theory Testing (2D Body Model Sketch with 3 Skin Tones & WCAG Contrast) */}
      {activeSubTab === "colour-fit" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#faf6ee] p-4 rounded-xl border border-[#ded4c3]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c9513e]">Optical Harmony & 2D Avatar</span>
              <h3 className="text-base font-serif text-[#172b2b]">Skin Colour Match & Colour Theory Testing</h3>
              <p className="text-xs text-[#666]">
                Testing your {dressColor} {dressStyle} against 3 ethnic skin tones using WCAG 2.1 relative luminance and Indian chromatic undertones.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab("3d-testing")}
              className="px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] transition-all"
            >
              Test 3D Drape in Model Testing →
            </button>
          </div>

          <GarmentViewer3D
            initialDressColor={dressColor}
            initialStyle={dressStyle}
          />
        </div>
      )}

      {/* Sub-Tab 3: 3D Model Testing (Three.js Viewport, Constant Body Model, Trellis 3D & Multi-Asset Layering) */}
      {activeSubTab === "3d-testing" && (
        <ThreeModelTester />
      )}

      {/* Sub-Tab 4: Technical Dieline Studio */}
      {activeSubTab === "dieline" && (
        <DielineStudio
          dressImageUrl={dressImageUrl}
        />
      )}
    </div>
  )
}
