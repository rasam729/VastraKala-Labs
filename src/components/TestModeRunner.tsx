import React, { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Award, Sparkles, BookOpen, Compass } from "lucide-react"
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
  }
}

export default function TestModeRunner({
  modeId,
  isTestMode,
  onBack,
  onNavigateToModule
}: TestModeRunnerProps) {
  // Mode pipeline step sequencer
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [timeRemaining, setTimeRemaining] = useState<number>(isTestMode ? 300 : 0) // 5 min timer in test mode
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Session state accumulated across pipeline steps
  const [sketchData, setSketchData] = useState<any>(null)
  const [dressColor, setDressColor] = useState<string>("#c9513e")
  const [dressStyle, setDressStyle] = useState({ sleeve: "puffed", collar: "mandarin", hemline: "flared", type: "anarkali" })
  const [selectedSkins, setSelectedSkins] = useState<SkinTone[]>([])
  const [skinAnalyses, setSkinAnalyses] = useState<SkinHarmonyAnalysis[]>([])
  const [dielineScore, setDielineScore] = useState<number>(0)
  const [overallScore, setOverallScore] = useState<number>(0)

  // Speed round specific state (Mode 5)
  const [speedQuestionIdx, setSpeedQuestionIdx] = useState<number>(0)
  const [speedScore, setSpeedScore] = useState<number>(0)

  // Timer countdown
  useEffect(() => {
    if (!isTestMode || timeRemaining <= 0 || isCompleted) return
    const timer = setInterval(() => {
      setTimeRemaining((t) => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isTestMode, timeRemaining, isCompleted])

  // Final session submission and persistent history logging
  const handleFinalizeAttempt = (finalDielineScore?: number) => {
    const dScore = finalDielineScore !== undefined ? finalDielineScore : dielineScore
    let calculatedOverall = 85

    if (modeId === "mode1_prompt_to_dress") {
      calculatedOverall = Math.round((85 * 0.3) + (dScore * 0.4) + (90 * 0.3))
    } else if (modeId === "mode2_skin_tone") {
      const avgSkin = skinAnalyses.length ? Math.round(skinAnalyses.reduce((acc, c) => acc + c.score, 0) / skinAnalyses.length) : 80
      calculatedOverall = avgSkin
    } else if (modeId === "mode3_dieline_reverse") {
      calculatedOverall = dScore
    } else if (modeId === "mode5_speed_round") {
      calculatedOverall = Math.min(100, Math.round((speedScore / 10) * 100))
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
        dielineScore: dScore,
        selectedSkins: selectedSkins.map((s) => s.name),
        dressColor
      }
    }
    saveLocalAttempt(attemptRecord).catch(console.error)
  }

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
          {/* Step 1: Prompt & Sketch Studio */}
          {currentStep === 1 && (
            <div>
              {/* Challenge Brief Card */}
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

          {/* Step 2: 3D Body Fitting & Skin Tone Contrast Verification */}
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

          {/* Step 3: Technical Dieline Drafting with Measurements */}
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

      {/* MODE 5: SPEED RECOGNITION ROUND */}
      {modeId === "mode5_speed_round" && !isCompleted && (
        <div className="bg-white p-8 rounded-2xl border border-[#ded8cd] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <span className="text-xs font-bold text-[#aa7917] uppercase tracking-wider">Speed Sprint</span>
              <h3 className="text-xl font-serif text-[#172b2b]">Garment {speedQuestionIdx + 1} of 10</h3>
            </div>
            <span className="font-mono text-sm font-bold bg-[#f7f2e8] px-3 py-1 rounded">Score: {speedScore}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800"
              alt="Speed recognition garment"
              className="rounded-xl h-80 w-full object-cover shadow"
            />
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#888] uppercase block">Identify the Craft & Silhouette:</span>
              {[
                { title: "Banarasi Kadhwa Brocade Angrakha", correct: true },
                { title: "Lucknowi Chikankari Straight Kurta", correct: false },
                { title: "Kashmiri Aari Phiran", correct: false },
                { title: "Ajrakh Block Print Kalidar", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (opt.correct) setSpeedScore((s) => s + 10)
                    if (speedQuestionIdx < 9) {
                      setSpeedQuestionIdx((q) => q + 1)
                    } else {
                      handleFinalizeAttempt()
                    }
                  }}
                  className="w-full text-left p-3.5 rounded-lg border border-[#ded4c3] text-xs font-semibold hover:border-[#c9513e] hover:bg-[#fbf4f2] transition-all"
                >
                  {opt.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FINAL PEDAGOGICAL LEARNING PATH REPORT */}
      {isCompleted && (
        <div className="bg-white p-8 rounded-2xl border border-[#ded8cd] shadow-lg space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#e8e0d2]">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#28453c]">Gemini Evaluation & Pedagogy</span>
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
                    onClick={() => onNavigateToModule("precision-measurement")}
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
                    onClick={() => onNavigateToModule("foundation-textile-science")}
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
