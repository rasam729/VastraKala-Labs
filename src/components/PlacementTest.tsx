import React, { useState } from "react"
import { Award, ArrowRight, RotateCcw, CheckCircle2, XCircle, ChevronRight } from "lucide-react"
import { getDefaultPath } from "../lib/auth"

interface PlacementTestProps {
  onComplete: (score: number, assignedLevel: string) => void
  onCancel: () => void
  testVariant?: number // 0-5, which of the 6 variants
}

interface Question {
  section: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: "history" | "textile" | "pattern" | "colour" | "construction" | "sustainability"
  difficulty: "easy" | "medium" | "hard"
}

// ─── 6 PLACEMENT TEST QUESTION BANKS (1 per variant/placement mode) ──────────

const QUESTION_BANKS: Question[][] = [
  // BANK 0: Visual Recognition & Textile Heritage
  [
    {
      section: "Section A · Textile Identification",
      question: "Which Indian surface ornamentation technique uses geometric silk thread embroidery on coarse khaddar fabric from Punjab?",
      options: ["Chikankari (Lucknow)", "Phulkari (Punjab)", "Kantha (Bengal)", "Zardozi (Delhi)"],
      correctIndex: 1,
      explanation: "Phulkari translates to 'flower work' and traditionally features vivid geometric silk floss stitches across coarse cotton khaddar.",
      topic: "textile", difficulty: "easy"
    },
    {
      section: "Section B · Colour Theory",
      question: "When pairing an ensemble with warm wheatish undertones, which palette strategy provides the highest flattering visual energy?",
      options: ["Low contrast monochromatic grey tones", "Complementary jewel tones (Emerald or Deep Indigo against gold)", "Cool neon pastels with chalky undertones", "Exact matching beige without border definition"],
      correctIndex: 1,
      explanation: "Warm wheatish skin resonates with jewel tones offering WCAG contrast ratio above 3.5:1.",
      topic: "colour", difficulty: "medium"
    },
    {
      section: "Section C · Pattern Mathematics",
      question: "Using standard Indian pattern drafting formulas, what is the armhole depth for a client with a 90 cm bust?",
      options: ["18.0 cm", "20.5 cm", "22.0 cm", "25.5 cm"],
      correctIndex: 2,
      explanation: "Armhole depth = Bust ÷ 6 + 7 cm = 90 ÷ 6 + 7 = 15 + 7 = 22.0 cm.",
      topic: "pattern", difficulty: "medium"
    },
    {
      section: "Section D · Cultural Literacy",
      question: "The traditional Nivi drape, recognized as modern India's classic saree style, originates from which region?",
      options: ["Deccan / Andhra Pradesh", "Kashmir Valley", "Odishan Coastal Weaves", "Rajasthani Desert Clans"],
      correctIndex: 0,
      explanation: "The pleated Nivi style evolved in the Deccan region and was standardized across Indian urban wear.",
      topic: "history", difficulty: "easy"
    },
    {
      section: "Section E · Pattern Calculation",
      question: "For a fitted Katori blouse with Bust = 88 cm, Waist = 72 cm, what is the single waist dart intake?",
      options: ["1.0 cm", "2.0 cm", "3.5 cm", "4.2 cm"],
      correctIndex: 1,
      explanation: "Dart allowance = (Bust − Waist) ÷ 8 = (88 − 72) ÷ 8 = 16 ÷ 8 = 2.0 cm per dart.",
      topic: "pattern", difficulty: "hard"
    },
    {
      section: "Section F · Sustainability",
      question: "Which principle best describes zero-waste fashion design?",
      options: ["Using synthetic fibres only", "Designing patterns that use 100% of fabric yardage with no offcuts", "Buying from only Indian brands", "Avoiding embroidery to reduce labour"],
      correctIndex: 1,
      explanation: "Zero-waste fashion involves pattern-making strategies that eliminate fabric waste entirely, often using puzzle-like layout systems.",
      topic: "sustainability", difficulty: "easy"
    }
  ],

  // BANK 1: Colour & Construction Focus
  [
    {
      section: "Section A · Colour Science",
      question: "What is the complementary colour of Indigo (approximate hue 240°) on the colour wheel?",
      options: ["Violet", "Amber / Orange-Yellow", "Magenta", "Turquoise"],
      correctIndex: 1,
      explanation: "Complementary colours sit opposite on the wheel. Indigo (240°) has its complement at 60°, which is Amber/Yellow-Orange.",
      topic: "colour", difficulty: "medium"
    },
    {
      section: "Section B · Textile Science",
      question: "Banarasi silk is woven on which loom type that uses a jacquard mechanism to create intricate brocade patterns?",
      options: ["Fly shuttle pit loom", "Frame loom", "Inkle loom", "Tapestry loom"],
      correctIndex: 0,
      explanation: "Traditional Banarasi weaving uses a fly shuttle pit loom with jacquard punch cards for brocade pattern control.",
      topic: "textile", difficulty: "hard"
    },
    {
      section: "Section C · Garment Construction",
      question: "Which seam type is most appropriate for curved necklines in silk garments to prevent puckering?",
      options: ["French seam with single stitching", "Stay-stitched, clipped curved seam with 0.5 cm allowance", "Flat-fell seam with double topstitch", "Hong Kong seam with bias binding"],
      correctIndex: 1,
      explanation: "Curved seams require stay-stitching to prevent stretch, clipping to relieve tension, and minimal seam allowance (0.5 cm) to lie flat.",
      topic: "construction", difficulty: "hard"
    },
    {
      section: "Section D · Pattern Math",
      question: "If a lehenga skirt requires 3 metres of fabric at 112 cm width for a 12-kali circular construction, what is the approximate circumference at the hemline?",
      options: ["240 cm", "336 cm", "420 cm", "504 cm"],
      correctIndex: 1,
      explanation: "12 kalis × fabric width multiplier × flare factor ≈ 336 cm hemline circumference for full 12-kali construction.",
      topic: "pattern", difficulty: "hard"
    },
    {
      section: "Section E · Cultural Knowledge",
      question: "Kanjivaram silk sarees are characterised by which distinctive weaving technique that makes them reversible?",
      options: ["Extra weft float technique", "Korvai weaving — body and border woven separately and interlocked", "Dobby border weaving", "Bandha ikat resist-dyeing"],
      correctIndex: 1,
      explanation: "Kanjivaram sarees use Korvai technique — the body and border are woven separately on different shuttles and interlocked, making each side appear different.",
      topic: "history", difficulty: "hard"
    },
    {
      section: "Section F · Design Principles",
      question: "The 'Golden Ratio' (φ ≈ 1.618) is applied in fashion to determine ideal proportions. If a model is 170 cm tall, where should the 'golden dividing line' fall?",
      options: ["At 90 cm", "At 105 cm", "At 120 cm", "At 135 cm"],
      correctIndex: 1,
      explanation: "170 ÷ φ = 170 ÷ 1.618 ≈ 105 cm from the floor — approximately at the natural waist, confirming the waist as the ideal visual centre.",
      topic: "pattern", difficulty: "hard"
    }
  ],

  // BANK 2: Pattern Making & Construction
  [
    {
      section: "Section A · Drafting Basics",
      question: "What is the formula for calculating the back neck width in a standard Indian bodice block (with shoulder = 38 cm)?",
      options: ["Shoulder ÷ 3 = 12.7 cm", "Shoulder ÷ 6 + 0.5 cm = 6.83 cm", "Shoulder ÷ 4 = 9.5 cm", "Shoulder ÷ 5 + 1 cm = 8.6 cm"],
      correctIndex: 1,
      explanation: "Standard formula: Back neck width = Shoulder ÷ 6 + 0.5 cm = 38 ÷ 6 + 0.5 = 6.33 + 0.5 = 6.83 cm.",
      topic: "pattern", difficulty: "hard"
    },
    {
      section: "Section B · Textile Behaviour",
      question: "Which fibre has the highest natural lustre and is most prone to water spotting and perspiration damage?",
      options: ["Cotton", "Polyester", "Mulberry Silk", "Linen"],
      correctIndex: 2,
      explanation: "Mulberry silk's triangular fibre cross-section refracts light for high lustre, but protein-based fibres are damaged by moisture, salt, and alkalis.",
      topic: "textile", difficulty: "medium"
    },
    {
      section: "Section C · Embroidery Identification",
      question: "Zardozi embroidery traditionally uses which metallic material to create raised relief patterns on velvet and silk?",
      options: ["Brass wire (kalabattu)", "Bullion wire, metal sequins and semi-precious stones", "Silver zari thread only", "Gold cotton thread"],
      correctIndex: 1,
      explanation: "Zardozi uses bullion/passing thread, salma-sitara (metal sequins), and sometimes pearls and semi-precious stones for three-dimensional relief.",
      topic: "textile", difficulty: "medium"
    },
    {
      section: "Section D · Draping Principles",
      question: "When draping on the bias grain (45°), fabric behaves differently compared to straight grain. Which property is most pronounced?",
      options: ["Higher shrinkage rate", "Maximum elasticity and fluidity in drape", "Reduced colour fastness", "Better resistance to fraying"],
      correctIndex: 1,
      explanation: "Bias cut aligns with the diagonal of the weave, giving maximum stretch and fluid drape — the basis of Madeleine Vionnet's revolutionary technique.",
      topic: "construction", difficulty: "medium"
    },
    {
      section: "Section E · Colour Harmony",
      question: "A 'triadic colour scheme' using saffron as the base (30° hue) would include which two additional hues?",
      options: ["Indigo (210°) and Emerald (150°)", "Crimson (0°) and Gold (60°)", "Violet (270°) and Teal (180°)", "Maroon (340°) and Lime (90°)"],
      correctIndex: 0,
      explanation: "A triadic scheme divides the wheel into 3 equal 120° steps. 30° + 120° = 150° (Emerald) and 30° + 240° = 270° ≈ Indigo.",
      topic: "colour", difficulty: "hard"
    },
    {
      section: "Section F · Sustainability Practices",
      question: "Natural indigo dye (Indigofera tinctoria) belongs to which chemical dye class?",
      options: ["Acid dye", "Vat dye", "Reactive dye", "Direct dye"],
      correctIndex: 1,
      explanation: "Indigo is a vat dye — insoluble in water, it must be chemically reduced to a soluble 'leuco' form for dyeing, then oxidised on the fibre to fix colour.",
      topic: "sustainability", difficulty: "hard"
    }
  ],

  // BANK 3: Indian Fashion History
  [
    {
      section: "Section A · Historical Dress",
      question: "The 'Antargiya' in ancient Indian dress was equivalent to which modern garment?",
      options: ["Outer robe", "Inner lower garment / underclothing", "Head covering", "Ceremonial sash"],
      correctIndex: 1,
      explanation: "Ancient Sanskrit texts describe the Antargiya as the inner lower garment, similar to a modern dhoti or underskirt.",
      topic: "history", difficulty: "medium"
    },
    {
      section: "Section B · Mughal Fashion",
      question: "The Aba, Jama, and Fargi are examples of which era's principal garment typology in Indian fashion history?",
      options: ["Vedic Period", "Gupta Empire", "Mughal Court", "Colonial Era"],
      correctIndex: 2,
      explanation: "The Aba (long robe), Jama (fitted coat), and Fargi (tunic-like garment) were key silhouettes of Mughal imperial dress, influenced by Persian aesthetics.",
      topic: "history", difficulty: "medium"
    },
    {
      section: "Section C · Textile Geography",
      question: "Paithani sarees, known for their peacock motif pallus, are exclusively woven in which state?",
      options: ["Madhya Pradesh", "Gujarat", "Maharashtra", "Odisha"],
      correctIndex: 2,
      explanation: "Paithani sarees are made in Paithan (Aurangabad district), Maharashtra, using silk warp and zari weft with tapestry weaving technique.",
      topic: "history", difficulty: "easy"
    },
    {
      section: "Section D · Pattern Mathematics",
      question: "For a standard salwar trouser with a hip of 96 cm, what is the crotch depth measurement using the standard formula?",
      options: ["20.5 cm", "24.0 cm", "26.0 cm", "28.5 cm"],
      correctIndex: 2,
      explanation: "Crotch depth = Hip ÷ 4 + 2 cm (ease) = 96 ÷ 4 + 2 = 24 + 2 = 26.0 cm.",
      topic: "pattern", difficulty: "hard"
    },
    {
      section: "Section E · Design Vocabulary",
      question: "What distinguishes a 'Bandhgala' (Nehru jacket) from a 'Sherwani'?",
      options: ["Bandhgala has a nehru collar and shorter length; sherwani is knee-length with stand collar", "Bandhgala is only worn for weddings", "Sherwani has fewer buttons", "They are identical garments with different regional names"],
      correctIndex: 0,
      explanation: "Bandhgala jacket is waist-length or hip-length with a mandarin/nehru closed collar. Sherwani extends to the knee with a more formal structured stand collar.",
      topic: "history", difficulty: "medium"
    },
    {
      section: "Section F · Fibre Science",
      question: "Ahimsa (peace) silk differs from conventional silk in which fundamental production step?",
      options: ["Different mulberry variety is used", "Silkworms are allowed to complete metamorphosis before extracting broken cocoon filaments", "The fabric is pre-washed 3 times", "No zari thread is used in weaving"],
      correctIndex: 1,
      explanation: "Conventional silk boils the cocoon (killing the pupa) to extract continuous filament. Ahimsa silk waits for the moth to emerge, then uses broken shorter fibres — producing a slubbed, slightly matte texture.",
      topic: "sustainability", difficulty: "hard"
    }
  ],

  // BANK 4: Speed & Application
  [
    {
      section: "Section A · Quick Identification",
      question: "Which stitch creates the characteristic shadow-work appearance of Chikankari embroidery?",
      options: ["Satin stitch on top face", "Herringbone / shadow stitch worked from the back of sheer fabric", "Chain stitch outline", "French knot cluster"],
      correctIndex: 1,
      explanation: "Chikankari's shadow work is created by herringbone stitch on the reverse of sheer fabric like muslin, casting a soft shadow visible from the front.",
      topic: "textile", difficulty: "medium"
    },
    {
      section: "Section B · Pattern Math",
      question: "A sleeve cap height is calculated as 2/3 of the armhole depth. If armhole depth = 21 cm, what is the sleeve cap height?",
      options: ["12.0 cm", "14.0 cm", "16.0 cm", "18.0 cm"],
      correctIndex: 1,
      explanation: "Sleeve cap height = 2/3 × 21 = 14.0 cm. This controls sleeve head ease and how the sleeve sits on the shoulder.",
      topic: "pattern", difficulty: "medium"
    },
    {
      section: "Section C · Fabric Care",
      question: "Silk garments should NEVER be treated with which common household product?",
      options: ["Distilled water", "Sodium bicarbonate (baking soda)", "Diluted white vinegar", "Talcum powder"],
      correctIndex: 1,
      explanation: "Baking soda is alkaline; silk (protein fibre) is permanently damaged by alkaline substances — the pH should stay below 7 for silk.",
      topic: "textile", difficulty: "easy"
    },
    {
      section: "Section D · Cultural Literacy",
      question: "The term 'Sari' comes from which ancient Sanskrit word meaning 'a strip of cloth'?",
      options: ["Sarira", "Sati", "Sattika", "Shastra"],
      correctIndex: 2,
      explanation: "The word 'sari' is derived from Prakrit 'sattika', itself from Sanskrit, meaning a strip of cloth — one of the world's oldest surviving garment forms.",
      topic: "history", difficulty: "medium"
    },
    {
      section: "Section E · Colour Application",
      question: "When combining a deep Rani pink (warm, fuchsia) with an earth-toned golden olive fabric, which accessory colour achieves the most cohesive visual balance?",
      options: ["Electric blue", "Ivory / cream (neutral bridge)", "Forest green", "Cobalt violet"],
      correctIndex: 1,
      explanation: "A neutral bridge colour like ivory or cream reduces the visual competition between the warm fuchsia and earthy olive, creating harmony without diluting either.",
      topic: "colour", difficulty: "medium"
    },
    {
      section: "Section F · Construction",
      question: "What is the primary function of a 'stay stitch' in garment construction?",
      options: ["To join two fabric pieces permanently", "To prevent bias or curved edges from stretching before seaming", "To create a decorative topstitch line", "To reinforce buttonholes"],
      correctIndex: 1,
      explanation: "Stay stitching is a single row of straight stitching just inside the seam allowance on curved/bias edges to stabilise them before further construction.",
      topic: "construction", difficulty: "easy"
    }
  ],

  // BANK 5: Comprehensive & Advanced
  [
    {
      section: "Section A · Advanced Draping",
      question: "In the Gujarati 'Seedha Pallu' saree draping style, how does the pallu differ from the standard Nivi style?",
      options: ["The pallu is draped behind the left shoulder", "The pallu is brought from back to front over the right shoulder without pleats", "The pallu is twisted into the waist", "The pallu covers the head entirely"],
      correctIndex: 1,
      explanation: "In Gujarati style, the pallu is worn at the front over the right shoulder — the reverse of Nivi — and is often more heavily embroidered and displayed prominently.",
      topic: "history", difficulty: "hard"
    },
    {
      section: "Section B · Advanced Pattern",
      question: "The 'Ease' in a garment pattern refers to what?",
      options: ["The total fabric width needed", "The difference between the body measurement and the finished garment measurement that allows movement and comfort", "The seam allowance", "The hemline measurement"],
      correctIndex: 1,
      explanation: "Ease = Garment measurement − Body measurement. 'Wearing ease' (3–5 cm) allows movement; 'Design ease' (additional 5–15+ cm) creates the intended silhouette.",
      topic: "construction", difficulty: "medium"
    },
    {
      section: "Section C · Business & Sustainability",
      question: "In a fair-trade artisan collaboration, what percentage of the retail price is internationally recommended to reach the craftsperson?",
      options: ["10–15%", "20–25%", "30–50%", "70–80%"],
      correctIndex: 2,
      explanation: "Fair Trade and Craftmark standards advocate for 30–50% of retail price to be paid to artisans — far higher than the typical 5–10% in conventional fast fashion supply chains.",
      topic: "sustainability", difficulty: "hard"
    },
    {
      section: "Section D · Construction Mastery",
      question: "A 'French tack' (bar tack sewn between lining and outer garment) is used for what purpose?",
      options: ["To prevent seams from fraying", "To keep the lining attached but allow independent movement of the outer fabric", "To reinforce pocket openings", "To prevent button from pulling off"],
      correctIndex: 1,
      explanation: "A French tack connects the lining hem to the outer garment hem at a few specific points, allowing both layers to hang freely without the lining causing drag or distortion.",
      topic: "construction", difficulty: "hard"
    },
    {
      section: "Section E · Colour & Skin Science",
      question: "Undertone theory classifies skin as warm, cool, or neutral. Which jewellery metal is universally recommended for warm undertones?",
      options: ["Platinum / silver", "White gold", "Yellow gold / rose gold", "Chrome-plated steel"],
      correctIndex: 2,
      explanation: "Yellow gold and rose gold harmonise with warm undertones (golden, peachy, yellow); silver/platinum suits cool undertones (pink, blue, purple hues).",
      topic: "colour", difficulty: "easy"
    },
    {
      section: "Section F · Advanced Textile",
      question: "Ajrakh block printing is a traditional craft of which two Indian regions?",
      options: ["Rajasthan & Gujarat (Kutch)", "Punjab & Himachal", "Andhra & Tamil Nadu", "Odisha & West Bengal"],
      correctIndex: 0,
      explanation: "Ajrakh is practiced in Kutch (Gujarat) and Barmer (Rajasthan) using mud-resist block printing with natural indigo, alizarin, and pomegranate mordants in 16+ steps.",
      topic: "textile", difficulty: "medium"
    }
  ]
]

// ─── Level determination based on topic-weighted scoring ─────────────────────
function determineLevel(questions: Question[], answers: number[]): { score: number; level: "foundation" | "intermediate" | "advanced"; breakdown: Record<string, number> } {
  const topicScores: Record<string, { correct: number; total: number }> = {}

  questions.forEach((q, i) => {
    const t = q.topic
    if (!topicScores[t]) topicScores[t] = { correct: 0, total: 0 }
    topicScores[t].total++
    if (answers[i] === q.correctIndex) topicScores[t].correct++
  })

  const breakdown: Record<string, number> = {}
  let totalCorrect = 0
  Object.entries(topicScores).forEach(([topic, data]) => {
    breakdown[topic] = Math.round((data.correct / data.total) * 100)
    totalCorrect += data.correct
  })

  const score = Math.round((totalCorrect / questions.length) * 100)
  const level: "foundation" | "intermediate" | "advanced" =
    score >= 80 ? "advanced" : score >= 50 ? "intermediate" : "foundation"

  return { score, level, breakdown }
}

export default function PlacementTest({ onComplete, onCancel, testVariant = 0 }: PlacementTestProps) {
  const questions = QUESTION_BANKS[testVariant % QUESTION_BANKS.length]
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [isFinished, setIsFinished] = useState<boolean>(false)
  const [result, setResult] = useState<{ score: number; level: "foundation" | "intermediate" | "advanced"; breakdown: Record<string, number> } | null>(null)

  const handleSelectOption = (optIndex: number) => {
    const updated = [...selectedAnswers]
    updated[currentIdx] = optIndex
    setSelectedAnswers(updated)
    setShowExplanation(false)
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setShowExplanation(false)
    } else {
      const r = determineLevel(questions, selectedAnswers)
      setResult(r)
      setIsFinished(true)
      const path = getDefaultPath(r.level)
      onComplete(r.score, r.level)
    }
  }

  const q = questions[currentIdx]
  const currentAnswer = selectedAnswers[currentIdx]
  const isAnswered = currentAnswer !== undefined

  const TOPIC_LABELS: Record<string, string> = {
    history: "Fashion History",
    textile: "Textile Science",
    pattern: "Pattern Mathematics",
    colour: "Colour Theory",
    construction: "Garment Construction",
    sustainability: "Sustainability"
  }

  const DIFFICULTY_COLORS = { easy: "#28a745", medium: "#e8b547", hard: "#c9513e" }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-[#ded8cd] shadow-md space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#e8dfd1]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#c9513e]">
            Diagnostic Placement Assessment · Variant {testVariant + 1}
          </span>
          <h2 className="text-2xl font-serif text-[#172b2b]">VastraShastra Placement Test</h2>
        </div>
        {!isFinished && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-mono font-bold bg-[#faf6ee] px-3 py-1 rounded-full text-[#aa7917] border border-[#e5dccf]">
              {currentIdx + 1} / {questions.length}
            </span>
            {/* Progress bar */}
            <div className="w-32 h-1.5 bg-[#e8dfd1] rounded-full overflow-hidden">
              <div className="h-full bg-[#c9513e] rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Topic & difficulty badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#194b65] bg-[#e8f3f8] px-2.5 py-1 rounded-lg">
              {q.section}
            </span>
            <span
              className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg"
              style={{ background: DIFFICULTY_COLORS[q.difficulty] + "22", color: DIFFICULTY_COLORS[q.difficulty] }}
            >
              {q.difficulty}
            </span>
            <span className="text-[10px] text-[#999] uppercase font-bold">{TOPIC_LABELS[q.topic]}</span>
          </div>

          <p className="text-[15px] text-[#172b2b] font-medium leading-relaxed">{q.question}</p>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                  currentAnswer === i
                    ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e] ring-2 ring-[#c9513e]/20"
                    : "border-[#e0d6c5] hover:bg-[#faf6ee] text-[#444]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    currentAnswer === i ? "border-[#c9513e] bg-[#c9513e] text-white" : "border-[#ccc] text-[#999]"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Explanation toggle */}
          {isAnswered && (
            <div>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#315c73] hover:text-[#194b65]"
              >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showExplanation ? "rotate-90" : ""}`} />
                {showExplanation ? "Hide" : "Show"} explanation
              </button>
              {showExplanation && (
                <div className={`mt-2 p-4 rounded-xl text-xs leading-relaxed border ${
                  currentAnswer === q.correctIndex
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  {currentAnswer === q.correctIndex
                    ? <CheckCircle2 className="inline w-3.5 h-3.5 mr-1.5" />
                    : <XCircle className="inline w-3.5 h-3.5 mr-1.5" />}
                  {q.explanation}
                  {currentAnswer !== q.correctIndex && (
                    <span className="block mt-1.5 font-bold">
                      Correct answer: {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-[#e8dfd1]">
            <button onClick={onCancel} className="text-xs text-[#888] font-semibold hover:text-[#172b2b]">
              Exit Placement
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#172b2b] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#c9513e] transition-all disabled:opacity-50"
            >
              {currentIdx === questions.length - 1 ? "Submit & See Results" : "Next Question"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#f2e8dc] text-[#c9513e] mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-serif text-[#172b2b]">Assessment Complete</h3>
            <p className="text-xs text-[#666] mt-1">Your knowledge has been analysed across 6 design disciplines.</p>
          </div>

          <div className="p-6 bg-[#faf7f0] rounded-xl border border-[#e5dccf] max-w-md mx-auto space-y-3">
            <span className="text-xs text-[#888] uppercase font-bold tracking-wider block">Assigned Learning Level</span>
            <strong className="text-3xl font-serif text-[#c9513e] capitalize block">{result.level}</strong>
            <span className="text-sm font-mono font-bold text-[#172b2b]">Overall Score: {result.score}%</span>

            {/* Topic breakdown */}
            <div className="mt-3 space-y-1.5 text-left">
              {Object.entries(result.breakdown).map(([topic, pct]) => (
                <div key={topic} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#888] w-36 shrink-0">{TOPIC_LABELS[topic] ?? topic}</span>
                  <div className="flex-1 h-1.5 bg-[#e8dfd1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c9513e] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#555] w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#555] max-w-md mx-auto">
            {result.level === "advanced"
              ? "Exceptional fluency! Your personalised path begins at advanced pattern construction and fusion silhouette challenges."
              : result.level === "intermediate"
              ? "Strong foundation. Your path starts with bodice block mastery and colour theory deep dives."
              : "Welcome to couture drafting! Your path starts from the foundations — textile science, grain lines, and form."}
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b04332]"
            >
              View My Learning Path →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
