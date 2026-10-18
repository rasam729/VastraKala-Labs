import React, { useState } from "react"
import { Compass, CheckCircle2, Award, ArrowRight, RotateCcw } from "lucide-react"

interface PlacementTestProps {
  onComplete: (score: number, assignedLevel: string) => void
  onCancel: () => void
}

interface Question {
  section: string
  question: string
  image?: string
  options: string[]
  correctIndex: number
  explanation: string
}

const PLACEMENT_QUESTIONS: Question[] = [
  {
    section: "Section A · Visual Recognition",
    question: "Which Indian regional surface ornamentation technique utilizes geometric silk thread embroidery on coarse khaddar fabric?",
    options: ["Chikankari (Lucknow)", "Phulkari (Punjab)", "Kantha (Bengal)", "Zardozi (Delhi)"],
    correctIndex: 1,
    explanation: "Phulkari translates to 'flower work' and traditionally features vivid geometric silk floss stitches across coarse cotton."
  },
  {
    section: "Section B · Colour Theory",
    question: "When pairing an ensemble with warm wheatish undertones, which palette strategy provides the highest flattering visual energy?",
    options: [
      "Low contrast monochromatic grey tones",
      "Complementary jewel tones (Emerald Paan green or Deep Indigo against gold accents)",
      "Cool neon pastels with chalky undertones",
      "Exact matching beige tone without border definition"
    ],
    correctIndex: 1,
    explanation: "Warm wheatish skin resonates with jewel tones that offer a WCAG contrast ratio above 3.5:1."
  },
  {
    section: "Section C · Pattern Mathematics",
    question: "Using standard Indian pattern drafting formulas, what is the armhole depth for a client with a 90 cm bust?",
    options: ["18.0 cm", "20.5 cm", "22.0 cm", "25.5 cm"],
    correctIndex: 2,
    explanation: "Standard armhole depth formula: Bust ÷ 6 + 7 cm = 90 ÷ 6 + 7 = 15 + 7 = 22.0 cm."
  },
  {
    section: "Section D · Cultural Literacy",
    question: "The traditional Nivi drape, recognized as modern India's classic saree style, originates from which regional heritage?",
    options: ["Deccan / Andhra Pradesh", "Kashmir Valley", "Odishan Coastal Weaves", "Rajasthani Desert Clans"],
    correctIndex: 0,
    explanation: "The pleated Nivi style evolved in the Deccan region and was standardized across Indian urban wear."
  },
  {
    section: "Section E · Pattern Math Calculation",
    question: "For a fitted Katori blouse with Bust = 88 cm and Waist = 72 cm, what is the single waist dart intake?",
    options: ["1.0 cm", "2.0 cm", "3.5 cm", "4.2 cm"],
    correctIndex: 1,
    explanation: "Dart allowance formula: (Bust − Waist) ÷ 8 = (88 − 72) ÷ 8 = 16 ÷ 8 = 2.0 cm per dart."
  }
]

export default function PlacementTest({ onComplete, onCancel }: PlacementTestProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [isFinished, setIsFinished] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [assignedLevel, setAssignedLevel] = useState<string>("intermediate")

  const handleSelectOption = (optIndex: number) => {
    const updated = [...selectedAnswers]
    updated[currentIdx] = optIndex
    setSelectedAnswers(updated)
  }

  const handleNext = () => {
    if (currentIdx < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      // Calculate score
      let correctCount = 0
      PLACEMENT_QUESTIONS.forEach((q, i) => {
        if (selectedAnswers[i] === q.correctIndex) {
          correctCount++
        }
      })

      const finalPercentage = Math.round((correctCount / PLACEMENT_QUESTIONS.length) * 100)
      let level = "foundation"
      if (finalPercentage >= 80) level = "advanced"
      else if (finalPercentage >= 50) level = "intermediate"

      setScore(finalPercentage)
      setAssignedLevel(level)
      setIsFinished(true)
      onComplete(finalPercentage, level)
    }
  }

  const q = PLACEMENT_QUESTIONS[currentIdx]
  const currentAnswer = selectedAnswers[currentIdx]

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-[#ded8cd] shadow-md space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#e8dfd1]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#c9513e]">Diagnostic Assessment</span>
          <h2 className="text-2xl font-serif text-[#172b2b]">VastraShastra Placement Test</h2>
        </div>
        {!isFinished && (
          <span className="text-xs font-mono font-bold bg-[#faf6ee] px-3 py-1 rounded-full text-[#aa7917] border border-[#e5dccf]">
            Question {currentIdx + 1} of {PLACEMENT_QUESTIONS.length}
          </span>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#194b65] block mb-1">
              {q.section}
            </span>
            <p className="text-base text-[#172b2b] font-medium leading-relaxed">
              {q.question}
            </p>
          </div>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all ${
                  currentAnswer === i
                    ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e] ring-2 ring-[#c9513e]/20"
                    : "border-[#e0d6c5] hover:bg-[#faf6ee] text-[#444]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    currentAnswer === i ? "border-[#c9513e] bg-[#c9513e] text-white" : "border-[#ccc]"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#e8dfd1]">
            <button onClick={onCancel} className="text-xs text-[#888] font-semibold hover:text-[#172b2b]">
              Exit Placement
            </button>
            <button
              onClick={handleNext}
              disabled={currentAnswer === undefined}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#172b2b] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#c9513e] transition-all disabled:opacity-50"
            >
              {currentIdx === PLACEMENT_QUESTIONS.length - 1 ? "Submit Exam" : "Next Question"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#f2e8dc] text-[#c9513e] mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-serif text-[#172b2b]">Assessment Complete</h3>
            <p className="text-xs text-[#666] mt-1">Your knowledge level across Indian, Western, and Fusion couture has been analyzed.</p>
          </div>

          <div className="p-6 bg-[#faf7f0] rounded-xl border border-[#e5dccf] max-w-md mx-auto space-y-2">
            <span className="text-xs text-[#888] uppercase font-bold tracking-wider block">Assigned Starting Tier</span>
            <strong className="text-3xl font-serif text-[#c9513e] capitalize block">
              Level {assignedLevel}
            </strong>
            <span className="text-sm font-mono font-bold text-[#172b2b]">Score: {score}%</span>
          </div>

          <p className="text-xs text-[#555] max-w-md mx-auto">
            {assignedLevel === "advanced"
              ? "Exceptional fluency! You qualify directly for Module 03 (Advanced Pattern Mathematics) and Fusion Studio Challenges."
              : assignedLevel === "intermediate"
              ? "Solid foundation in textile literacy. Your personalized path starts with Module 02 (Colour & Composition) and Bodice Blocks."
              : "Welcome to couture drafting! We recommend starting with Module 01 (Foundations of Form & Grain Line Physics)."}
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b04332]"
            >
              Enter Personalized Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
