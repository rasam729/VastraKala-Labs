import React, { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Award, Sparkles, BookOpen, Compass, Layers, Palette, Scissors, FileText, Check, ChevronRight } from "lucide-react"
import AIDesignStudio from "./AIDesignStudio"
import GarmentViewer3D from "./GarmentViewer3D"
import DielineStudio from "./DielineStudio"
import { SKIN_TONES, type SkinTone, type SkinHarmonyAnalysis } from "../lib/colourTheory"
import { saveLocalAttempt } from "../lib/db"

interface TestModeRunnerProps {
  modeId: string
  isTestMode: boolean
  onBack: () => void
  onNavigateToModule?: (moduleSlug: string) => void
}

const CHALLENGE_PROMPTS = {
  mode1: {
    client: "Ananya Iyer, 28 · Wheatish Golden Undertone",
    occasion: "Diwali Evening Heritage Gala at Udaipur City Palace",
    material: "Raw Mulberry Silk with Tissue Organza Overlay",
    constraint: "Must incorporate traditional Rajasthani Gota Patti or Kashmiri Tilla work",
    region: "Royal Heritage Fusion"
  },
  mode2: {
    dressName: "Sindoor & Indigo Banarasi Angrakha",
    dressColor: "#c9513e",
    dressImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    description: "Deep madder terracotta bodice with antique zari brocade borders and cobalt indigo accents."
  },
  mode4: {
    traditionA: "Kanjeevaram Silk Temple Saree Weave",
    traditionB: "Modern French Tailored Trench Coat Silhouette",
    challenge: "Engineer a high-fashion Indo-Western overcoat preserving temple borders without seam distortion."
  },
  mode6: {
    client: "Meera Singhania · International Arts Curator",
    brief: "Venice Biennale Opening Gala · Theme: Living Weaves of the Global South",
    deliverables: ["1. Concept Sketch & Digital Silhouette", "2. 3D Body Mannequin Fit & Skin Tone Pairing", "3. Pattern Cutting Dieline with Seam Dimensions"],
    rubric: [
      { name: "Cultural Integrity & Textile Knowledge", weight: 35 },
      { name: "Pattern Mathematics & Seam Precision", weight: 35 },
      { name: "Silhouette Innovation & Draping Balance", weight: 30 }
    ]
  }
}

// 10 distinct Speed Sprint questions with distinct images & options
const SPEED_QUESTIONS = [
  {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "Identify the regional weave and silhouette of this courtly ensemble:",
    options: [
      { title: "Banarasi Kadhwa Brocade Angrakha", correct: true },
      { title: "Lucknowi Chikankari Straight Kurta", correct: false },
      { title: "Kashmiri Aari Phiran", correct: false },
      { title: "Ajrakh Block Print Kalidar", correct: false }
    ],
    hint: "Notice the overlapping asymmetrical bodice and rich metallic zari florals."
  },
  {
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "Which embroidery technique is highlighted on this sheer neckline panel?",
    options: [
      { title: "Phulkari Geometric Floss Silk", correct: false },
      { title: "Chikankari Shadow Work (Tepchi & Bakhiya)", correct: true },
      { title: "Zardozi Raised Bullion Wire", correct: false },
      { title: "Kutch Mirror Work", correct: false }
    ],
    hint: "Look for delicate white-on-white stitches on fine muslin/georgette."
  },
  {
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "What is the primary weave signature shown on the pallu border?",
    options: [
      { title: "Chanderi Extra-Weft Booti", correct: false },
      { title: "Kanjeevaram Korvai Interlocking Border", correct: true },
      { title: "Sambalpuri Bandha Ikat", correct: false },
      { title: "Pochampally Double Ikat", correct: false }
    ],
    hint: "Heavy mulberry silk with contrasting body-border joined via interlocking shuttles."
  },
  {
    image: "https://images.unsplash.com/photo-1627705954911-940ac915d557?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "Which resist-dye method creates the blurred geometric feathery edges shown?",
    options: [
      { title: "Bandhani Tie-and-Dye (Knotted)", correct: false },
      { title: "Ikat Warp & Weft Resist (Bandha)", correct: true },
      { title: "Batik Wax Resist", correct: false },
      { title: "Dabu Mud Resist", correct: false }
    ],
    hint: "Threads are bound and dyed prior to weaving on the loom."
  },
  {
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "This metallic relief embroidery with sequins and couched wire is:",
    options: [
      { title: "Zardozi with Salma-Sitara", correct: true },
      { title: "Kantha Running Stitch", correct: false },
      { title: "Kashmiri Sozni", correct: false },
      { title: "Gota Patti Appliqué", correct: false }
    ],
    hint: "Heavy three-dimensional metallic wire work historically patronized by Mughal courts."
  },
  {
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "The standard waist dart allowance formula for Indian choli bodice is:",
    options: [
      { title: "Bust ÷ 4 + 2 cm", correct: false },
      { title: "(Bust − Waist) ÷ 8", correct: true },
      { title: "Waist ÷ 6 + 1.5 cm", correct: false },
      { title: "Shoulder ÷ 2 − 3 cm", correct: false }
    ],
    hint: "Calculates the excess fabric intake to distribute between front and back waist darts."
  },
  {
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "Which fabric grain cut gives 45-degree fluid draping over curves?",
    options: [
      { title: "Straight grain (Warp)", correct: false },
      { title: "Cross grain (Weft)", correct: false },
      { title: "True Bias grain", correct: true },
      { title: "Selvedge edge", correct: false }
    ],
    hint: "Diagonal cut offering natural elasticity without spandex."
  },
  {
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "Under the classical Nivi saree draping system, how many pleats are tucked into the front waist?",
    options: [
      { title: "2 to 3 pleats", correct: false },
      { title: "7 to 10 pleats", correct: true },
      { title: "14 to 18 pleats", correct: false },
      { title: "No pleats (straight wrap)", correct: false }
    ],
    hint: "Usually 5 inches wide each, neatly accordion-folded and tucked facing left."
  },
  {
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "A client with cool pinkish undertone will achieve highest elegance with:",
    options: [
      { title: "Mustard yellow and olive green", correct: false },
      { title: "Royal sapphire, jewel ruby, and emerald", correct: true },
      { title: "Earthy rust and warm beige", correct: false },
      { title: "Pure fluorescent neon lime", correct: false }
    ],
    hint: "Cool jewel tones harmonize with blue/pink skin undertones."
  },
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    question: "Natural indigo dyeing requires which chemical process to fix colour to fibre?",
    options: [
      { title: "Acid boil mordanting", correct: false },
      { title: "Alkaline reduction followed by air oxidation", correct: true },
      { title: "Direct sun drying with salt", correct: false },
      { title: "Alcohol extraction", correct: false }
    ],
    hint: "Vat dye process turns yellow-green in vat and blue upon exposure to atmospheric oxygen."
  }
]

export default function TestModeRunner({
  modeId,
  isTestMode,
  onBack,
  onNavigateToModule
}: TestModeRunnerProps) {
  // Mode pipeline step sequencer
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [timeRemaining, setTimeRemaining] = useState<number>(isTestMode ? 300 : 0) // 5 min timer
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Session state accumulated across pipeline steps
  const [sketchData, setSketchData] = useState<any>(null)
  const [dressColor, setDressColor] = useState<string>("#c9513e")
  const [dressStyle, setDressStyle] = useState({ sleeve: "puffed", collar: "mandarin", hemline: "flared", type: "anarkali" })
  const [selectedSkins, setSelectedSkins] = useState<SkinTone[]>([])
  const [skinAnalyses, setSkinAnalyses] = useState<SkinHarmonyAnalysis[]>([])
  const [dielineScore, setDielineScore] = useState<number>(0)
  const [overallScore, setOverallScore] = useState<number>(0)

  // Mode 4 Blend State
  const [fusionTraditionA, setFusionTraditionA] = useState("Kanjeevaram Temple Silk")
  const [fusionTraditionB, setFusionTraditionB] = useState("French Structured Trench Coat")
  const [fusionFabricNote, setFusionFabricNote] = useState("Reinforce heavy silk lapels with canvas interfacing to prevent warp stretch.")
  const [fusionStep, setFusionStep] = useState(1)

  // Mode 5 Speed round state
  const [speedQuestionIdx, setSpeedQuestionIdx] = useState<number>(0)
  const [speedScore, setSpeedScore] = useState<number>(0)
  const [selectedSpeedOpt, setSelectedSpeedOpt] = useState<number | null>(null)
  const [speedAnswered, setSpeedAnswered] = useState(false)

  // Mode 6 Capstone Case Study state
  const [caseStudyStep, setCaseStudyStep] = useState(1)
  const [caseStudyConcept, setCaseStudyConcept] = useState("Modern Angrakha Gown featuring hand-woven Banarasi zari bodice with structured organza cape.")
  const [caseStudyFeedback, setCaseStudyFeedback] = useState<string[]>([])

  // Timer countdown
  useEffect(() => {
    if (!isTestMode || timeRemaining <= 0 || isCompleted) return
    const timer = setInterval(() => {
      setTimeRemaining((t) => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isTestMode, timeRemaining, isCompleted])

  // Final session submission and persistent history logging
  const handleFinalizeAttempt = (customScore?: number) => {
    let calculatedOverall = 85

    if (customScore !== undefined) {
      calculatedOverall = customScore
    } else if (modeId === "mode1_prompt_to_dress") {
      calculatedOverall = Math.round((85 * 0.3) + ((dielineScore || 80) * 0.4) + (90 * 0.3))
    } else if (modeId === "mode2_skin_tone") {
      const avgSkin = skinAnalyses.length ? Math.round(skinAnalyses.reduce((acc, c) => acc + c.score, 0) / skinAnalyses.length) : 80
      calculatedOverall = avgSkin
    } else if (modeId === "mode3_dieline_reverse") {
      calculatedOverall = dielineScore || 82
    } else if (modeId === "mode4_blend_fusion") {
      calculatedOverall = 88
    } else if (modeId === "mode5_speed_round") {
      calculatedOverall = Math.min(100, Math.round((speedScore / 10) * 100))
    } else if (modeId === "mode6_case_study") {
      calculatedOverall = 92
    }

    setOverallScore(calculatedOverall)
    setIsCompleted(true)

    // Save to local IndexedDB attempt history
    const attemptRecord = {
      id: "attempt-" + Date.now(),
      mode: modeId,
      title: modeId.replace(/_/g, " ").toUpperCase(),
      score: calculatedOverall,
      date: new Date().toISOString(),
      summary: `Completed ${modeId} with an overall accuracy of ${calculatedOverall}%.`,
      details: {
        dielineScore,
        selectedSkins: selectedSkins.map((s) => s.name),
        dressColor
      }
    }
    saveLocalAttempt(attemptRecord).catch(console.error)
  }

  const speedQ = SPEED_QUESTIONS[speedQuestionIdx]

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#ded8cd] flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#172b2b] hover:text-[#c9513e]"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Modes
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 bg-[#faf6ee] text-[#aa7917] rounded-full border border-[#e5dccf]">
            {modeId.replace(/_/g, " ")} · {isTestMode ? "Evaluated Mode" : "Learning Lab"}
          </span>

          {isTestMode && timeRemaining > 0 && !isCompleted && (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#c9513e] bg-[#fbf2f0] px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: PROMPT-TO-DRESS PIPELINE */}
      {modeId === "mode1_prompt_to_dress" && !isCompleted && (
        <div className="space-y-6">
          {currentStep === 1 && (
            <div>
              <div className="bg-[#172b2b] text-white p-5 rounded-xl mb-6 shadow-md border-l-4 border-[#c9513e]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Client Scenario Brief</span>
                    <h3 className="text-xl font-serif mt-0.5">{CHALLENGE_PROMPTS.mode1.occasion}</h3>
                    <p className="text-xs text-[#b8c2bd] mt-1">
                      <strong>Client:</strong> {CHALLENGE_PROMPTS.mode1.client} · <strong>Material:</strong> {CHALLENGE_PROMPTS.mode1.material}
                    </p>
                    <p className="text-xs text-[#e8b547] mt-1 font-medium">
                      Constraint: {CHALLENGE_PROMPTS.mode1.constraint}
                    </p>
                  </div>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-md font-mono">Step 1 of 3</span>
                </div>
              </div>

              <AIDesignStudio
                onDressGenerated={(data) => {
                  setSketchData(data)
                  setDressColor(data.color)
                  setDressStyle(data.style)
                }}
                onNavigateTo3D={() => setCurrentStep(2)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c9513e]">Step 2 of 3</span>
                  <h3 className="text-lg font-serif text-[#172b2b]">3D Digital Twin Fit & Skin Tone Matching</h3>
                  <p className="text-xs text-[#666]">
                    Evaluate how the {dressColor} ensemble drapes over the body and matches Ananya's golden wheatish undertone.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-lg bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b04332]"
                >
                  Proceed to Dieline Drafting →
                </button>
              </div>

              <GarmentViewer3D
                dressColor={dressColor}
                dressStyle={dressStyle}
                onSkinSelected={(skins, ana) => {
                  setSelectedSkins(skins)
                  setSkinAnalyses(ana)
                }}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#194b65]">Step 3 of 3</span>
                  <h3 className="text-lg font-serif text-[#172b2b]">Pattern Dieline & Mathematical Verification</h3>
                  <p className="text-xs text-[#666]">
                    Draft the seam cut lines with exact dimensions to make this garment manufacturing ready.
                  </p>
                </div>
                <button
                  onClick={() => handleFinalizeAttempt()}
                  className="px-5 py-2.5 rounded-lg bg-[#28453c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1a352c]"
                >
                  Complete Mode Evaluation
                </button>
              </div>

              <DielineStudio
                onComplete={(score) => {
                  setDielineScore(score)
                  handleFinalizeAttempt(score)
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* MODE 2: SKIN TONE HARMONY CHALLENGE */}
      {modeId === "mode2_skin_tone" && !isCompleted && (
        <div className="space-y-6">
          <div className="bg-[#172b2b] text-white p-5 rounded-xl border-l-4 border-[#aa7917]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Mode 02 Challenge</span>
            <h3 className="text-xl font-serif mt-0.5">{CHALLENGE_PROMPTS.mode2.dressName}</h3>
            <p className="text-xs text-[#cad5cf] mt-1 max-w-2xl">
              Inspect this {CHALLENGE_PROMPTS.mode2.dressColor} couture dress draped on a white body model. Select 3 skin tones that produce the most harmonious contrast and cultural wearability.
            </p>
          </div>

          <GarmentViewer3D
            dressColor={CHALLENGE_PROMPTS.mode2.dressColor}
            onSkinSelected={(skins, ana) => {
              setSelectedSkins(skins)
              setSkinAnalyses(ana)
            }}
          />

          <div className="flex justify-end">
            <button
              onClick={() => handleFinalizeAttempt()}
              disabled={selectedSkins.length < 3}
              className="px-6 py-3 rounded-lg bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[#b04332]"
            >
              Submit 3 Skin Tone Rankings ({selectedSkins.length}/3)
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: DIELINE REVERSE ENGINEERING */}
      {modeId === "mode3_dieline_reverse" && !isCompleted && (
        <div className="space-y-6">
          <div className="bg-[#194b65] text-white p-5 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Mode 03 Technical Exam</span>
            <h3 className="text-xl font-serif mt-0.5">Reverse Pattern Engineering</h3>
            <p className="text-xs text-[#cfdfeb] mt-1">
              Analyze the garment flat on the right. Draft its cutting dieline on the grid canvas and annotate your quarter bust, armhole depth, and dart allowances.
            </p>
          </div>

          <DielineStudio
            onComplete={(score) => {
              setDielineScore(score)
              handleFinalizeAttempt(score)
            }}
          />
        </div>
      )}

      {/* MODE 4: INDO-WESTERN BLEND & FUSION */}
      {modeId === "mode4_blend_fusion" && !isCompleted && (
        <div className="space-y-6">
          <div className="bg-[#28453c] text-white p-5 rounded-xl border-l-4 border-[#e8b547]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Mode 04 · Hybrid Couture Challenge</span>
            <h3 className="text-xl font-serif mt-0.5">Indo-Western Blend & Silhouette Fusion</h3>
            <p className="text-xs text-[#cad5cf] mt-1 max-w-2xl">
              Fuse two distinct historical traditions into a cohesive, wearable high-fashion piece. Balance drape fluid dynamics with tailoring structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tradition A Picker */}
            <div className="bg-white p-5 rounded-xl border border-[#ded8cd] space-y-3">
              <span className="text-[10px] font-bold text-[#c9513e] uppercase tracking-wider block">Tradition A (Indian Heritage Element)</span>
              <select
                value={fusionTraditionA}
                onChange={(e) => setFusionTraditionA(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#ded4c3] text-sm font-semibold bg-[#faf8f4]"
              >
                <option value="Kanjeevaram Temple Silk">Kanjeevaram Temple Silk (Heavy Korvai Brocade)</option>
                <option value="Banarasi Kadhwa Zari">Banarasi Kadhwa Gold & Silver Brocade</option>
                <option value="Kashmir Tilla & Pashmina">Kashmiri Tilla Metal Needlework on Fine Pashmina</option>
                <option value="Bandhani & Leheriya Silk">Rajasthani Hand-Knotted Leheriya Silk</option>
                <option value="Chanderi Gossamer Tissue">Chanderi Gossamer Sheer Tissue with Zari Border</option>
              </select>
              <p className="text-xs text-[#777]">Selected tradition contributes colour palette, weave stiffness, and border motif.</p>
            </div>

            {/* Tradition B Picker */}
            <div className="bg-white p-5 rounded-xl border border-[#ded8cd] space-y-3">
              <span className="text-[10px] font-bold text-[#194b65] uppercase tracking-wider block">Tradition B (Global Silhouette Structure)</span>
              <select
                value={fusionTraditionB}
                onChange={(e) => setFusionTraditionB(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#ded4c3] text-sm font-semibold bg-[#faf8f4]"
              >
                <option value="French Structured Trench Coat">French Structured Trench Coat (Raglan Sleeve & Storm Flap)</option>
                <option value="Savile Row Tailored Double-Breasted Blazer">Savile Row Double-Breasted Structured Blazer</option>
                <option value="Japanese Kimono Origami Fold Gown">Japanese Kimono & Origami Fold Structured Cape</option>
                <option value="Edwardian Corsetry Bodice">Edwardian Boned Corsetry with Basque Waist</option>
                <option value="Modern Architectural Cape Jumpsuit">Modern Architectural Cape Jumpsuit</option>
              </select>
              <p className="text-xs text-[#777]">Selected architecture dictates the pattern seams, shoulder line, and internal canvas.</p>
            </div>
          </div>

          {/* Fusion Studio Interaction */}
          <div className="bg-white p-6 rounded-2xl border border-[#ded8cd] space-y-4">
            <h4 className="text-sm font-serif font-bold text-[#172b2b]">Technical Feasibility & Seam Engineering Note</h4>
            <textarea
              value={fusionFabricNote}
              onChange={(e) => setFusionFabricNote(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-[#ded4c3] text-xs text-[#444] bg-[#faf8f4] focus:outline-none focus:border-[#c9513e]"
              placeholder="Describe how you will interface the fabric and draft the pattern transition..."
            />

            <div className="p-4 bg-[#fbf7f0] rounded-xl border border-[#e5dccf] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#aa7917]">AI Synergy Rating</span>
                <p className="text-xs text-[#555]">
                  Pairing <strong>{fusionTraditionA}</strong> with <strong>{fusionTraditionB}</strong> scores <strong>94% feasibility</strong>.
                </p>
              </div>
              <button
                onClick={() => handleFinalizeAttempt(90)}
                className="px-6 py-2.5 rounded-lg bg-[#172b2b] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c9513e] transition-all"
              >
                Submit Fusion Capstone →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: SPEED RECOGNITION ROUND */}
      {modeId === "mode5_speed_round" && !isCompleted && speedQ && (
        <div className="bg-white p-8 rounded-2xl border border-[#ded8cd] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <span className="text-xs font-bold text-[#aa7917] uppercase tracking-wider">Speed Sprint</span>
              <h3 className="text-xl font-serif text-[#172b2b]">Garment {speedQuestionIdx + 1} of {SPEED_QUESTIONS.length}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-[#f0ebd8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#aa7917] transition-all"
                  style={{ width: `${((speedQuestionIdx + 1) / SPEED_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span className="font-mono text-sm font-bold bg-[#f7f2e8] px-3 py-1 rounded">Score: {speedScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <img
                src={speedQ.image}
                alt="Speed recognition garment"
                className="rounded-xl h-80 w-full object-cover shadow border border-[#ded8cd]"
              />
              <p className="text-[11px] text-[#888] italic">💡 Hint: {speedQ.hint}</p>
            </div>

            <div className="space-y-4">
              <span className="text-sm font-serif font-bold text-[#172b2b] block">{speedQ.question}</span>

              <div className="space-y-2.5">
                {speedQ.options.map((opt, i) => {
                  const isSelected = selectedSpeedOpt === i
                  let btnClass = "border-[#ded4c3] text-[#444] hover:border-[#c9513e] hover:bg-[#fbf4f2]"

                  if (speedAnswered) {
                    if (opt.correct) btnClass = "border-[#28a745] bg-[#edf5f0] text-[#1a5c2e] font-bold"
                    else if (isSelected && !opt.correct) btnClass = "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e]"
                  }

                  return (
                    <button
                      key={i}
                      disabled={speedAnswered}
                      onClick={() => {
                        setSelectedSpeedOpt(i)
                        setSpeedAnswered(true)
                        if (opt.correct) {
                          setSpeedScore((s) => s + 10)
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all ${btnClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt.title}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {speedAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (speedQuestionIdx < SPEED_QUESTIONS.length - 1) {
                        setSpeedQuestionIdx((q) => q + 1)
                        setSelectedSpeedOpt(null)
                        setSpeedAnswered(false)
                      } else {
                        handleFinalizeAttempt(Math.min(100, Math.round(((speedScore + (speedQ.options[selectedSpeedOpt ?? 0]?.correct ? 0 : 0)) / SPEED_QUESTIONS.length) * 100)))
                      }
                    }}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-[#172b2b] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#c9513e]"
                  >
                    {speedQuestionIdx < SPEED_QUESTIONS.length - 1 ? "Next Question →" : "See Final Score →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 6: COMPREHENSIVE JURY CASE STUDY */}
      {modeId === "mode6_case_study" && !isCompleted && (
        <div className="space-y-6">
          <div className="bg-[#172b2b] text-white p-6 rounded-2xl shadow-lg border-l-4 border-[#e8b547]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">Mode 06 · Capstone Examination</span>
                <h3 className="text-2xl font-serif mt-0.5">Comprehensive Jury Case Study</h3>
                <p className="text-xs text-[#cad5cf] mt-1 max-w-2xl">
                  {CHALLENGE_PROMPTS.mode6.client} · <em>{CHALLENGE_PROMPTS.mode6.brief}</em>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setCaseStudyStep(step)}
                    className={`w-8 h-8 rounded-full text-xs font-bold font-mono transition-all ${
                      caseStudyStep === step
                        ? "bg-[#e8b547] text-[#172b2b]"
                        : caseStudyStep > step
                        ? "bg-[#28453c] text-white"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    0{step}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 1: Concept & Silhouette Design */}
          {caseStudyStep === 1 && (
            <div className="space-y-4">
              <div className="bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c9513e]">Portfolio Deliverable 1 of 3</span>
                  <h4 className="text-base font-serif text-[#172b2b]">Silhouette Concept & Digital Sketching</h4>
                  <p className="text-xs text-[#666]">Draft the client gown concept incorporating living handlooms.</p>
                </div>
                <button
                  onClick={() => setCaseStudyStep(2)}
                  className="px-5 py-2 bg-[#c9513e] text-white text-xs font-bold rounded-lg hover:bg-[#b04332]"
                >
                  Proceed to 3D Fit Phase →
                </button>
              </div>

              <AIDesignStudio
                onDressGenerated={(data) => {
                  setSketchData(data)
                  setDressColor(data.color)
                  setDressStyle(data.style)
                }}
                onNavigateTo3D={() => setCaseStudyStep(2)}
              />
            </div>
          )}

          {/* Phase 2: 3D Body Mannequin Fit & Skin Harmony */}
          {caseStudyStep === 2 && (
            <div className="space-y-4">
              <div className="bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#aa7917]">Portfolio Deliverable 2 of 3</span>
                  <h4 className="text-base font-serif text-[#172b2b]">3D Digital Twin Fit & Contrast Ratio Verification</h4>
                  <p className="text-xs text-[#666]">Verify proportions on the anatomical 3D mannequin and select the skin tone palette.</p>
                </div>
                <button
                  onClick={() => setCaseStudyStep(3)}
                  className="px-5 py-2 bg-[#c9513e] text-white text-xs font-bold rounded-lg hover:bg-[#b04332]"
                >
                  Proceed to Dieline Phase →
                </button>
              </div>

              <GarmentViewer3D
                dressColor={dressColor}
                dressStyle={dressStyle}
                onSkinSelected={(skins, ana) => {
                  setSelectedSkins(skins)
                  setSkinAnalyses(ana)
                }}
              />
            </div>
          )}

          {/* Phase 3: Mathematical Pattern Dieline */}
          {caseStudyStep === 3 && (
            <div className="space-y-4">
              <div className="bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#194b65]">Portfolio Deliverable 3 of 3</span>
                  <h4 className="text-base font-serif text-[#172b2b]">Production-Grade Pattern Dieline Draft</h4>
                  <p className="text-xs text-[#666]">Draft the armhole, bust, waist, and seam allowances for master atelier cutting.</p>
                </div>
                <button
                  onClick={() => handleFinalizeAttempt(92)}
                  className="px-6 py-2 bg-[#28453c] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#1a352c]"
                >
                  Submit Jury Portfolio →
                </button>
              </div>

              <DielineStudio
                onComplete={(score) => {
                  setDielineScore(score)
                  handleFinalizeAttempt(Math.max(90, score))
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* FINAL PEDAGOGICAL LEARNING PATH REPORT */}
      {isCompleted && (
        <div className="bg-white p-8 rounded-2xl border border-[#ded8cd] shadow-lg space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#e8e0d2]">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#28453c]">Pedagogical Jury Evaluation</span>
              <h2 className="text-3xl font-serif text-[#172b2b] mt-1">Session Performance Assessment</h2>
              <p className="text-xs text-[#666] mt-1">
                Attempt saved to your persistent portfolio history. Here is your tailored diagnostic feedback and next milestone path.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-5 py-3 rounded-xl bg-[#f7f2e8] border border-[#e0d6c5]">
                <span className="text-[10px] text-[#888] font-bold uppercase block">Overall Score</span>
                <strong className="text-3xl font-serif text-[#c9513e]">{overallScore}%</strong>
              </div>
            </div>
          </div>

          {/* 3 Feedback Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#faf7f0] p-5 rounded-xl border border-[#e5dccf] space-y-2">
              <span className="text-xs font-bold uppercase text-[#c9513e] block">Strengths Demonstrated</span>
              <ul className="text-xs text-[#555] space-y-1.5 list-disc list-inside">
                <li>Strong aesthetic balance between Zari border and bodice background.</li>
                <li>Accurate dart intake calculations based on natural waist ratios.</li>
                <li>Good awareness of regional Indian silhouette draping.</li>
              </ul>
            </div>

            <div className="bg-[#faf7f0] p-5 rounded-xl border border-[#e5dccf] space-y-2">
              <span className="text-xs font-bold uppercase text-[#aa7917] block">Areas for Focus</span>
              <ul className="text-xs text-[#555] space-y-1.5 list-disc list-inside">
                <li>Armhole depth requires verification (formula: Bust ÷ 6 + 7 cm).</li>
                <li>Increase contrast ratio when pairing with deep espresso skin tones.</li>
                <li>Remember to add 5% warp shrinkage allowance for pure cotton yardage.</li>
              </ul>
            </div>

            <div className="bg-[#faf7f0] p-5 rounded-xl border border-[#e5dccf] space-y-2">
              <span className="text-xs font-bold uppercase text-[#194b65] block">Approach Tips</span>
              <p className="text-xs text-[#555] leading-relaxed">
                When designing flared kalis, always calculate panel hem width using the flare multiplier formula before cutting to avoid fabric shortage.
              </p>
            </div>
          </div>

          {/* Recommended Next Modules & Links */}
          <div className="bg-[#f5efe4] p-6 rounded-xl border border-[#ded2c0] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172b2b] block flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#c9513e]" /> Tailored Next Learning Modules
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-[#e2d6c5] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#aa7917] font-bold block">Module 03 · Lesson 2</span>
                  <strong className="text-sm font-serif text-[#172b2b]">Armhole Depth & Sleeve Crown Drafting</strong>
                  <p className="text-xs text-[#777] mt-0.5">Master the mathematical ease formula for arm elevation.</p>
                </div>
                {onNavigateToModule && (
                  <button
                    onClick={() => onNavigateToModule("ethnic-pattern-making")}
                    className="px-3 py-1.5 bg-[#172b2b] text-white text-xs font-bold rounded hover:bg-[#c9513e]"
                  >
                    Open Lesson
                  </button>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#e2d6c5] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#c9513e] font-bold block">Module 02 · Lesson 2</span>
                  <strong className="text-sm font-serif text-[#172b2b]">Skin Tone Undertones & Contrast Ratios</strong>
                  <p className="text-xs text-[#777] mt-0.5">Learn WCAG luminance pairing for Indian ethnic wear.</p>
                </div>
                {onNavigateToModule && (
                  <button
                    onClick={() => onNavigateToModule("traditional-indian-textiles")}
                    className="px-3 py-1.5 bg-[#172b2b] text-white text-xs font-bold rounded hover:bg-[#c9513e]"
                  >
                    Open Lesson
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-lg border border-[#172b2b] text-xs font-bold text-[#172b2b] hover:bg-[#f7f2e8]"
            >
              Back to Mode Selection
            </button>
            <button
              onClick={() => {
                setIsCompleted(false)
                setCurrentStep(1)
                setSpeedQuestionIdx(0)
                setSpeedScore(0)
                setSpeedAnswered(false)
                setSelectedSpeedOpt(null)
                setCaseStudyStep(1)
              }}
              className="px-6 py-2.5 rounded-lg bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b04332]"
            >
              Try Another Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
