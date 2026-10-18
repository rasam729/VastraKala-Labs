import React, { useState } from "react"
import { Download, ExternalLink, Play, BookOpen, Calculator, FileText, Sparkles } from "lucide-react"
import FormulaLibraryView from "./FormulaLibraryView"

interface ResourceLibraryViewProps {
  navigate?: (path: string) => void
}

export default function ResourceLibraryView({ navigate }: ResourceLibraryViewProps) {
  const [activeTab, setActiveTab] = useState<"formulas" | "blueprints" | "videos" | "glossary">("formulas")

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-[#172b2b] text-white p-8 lg:p-12 rounded-2xl shadow-md border border-[#28453c] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Resource & Reference Center</span>
          <h1 className="text-3xl lg:text-4xl font-serif mt-1">Your Working Couture Archive</h1>
          <p className="text-xs text-[#cad5cf] mt-1.5 max-w-xl leading-relaxed">
            Technical pattern mathematics, printable cutting blueprints, measurement spreadsheets, and curated studio masterclasses.
          </p>
        </div>

        {/* Resources Sub-Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/15">
          <button
            onClick={() => setActiveTab("formulas")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "formulas" ? "bg-[#c9513e] text-white shadow" : "text-white/80 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#e8b547]" /> Pattern Formulas
          </button>

          <button
            onClick={() => setActiveTab("blueprints")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "blueprints" ? "bg-[#c9513e] text-white shadow" : "text-white/80 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#e8b547]" /> Blueprints & Worksheets
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "videos" ? "bg-[#c9513e] text-white shadow" : "text-white/80 hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-[#e8b547]" /> Video Masterclasses
          </button>

          <button
            onClick={() => setActiveTab("glossary")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "glossary" ? "bg-[#c9513e] text-white shadow" : "text-white/80 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8b547]" /> Textile Glossary
          </button>
        </div>
      </div>

      {/* 1. Shifted Formulas Tab */}
      {activeTab === "formulas" && (
        <FormulaLibraryView />
      )}

      {/* 2. Blueprints & Worksheets */}
      {activeTab === "blueprints" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fdfbf7] p-8 rounded-2xl border border-[#ded8cd]">
          <div className="bg-white p-6 rounded-xl border border-[#ded4c3] space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c9513e] tracking-wider block">Printable PDF</span>
              <h3 className="text-xl font-serif text-[#172b2b] mt-1">Katori Blouse Master Blueprint</h3>
              <p className="text-xs text-[#666] mt-1 leading-relaxed">
                Complete A4 technical cutting block featuring true grainline marks, apex dart keys, neckline curvature guide, and 1.5 cm seam allowances.
              </p>
            </div>
            <a
              href="/vastrashastra-pattern-blueprint.pdf"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#172b2b] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c9513e] w-fit"
            >
              <Download className="w-4 h-4 text-[#e8b547]" /> Download Blueprint (PDF)
            </a>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#ded4c3] space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#194b65] tracking-wider block">Spreadsheet Tool</span>
              <h3 className="text-xl font-serif text-[#172b2b] mt-1">28-Parameter Measurement Worksheet</h3>
              <p className="text-xs text-[#666] mt-1 leading-relaxed">
                Editable CSV table containing standard ease allowances, client body values, draft dimensions, and auto-derivation notes for tailoring.
              </p>
            </div>
            <a
              href="/measurement-worksheet.csv"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#172b2b] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c9513e] w-fit"
            >
              <Download className="w-4 h-4 text-[#e8b547]" /> Download Worksheet (CSV)
            </a>
          </div>
        </div>
      )}

      {/* 3. Video Masterclasses */}
      {activeTab === "videos" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#fdfbf7] p-8 rounded-2xl border border-[#ded8cd]">
          {[
            {
              title: "Katori Blouse Drafting Masterclass",
              duration: "28 min",
              url: "https://www.youtube.com/watch?v=q4hR7cGVmAQ",
              thumb: "https://images.unsplash.com/photo-1791962831671-c869576205f0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
              desc: "Step-by-step studio demonstration of katori apex calculations and toile fitting corrections."
            },
            {
              title: "Salwar & Kalidar Drafting Math",
              duration: "22 min",
              url: "https://www.youtube.com/watch?v=0Fg0tFqmRFk",
              thumb: "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
              desc: "Engineering Patiala pleat volume and flared kalis from pure yardage."
            },
            {
              title: "Saree Draping & Unstitched Mechanics",
              duration: "18 min",
              url: "https://www.youtube.com/watch?v=n0EFxVGFR3w",
              thumb: "https://images.unsplash.com/photo-1662909540324-c8c358c42aa8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
              desc: "Controlling fall, pleat tension, and contemporary fusion drapes without seams."
            }
          ].map((vid, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden border border-[#ded4c3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img src={vid.thumb} alt={vid.title} className="w-full h-full object-cover" />
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center group hover:bg-black/50 transition-colors"
                  >
                    <span className="w-12 h-12 rounded-full bg-white text-[#c9513e] flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                      <Play className="w-5 h-5 ml-0.5" />
                    </span>
                  </a>
                  <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-serif font-bold text-[#172b2b]">{vid.title}</h4>
                  <p className="text-xs text-[#666] mt-1 leading-relaxed">{vid.desc}</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <a
                  href={vid.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c9513e] hover:underline"
                >
                  Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Textile Glossary */}
      {activeTab === "glossary" && (
        <div className="bg-[#fdfbf7] p-8 rounded-2xl border border-[#ded8cd] space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 className="text-xl font-serif text-[#172b2b]">Indian Textile & Handloom Dictionary</h3>
              <p className="text-xs text-[#666]">86 living craft traditions, fibre counts, and regional signatures.</p>
            </div>
            <a
              href="https://craftscouncilofindia.org/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#c9513e] font-bold flex items-center gap-1 hover:underline"
            >
              Living Craft Archive ↗
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Ajrakh", origin: "Kachchh / Sindh", desc: "Complex 14-stage block printing resist using indigo and madder root on mordanted cotton." },
              { name: "Banarasi Kadhwa", origin: "Varanasi, UP", desc: "Individual motif extra-weft brocading where no loose floating threads remain at the reverse." },
              { name: "Chanderi", origin: "Madhya Pradesh", desc: "Fine silk-cotton blend woven with tissue zari borders, known for lightweight translucent drape." },
              { name: "Patan Patola", origin: "Gujarat", desc: "Double-ikat silk where warp and weft are tie-dyed with mathematical precision prior to weaving." }
            ].map((term, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-[#ded4c3] text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-sm font-serif text-[#172b2b]">{term.name}</strong>
                  <span className="text-[10px] text-[#aa7917] font-semibold">{term.origin}</span>
                </div>
                <p className="text-[#555] leading-relaxed">{term.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
