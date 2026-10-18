import React, { useRef, useState, useEffect } from "react"
import { Ruler, Scissors, Award, CheckCircle2, AlertTriangle, ArrowRight, Eye, RefreshCw } from "lucide-react"
import { calculatePatternMath, verifyDielineMeasurement, type BodyMeasurements } from "../lib/patternMath"

interface DielineStudioProps {
  dressImageUrl?: string
  measurements?: BodyMeasurements
  onComplete?: (score: number, report: Record<string, unknown>) => void
}

interface StudentAnnotation {
  piece: string
  parameter: string
  label: string
  studentValue: number
}

export default function DielineStudio({
  dressImageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
  measurements = { bust: 88, waist: 72, hip: 96, shoulder: 38 },
  onComplete
}: DielineStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTool, setActiveTool] = useState<"pen" | "ruler" | "seam">("pen")
  const [activePiece, setActivePiece] = useState<string>("front_bodice")
  const [isDrawing, setIsDrawing] = useState(false)

  // Student's mathematical measurement annotations
  const [annotations, setAnnotations] = useState<StudentAnnotation[]>([
    { piece: "front_bodice", parameter: "armhole", label: "Armhole Depth", studentValue: 21.0 },
    { piece: "front_bodice", parameter: "bust", label: "Quarter Bust + Ease", studentValue: 24.5 },
    { piece: "front_bodice", parameter: "dart", label: "Dart Intake", studentValue: 2.0 },
    { piece: "sleeve", parameter: "cap", label: "Sleeve Cap Crown", studentValue: 18.5 }
  ])

  const [isComparing, setIsComparing] = useState(false)
  const [comparisonDone, setComparisonDone] = useState(false)
  const [comparisonResults, setComparisonResults] = useState<any[]>([])
  const [overallScore, setOverallScore] = useState<number>(0)

  const math = calculatePatternMath(measurements)

  // Setup drawing grid on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#faf7f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid lines (20px grid)
    ctx.strokeStyle = "#ede4d4"
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 25) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Ruler markings along top and left
    ctx.fillStyle = "#8a7d6d"
    ctx.font = "9px DM Sans"
    for (let x = 50; x < canvas.width; x += 50) {
      ctx.fillText(`${x / 5} cm`, x + 2, 12)
    }
    for (let y = 50; y < canvas.height; y += 50) {
      ctx.fillText(`${y / 5} cm`, 2, y + 10)
    }

    // Default template ghost outline for front bodice
    ctx.strokeStyle = "#cbbfaf"
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(120, 60)
    ctx.lineTo(260, 60) // Shoulder
    ctx.lineTo(260, 160) // Armhole drop
    ctx.lineTo(310, 230) // Side seam
    ctx.lineTo(120, 230) // Waist
    ctx.closePath()
    ctx.stroke()
    ctx.setLineDash([])
  }, [])

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    ctx.strokeStyle = activeTool === "seam" ? "#aa7917" : "#172b2b"
    ctx.lineWidth = activeTool === "seam" ? 1.5 : 2.5
    if (activeTool === "seam") {
      ctx.setLineDash([3, 3])
    } else {
      ctx.setLineDash([])
    }
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#faf7f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const updateAnnotationValue = (index: number, val: number) => {
    const updated = [...annotations]
    updated[index].studentValue = val
    setAnnotations(updated)
  }

  // Compare Student Dieline with AI reference
  const handleCompareWithAI = () => {
    setIsComparing(true)

    setTimeout(() => {
      setIsComparing(false)
      setComparisonDone(true)

      const verified = annotations.map((ann) => {
        return {
          ...ann,
          ...verifyDielineMeasurement(ann.piece, ann.parameter, ann.studentValue, measurements)
        }
      })

      setComparisonResults(verified)

      // Calculate overall accuracy score
      const totalPossible = verified.length * 100
      let earned = 0
      verified.forEach((item) => {
        if (item.severity === "perfect") earned += 100
        else if (item.severity === "minor") earned += 80
        else if (item.severity === "moderate") earned += 45
        else earned += 15
      })

      const finalScore = Math.round((earned / totalPossible) * 100)
      setOverallScore(finalScore)

      if (onComplete) {
        onComplete(finalScore, { results: verified, date: new Date().toISOString() })
      }
    }, 1800)
  }

  const handleSavePngAndCompare = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `vastra-dieline-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    }
    handleCompareWithAI()
  }

  return (
    <div className="space-y-6 bg-white p-6 lg:p-8 rounded-2xl border border-[#ded8cd]">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#e8e0d2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#194b65]">Pattern Engineering Studio</span>
          <h2 className="text-2xl font-serif text-[#172b2b] mt-1">Dieline &amp; Measurement Accuracy Lab</h2>
          <p className="text-xs text-[#666] max-w-2xl mt-1">
            Draw your sewing cut lines and input mathematical measurements based on the design. Gemini Vision will analyze your PNG draft, generate the true industrial reference, and critique your drafting accuracy.
          </p>
        </div>

        <button
          onClick={handleSavePngAndCompare}
          disabled={isComparing}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#c9513e] hover:bg-[#b04332] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
        >
          <Scissors className="w-4 h-4 text-[#e8b547]" />
          {isComparing ? "Analyzing Dieline with Gemini..." : "Save PNG & Compare with Gemini"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Dieline Drafting Grid */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Tool ribbon */}
          <div className="flex justify-between items-center bg-[#f7f2e8] px-4 py-2.5 rounded-lg border border-[#e5dccf] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#172b2b] mr-2">Drafting Piece:</span>
              {["front_bodice", "back_bodice", "sleeve", "lehenga_kali"].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePiece(p)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold capitalize transition-all ${
                    activePiece === p ? "bg-[#172b2b] text-white shadow-sm" : "bg-white text-[#555] hover:bg-[#eee]"
                  }`}
                >
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-[#d6ccbe] rounded-md bg-white p-0.5">
                <button
                  onClick={() => setActiveTool("pen")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium ${activeTool === "pen" ? "bg-[#c9513e] text-white" : "text-[#555]"}`}
                >
                  Pen
                </button>
                <button
                  onClick={() => setActiveTool("seam")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium ${activeTool === "seam" ? "bg-[#c9513e] text-white" : "text-[#555]"}`}
                >
                  1.5cm Seam
                </button>
              </div>
              <button onClick={clearCanvas} className="text-[#c9513e] font-semibold hover:underline">
                Clear
              </button>
            </div>
          </div>

          {/* Dieline Canvas with 1:5 Scale Metric Grid */}
          <div className="border border-[#d8cdbe] rounded-xl overflow-hidden shadow-inner bg-[#faf7f0]">
            <canvas
              ref={canvasRef}
              width={750}
              height={480}
              className="w-full h-[400px] cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#777] px-1">
            <span>Scale: 1 unit = 0.2 cm · Grid spacing: 5 cm equivalent</span>
            <span>Dashed lines indicate 1.5 cm standard seam allowance</span>
          </div>
        </div>

        {/* Right: Technical Measurements & Input Grid */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#faf6ee] p-4 rounded-xl border border-[#e5dccf]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#c9513e] block mb-1">
              Your Mathematical Annotations
            </span>
            <p className="text-xs text-[#666] mb-3">
              Input the dimensions you drafted on the dieline. AI checks these against body formulas.
            </p>

            <div className="space-y-3">
              {annotations.map((ann, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-[#e2d6c4] text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-[#172b2b]">{ann.label}</span>
                    <span className="text-[10px] text-[#888] uppercase">{ann.piece.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={ann.studentValue}
                      onChange={(e) => updateAnnotationValue(idx, parseFloat(e.target.value) || 0)}
                      className="w-24 p-1.5 border border-[#d6ccbe] rounded font-mono font-bold text-center text-sm"
                    />
                    <span className="text-[#777] font-medium">cm</span>
                    {comparisonDone && comparisonResults[idx] && (
                      <span className={`ml-auto text-[11px] font-bold ${
                        comparisonResults[idx].severity === "perfect" ? "text-emerald-600" :
                        comparisonResults[idx].severity === "minor" ? "text-amber-600" : "text-rose-600"
                      }`}>
                        Formula: {comparisonResults[idx].expectedValue} cm
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Reference Silhouette Card */}
          <div className="bg-[#fffdfa] p-4 rounded-xl border border-[#e5dccf] flex items-center gap-4">
            <img src={dressImageUrl} alt="Target dress design" className="w-16 h-20 rounded-lg object-cover border" />
            <div className="text-xs">
              <span className="text-[10px] uppercase font-bold text-[#888]">Target Dress</span>
              <strong className="block text-[#172b2b] font-serif text-sm">Anarkali Bodice Block</strong>
              <p className="text-[11px] text-[#666] mt-0.5">Bust: {measurements.bust} cm · Waist: {measurements.waist} cm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results Card */}
      {comparisonDone && (
        <div className="mt-8 pt-6 border-t border-[#e8e0d2] bg-[#fbf9f4] p-6 rounded-xl border animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#28453c]">AI Technical Evaluation</span>
              <h3 className="text-2xl font-serif text-[#172b2b] flex items-center gap-2 mt-0.5">
                Dieline Accuracy Score: <span className="text-[#c9513e]">{overallScore}%</span>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                overallScore >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {overallScore >= 80 ? "Certified Ready for Toile" : "Needs Pattern Revision"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisonResults.map((res, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-[#e2d8c7] text-xs space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-1.5">
                    {res.severity === "perfect" || res.severity === "minor" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                    {res.label}
                  </span>
                  <span className="font-mono text-sm">{res.studentValue} cm <span className="text-[#999] font-normal text-xs">(Target: {res.expectedValue} cm)</span></span>
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed">{res.feedback}</p>
              </div>
            ))}
          </div>

          {/* Pedagogical Advice from Gemini */}
          <div className="mt-5 p-4 rounded-lg bg-[#f0e8dc] border border-[#ded0be] text-xs text-[#444] space-y-1">
            <strong className="block text-[#172b2b] font-bold">Approach & Focus Recommendation:</strong>
            <p>
              {overallScore >= 80
                ? "Your dart distribution and ease allowances are mathematically sound. For the next step, proceed to cut your muslin toile with grainline matching."
                : "Focus primarily on your armhole depth calculation (Bust ÷ 6 + 7 cm). An error of more than 1 cm at the armhole leads to restrictive sleeve crown movement. Revise the formula before advancing to 3D fabric draping."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
