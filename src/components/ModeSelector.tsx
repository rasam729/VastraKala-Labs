import React, { useState } from "react"
import { Target, Palette, Scissors, Shuffle, Zap, BookOpen, Compass, ArrowRight } from "lucide-react"

export interface ModeInfo {
  id: string
  number: string
  title: string
  subtitle: string
  description: string
  entryPoint: string
  pipelineOrder: string[]
  theme: "Indian" | "Western" | "Fusion" | "All"
  icon: React.ReactNode
  accentColor: string
}

export const MODES_CATALOG: ModeInfo[] = [
  {
    id: "mode1_prompt_to_dress",
    number: "01",
    title: "Prompt-to-Dress Challenge",
    subtitle: "Brief → Sketch → 2D Image → 3D Garment → Dieline",
    description: "Receive a real client scenario (occasion, target skin tone, material, regional tradition). Sketch your concept, synthesize the dress, drape the 3D twin, and draft the cut pattern.",
    entryPoint: "Client Brief & Prompt",
    pipelineOrder: ["Brief", "Sketch Canvas", "Style Selection", "Image Gen", "3D Fitting", "Dieline Draft"],
    theme: "All",
    icon: <Target className="w-6 h-6 text-[#c9513e]" />,
    accentColor: "#c9513e"
  },
  {
    id: "mode2_skin_tone",
    number: "02",
    title: "Skin Tone Harmony Challenge",
    subtitle: "Dress Image Given → White Body Model → 3 Best Skin Picks",
    description: "Given a finished couture dress and a blank white body mannequin, select the 3 optimal skin tones according to contrast ratio (CR) and undertone theory. AI scores your ranking.",
    entryPoint: "Finished Dress & White Model",
    pipelineOrder: ["Examine Dress", "White 3D Body", "Pick 3 Skin Tones", "AI Contrast Scoring", "Learning Path"],
    theme: "All",
    icon: <Palette className="w-6 h-6 text-[#aa7917]" />,
    accentColor: "#aa7917"
  },
  {
    id: "mode3_dieline_reverse",
    number: "03",
    title: "Dieline Reverse Engineering",
    subtitle: "Dress Image Given → Mathematical Pattern Drafting",
    description: "Inspect a target garment image and draft the exact cutting dieline with measurements. Gemini AI generates the master technical blueprint and highlights tolerance errors.",
    entryPoint: "Target Garment Image",
    pipelineOrder: ["Inspect Image", "Draft Dieline", "Annotate Measurements", "AI Error Tolerance", "Toile Advice"],
    theme: "All",
    icon: <Scissors className="w-6 h-6 text-[#194b65]" />,
    accentColor: "#194b65"
  },
  {
    id: "mode4_blend_fusion",
    number: "04",
    title: "Indo-Western Blend & Fusion",
    subtitle: "Two Tradition References → Hybrid Silhouette Design",
    description: "Combine two distinct aesthetics (e.g. Kanjeevaram Silk + Parisian Tailoring). AI checks cultural respect, fabric weight feasibility, and wearable balance.",
    entryPoint: "Dual Cultural Prompts",
    pipelineOrder: ["Dual Brief", "Fusion Sketch", "Weave Synthesis", "3D Drape", "Jury Critique"],
    theme: "Fusion",
    icon: <Shuffle className="w-6 h-6 text-[#754058]" />,
    accentColor: "#754058"
  },
  {
    id: "mode5_speed_round",
    number: "05",
    title: "Speed Recognition Round",
    subtitle: "60-Second Rapid-Fire Visual Identification",
    description: "10 couture garments presented in rapid succession. Identify regional weave, neckline anatomy, occasion, and ideal skin contrast before the countdown expires.",
    entryPoint: "Visual Flashcards",
    pipelineOrder: ["10 Visual Garments", "Timer Countdown", "Instant Scoring", "Mastery Updates"],
    theme: "All",
    icon: <Zap className="w-6 h-6 text-[#e8b547]" />,
    accentColor: "#e8b547"
  },
  {
    id: "mode6_case_study",
    number: "06",
    title: "Comprehensive Jury Case Study",
    subtitle: "In-Depth Client Portfolio Assignment",
    description: "A 3-paragraph bespoke assignment mimicking NIFT/NID studio jury briefs. Formulate your concept note, sketch, colour swatches, and cutting specification.",
    entryPoint: "Comprehensive Brief",
    pipelineOrder: ["Client Dossier", "Concept Statement", "Full Studio Pipeline", "Design Jury Evaluation"],
    theme: "All",
    icon: <BookOpen className="w-6 h-6 text-[#365540]" />,
    accentColor: "#365540"
  }
]

interface ModeSelectorProps {
  onSelectMode: (modeId: string, isTestMode: boolean) => void
  onStartPlacement: () => void
}

export default function ModeSelector({ onSelectMode, onStartPlacement }: ModeSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<"learn" | "test">("test")
  const [difficulty, setDifficulty] = useState<string>("intermediate")
  const [styleFilter, setStyleFilter] = useState<string>("All")

  const filteredModes = MODES_CATALOG.filter((m) =>
    styleFilter === "All" ? true : m.theme === styleFilter || m.theme === "All"
  )

  return (
    <div className="space-y-8 bg-[#fdfbf7] p-6 lg:p-10 rounded-2xl border border-[#ded8cd]">
      {/* Top Banner with Placement Test recommendation */}
      <div className="bg-gradient-to-r from-[#172b2b] to-[#28453c] text-white p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Diagnostic Pre-Assessment</span>
          <h2 className="text-xl lg:text-2xl font-serif mt-1">Determine Your Starting Level & Learning Path</h2>
          <p className="text-xs text-[#cad5cf] max-w-xl mt-1">
            Take our 5-section adaptive placement test covering visual recognition, colour theory, pattern mathematics, and cultural literacy.
          </p>
        </div>
        <button
          onClick={onStartPlacement}
          className="flex items-center gap-2 px-6 py-3 bg-[#e8b547] text-[#172b2b] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#d8a436] transition-all shadow"
        >
          <Compass className="w-4 h-4" /> Start Placement Test
        </button>
      </div>

      {/* Mode Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#e8e0d2]">
        {/* Learn vs Test Mode switcher */}
        <div className="flex items-center p-1 bg-[#ede4d4] rounded-lg">
          <button
            onClick={() => setSelectedTab("learn")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
              selectedTab === "learn" ? "bg-white text-[#172b2b] shadow-sm" : "text-[#777] hover:text-[#172b2b]"
            }`}
          >
            Learning Mode (With Hints & Formulas)
          </button>
          <button
            onClick={() => setSelectedTab("test")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
              selectedTab === "test" ? "bg-[#c9513e] text-white shadow-sm" : "text-[#777] hover:text-[#172b2b]"
            }`}
          >
            Test Mode (Evaluated · Timed)
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#888] font-medium">Difficulty:</span>
            {["beginner", "intermediate", "advanced", "master"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize ${
                  difficulty === d ? "bg-[#172b2b] text-white" : "bg-[#f2ede4] text-[#666]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-[#d8cdbe]">
            <span className="text-[#888] font-medium">Style:</span>
            {["All", "Indian", "Fusion"].map((s) => (
              <button
                key={s}
                onClick={() => setStyleFilter(s)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                  styleFilter === s ? "bg-[#c9513e] text-white" : "bg-[#f2ede4] text-[#666]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModes.map((mode) => (
          <div
            key={mode.id}
            className="group bg-white rounded-xl border border-[#ded8cd] p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#c9513e] transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="w-12 h-12 rounded-xl bg-[#faf6ee] border border-[#e8dfd1] flex items-center justify-center">
                  {mode.icon}
                </span>
                <span className="text-xs font-serif text-[#aa7917] bg-[#fbf6ea] px-2.5 py-1 rounded-full font-bold">
                  MODE {mode.number}
                </span>
              </div>

              <h3 className="text-lg font-serif text-[#172b2b] font-bold group-hover:text-[#c9513e] transition-colors">
                {mode.title}
              </h3>
              <span className="text-[11px] text-[#aa7917] font-semibold block mt-0.5 mb-2">
                {mode.subtitle}
              </span>
              <p className="text-xs text-[#666] leading-relaxed mb-4">
                {mode.description}
              </p>

              {/* Pipeline Steps Badge Chain */}
              <div className="pt-3 border-t border-[#f0e8dc] mb-4">
                <span className="text-[10px] uppercase font-bold text-[#999] block mb-1.5">Pipeline Sequence</span>
                <div className="flex flex-wrap gap-1">
                  {mode.pipelineOrder.map((step, i) => (
                    <span key={i} className="text-[10px] bg-[#f5efe4] text-[#555] px-2 py-0.5 rounded">
                      {i + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectMode(mode.id, selectedTab === "test")}
              className="w-full py-2.5 rounded-lg bg-[#172b2b] hover:bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              Start {selectedTab === "test" ? "Test" : "Practice"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
