import React, { useRef, useState, useEffect } from "react"
import {
  Sparkles,
  Palette,
  Send,
  RotateCcw,
  Undo2,
  Download,
  CheckCircle,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Sliders,
  FileCheck,
  Layers,
  Info
} from "lucide-react"
import { analyzeSketchWithAI, synthesizeDressImage, type SketchNuances, type SketchAnalysisResult } from "../lib/aiServices"

interface AIDesignStudioProps {
  onDressGenerated?: (dressData: {
    imageUrl: string
    color: string
    style: { sleeve: string; collar: string; hemline: string; type: string }
    prompt: string
  }) => void
  onNavigateTo3D?: () => void
}

const SLEEVE_STYLES = [
  { id: "puffed", label: "Puffed / Baloon", note: "Classic regional dramatic sleeve" },
  { id: "long", label: "Full Long Churidar", note: "Wrist gathers with snug fit" },
  { id: "short", label: "Elbow Length", note: "Traditional blouse standard" },
  { id: "bell", label: "Bell / Flared", note: "Indo-Western fusion movement" },
  { id: "sleeveless", label: "Sleeveless / Cut-away", note: "Contemporary summer couture" }
]

const COLLAR_STYLES = [
  { id: "mandarin", label: "Mandarin / Nehru", note: "High structured stand collar" },
  { id: "boat", label: "Boat Neck (Bateau)", note: "Wide graceful collarbone curve" },
  { id: "sweetheart", label: "Sweetheart", note: "Contoured feminine neckline" },
  { id: "v-neck", label: "Deep V-Placket", note: "Elongates torso and neck line" },
  { id: "round", label: "Jewel Round", note: "Minimalist Indian classic" }
]

const HEMLINE_STYLES = [
  { id: "flared", label: "Flared 8-12 Kalis", note: "360° umbrella circumference" },
  { id: "asymmetric", label: "High-Low Asymmetric", note: "Modern fusion drape" },
  { id: "straight", label: "Straight Column Slit", note: "Minimalist traditional look" },
  { id: "scalloped", label: "Scalloped Cutwork", note: "Embroidered border curve" }
]

const COLOR_SUGGESTIONS = [
  { name: "Sindoor Terracotta", hex: "#c9513e" },
  { name: "Royal Zari Gold", hex: "#e8b547" },
  { name: "Kachchh Indigo", hex: "#194b65" },
  { name: "Paan Emerald", hex: "#365540" },
  { name: "Gulabi Rani Pink", hex: "#b8456f" },
  { name: "Kora Silk Cream", hex: "#eee6d6" },
  { name: "Midnight Noir", hex: "#1b2424" }
]

export default function AIDesignStudio({ onDressGenerated, onNavigateTo3D }: AIDesignStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Undo stack for canvas states
  const historyStackRef = useRef<ImageData[]>([])
  const [canUndo, setCanUndo] = useState(false)

  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeColor, setStrokeColor] = useState("#172b2b")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Sketch Input Mode: Drawn Canvas vs Uploaded Sketch Image
  const [sketchInputMode, setSketchInputMode] = useState<"canvas" | "upload">("canvas")
  const [uploadedSketchUrl, setUploadedSketchUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>("")

  // Style configurations & Specific Design Nuances
  const [garmentType, setGarmentType] = useState("Anarkali Suit")
  const [selectedSleeve, setSelectedSleeve] = useState("puffed")
  const [selectedCollar, setSelectedCollar] = useState("mandarin")
  const [selectedHemline, setSelectedHemline] = useState("flared")
  const [selectedFabric, setSelectedFabric] = useState("Banarasi Katan Silk")
  const [selectedColor, setSelectedColor] = useState("#c9513e")
  const [customPrompt, setCustomPrompt] = useState(
    "Fine Zardozi gold wire embroidery on sleeves and hemline border, fluid mulberry silk drape with antique Zari borders"
  )

  // Generated options & AI Analysis report
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [detailedAiReport, setDetailedAiReport] = useState<SketchAnalysisResult | null>(null)

  // Setup canvas with metric drafting grid
  const resetCanvasGrid = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background paper tint
    ctx.fillStyle = "#faf7f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Metric Grid (25px = 5cm equivalent at 1:5 scale)
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
    ctx.font = "9px DM Sans, sans-serif"
    for (let x = 50; x < canvas.width; x += 50) {
      ctx.fillText(`${x / 5} cm`, x + 2, 12)
    }
    for (let y = 50; y < canvas.height; y += 50) {
      ctx.fillText(`${y / 5} cm`, 2, y + 10)
    }

    // Center vertical drafting axis
    ctx.strokeStyle = "#c9513e"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 20)
    ctx.lineTo(canvas.width / 2, canvas.height - 20)
    ctx.stroke()
    ctx.setLineDash([])

    // Clear history stack
    historyStackRef.current = []
    setCanUndo(false)
  }

  useEffect(() => {
    resetCanvasGrid()
  }, [])

  // Push canvas state before starting a new stroke for Undo
  const pushCanvasState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyStackRef.current.push(snapshot)
    if (historyStackRef.current.length > 25) {
      historyStackRef.current.shift()
    }
    setCanUndo(true)
  }

  // Handle Undo
  const handleUndo = () => {
    if (historyStackRef.current.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const previousState = historyStackRef.current.pop()
    if (previousState) {
      ctx.putImageData(previousState, 0, 0)
    }
    setCanUndo(historyStackRef.current.length > 0)
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    pushCanvasState()

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)

    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  // Handle Upload of Student Sketch Image from Storage
  const handleSketchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      setUploadedSketchUrl(dataUrl)
      setSketchInputMode("upload")
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Save current active sketch (Canvas or Uploaded) and trigger Gemini AI Analysis
  const handleAnalyzeWithGemini = async () => {
    let activeSketchDataUrl: string | null = null

    if (sketchInputMode === "upload" && uploadedSketchUrl) {
      activeSketchDataUrl = uploadedSketchUrl
    } else if (canvasRef.current) {
      activeSketchDataUrl = canvasRef.current.toDataURL("image/png")
      // Also download copy for student's portfolio
      const downloadLink = document.createElement("a")
      downloadLink.download = `vastra-sketch-${Date.now()}.png`
      downloadLink.href = activeSketchDataUrl
      downloadLink.click()
    }

    if (!activeSketchDataUrl) return

    setIsAnalyzing(true)
    setDetailedAiReport(null)

    const nuances: SketchNuances = {
      style: garmentType,
      sleeve: selectedSleeve,
      collar: selectedCollar,
      hemline: selectedHemline,
      fabric: selectedFabric,
      color: selectedColor,
      customNotes: customPrompt
    }

    try {
      const analysis = await analyzeSketchWithAI(activeSketchDataUrl, nuances)
      setDetailedAiReport(analysis)
    } catch (err: any) {
      console.warn("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate couture renders using prompt + design nuances + reference sketch
  const handleGenerateRenders = async () => {
    setIsGenerating(true)

    const promptToUse = detailedAiReport?.synthesisPrompt || `Vogue India haute couture fashion editorial, elegant Indian model wearing a bespoke ${garmentType} in ${selectedColor} ${selectedFabric}, featuring ${selectedSleeve} sleeves and ${selectedCollar} collar, ${customPrompt}, studio dramatic lighting, award-winning editorial, 8k resolution`

    let referenceImg: string | undefined = undefined
    if (sketchInputMode === "upload" && uploadedSketchUrl) {
      referenceImg = uploadedSketchUrl
    } else if (canvasRef.current) {
      referenceImg = canvasRef.current.toDataURL("image/png")
    }

    try {
      const images = await synthesizeDressImage(promptToUse, referenceImg)
      setGeneratedImages(images)
      setSelectedImageIndex(0)

      if (onDressGenerated && images.length > 0) {
        onDressGenerated({
          imageUrl: images[0],
          color: selectedColor,
          style: {
            sleeve: selectedSleeve,
            collar: selectedCollar,
            hemline: selectedHemline,
            type: garmentType
          },
          prompt: promptToUse
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Download Synthesized Dress Image as PNG
  const handleDownloadGeneratedImage = (imageUrl: string, index: number) => {
    const a = document.createElement("a")
    a.download = `vastrashastra-couture-dress-0${index + 1}.png`
    a.href = imageUrl
    a.target = "_blank"
    a.click()
  }

  return (
    <div className="space-y-8 bg-[#fdfbf7] p-6 lg:p-8 rounded-2xl border border-[#ded8cd]">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#e8e0d2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#c9513e]">Sketch & AI Studio</span>
          <h2 className="text-2xl lg:text-3xl font-serif text-[#172b2b] mt-1">
            Draw, Upload & Synthesize Couture
          </h2>
          <p className="text-sm text-[#666] max-w-2xl mt-1">
            Draft on the 1:5 scale metric grid or upload your hand-drawn sketch from storage. Gemini analyzes your proportions, combines your specific design nuances, and generates a photorealistic couture dress with full download options.
          </p>
        </div>

        <button
          onClick={handleAnalyzeWithGemini}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#c9513e] hover:bg-[#b04332] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-[#e8b547]" />
          {isAnalyzing ? "Analyzing Sketch with Gemini..." : "Analyze Sketch with Gemini AI"}
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metric Drawing Canvas & Upload Section */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Sketch Source Mode Switcher */}
          <div className="flex justify-between items-center bg-[#f5efe2] p-1.5 rounded-xl border border-[#e5dccf] text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSketchInputMode("canvas")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sketchInputMode === "canvas" ? "bg-[#172b2b] text-white shadow" : "text-[#555] hover:text-[#172b2b]"
                }`}
              >
                1:5 Scale Drafting Grid
              </button>
              <button
                onClick={() => setSketchInputMode("upload")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sketchInputMode === "upload" ? "bg-[#172b2b] text-white shadow" : "text-[#555] hover:text-[#172b2b]"
                }`}
              >
                Uploaded Sketch Image
              </button>
            </div>

            {/* Undo & Clear for Canvas */}
            {sketchInputMode === "canvas" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#172b2b] bg-white rounded border border-[#ded4c3] hover:bg-[#faf7f0] disabled:opacity-40 transition-all"
                  title="Undo last stroke"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo
                </button>
                <button
                  onClick={resetCanvasGrid}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#c9513e] bg-white rounded border border-[#ded4c3] hover:bg-[#fbf2f0] transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Mode 1: Metric Canvas */}
          {sketchInputMode === "canvas" ? (
            <div className="space-y-2">
              <div className="relative border border-[#d8cdbe] rounded-xl overflow-hidden bg-[#faf7f0] shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={650}
                  height={500}
                  className="w-full h-[400px] touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#777] px-1">
                <span>Dashed center red axis indicates front-fold alignment</span>
                <span>Grid: 25px = 5 cm standard drafting scale</span>
              </div>
            </div>
          ) : (
            /* Mode 2: Uploaded Sketch Preview */
            <div className="border-2 border-dashed border-[#d8cdbe] rounded-xl p-6 bg-[#faf7f0] text-center space-y-4">
              {uploadedSketchUrl ? (
                <div className="space-y-3">
                  <div className="relative max-h-[350px] overflow-hidden rounded-lg border border-[#e0d6c5] shadow">
                    <img
                      src={uploadedSketchUrl}
                      alt="Uploaded student sketch"
                      className="w-full h-72 object-contain bg-white"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#172b2b] truncate">{uploadedFileName}</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#c9513e] font-bold hover:underline"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#f0e8d8] flex items-center justify-center text-[#c9513e]">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-lg text-[#172b2b]">Upload Your Hand-Drawn Sketch</h4>
                  <p className="text-xs text-[#666] max-w-sm mx-auto">
                    Take a photo of your paper sketch or export your digital drawing (PNG, JPG, WEBP). Gemini will analyze its construction lines and seam placements.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-[#172b2b] hover:bg-[#c9513e] text-white text-xs font-bold rounded-lg shadow transition-all"
                  >
                    Select File from Storage
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input for Sketch Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSketchFileUpload}
            className="hidden"
          />

          {/* Under-Grid Upload Bar (Always Accessible) */}
          <div className="p-3 bg-[#f5efe2] rounded-xl border border-[#e5dccf] flex items-center justify-between text-xs">
            <span className="text-[#555] font-medium flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#c9513e]" />
              Prefer uploading an existing paper sketch?
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-[#fbf2f0] text-[#c9513e] font-bold rounded-lg border border-[#ded4c3] transition-all"
            >
              Upload Sketch Image
            </button>
          </div>

          {/* Detailed Gemini AI Analysis Report */}
          {detailedAiReport && (
            <div className="p-5 bg-[#faf7f0] border border-[#e0d6c5] rounded-xl text-xs text-[#234232] space-y-3 shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-[#e2d6c4]">
                <strong className="font-bold text-[#1a5b3a] flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#2c7a4b]" /> Gemini AI Couture Analysis
                </strong>
                <span className="bg-[#28453c] text-white px-2.5 py-0.5 rounded font-mono font-bold">
                  Score: {detailedAiReport.proportionsScore}%
                </span>
              </div>

              <div>
                <span className="font-bold text-[#172b2b] block mb-0.5">Identified Silhouette:</span>
                <p className="text-[#555]">{detailedAiReport.silhouette}</p>
              </div>

              <div>
                <span className="font-bold text-[#172b2b] block mb-0.5">Anatomical & Seam Check:</span>
                <p className="text-[#555]">{detailedAiReport.seamAnalysis}</p>
              </div>

              <div>
                <span className="font-bold text-[#172b2b] block mb-0.5">Recommended Next Corrections:</span>
                <ul className="list-disc list-inside text-[#666] space-y-1">
                  {detailedAiReport.corrections.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#e2d6c4] flex justify-between items-center text-[#194b65] font-semibold">
                <span>{detailedAiReport.nextSteps}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Specific Design Nuances & Style Customization */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Garment Silhouette Type */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-2">
              1. Silhouette Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Anarkali Suit", "Ghagra / Lehenga", "Kurta & Churidar", "Mughal Sherwani", "Saree Blouse", "Indo-Western Gown"].map((type) => (
                <button
                  key={type}
                  onClick={() => setGarmentType(type)}
                  className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                    garmentType === type
                      ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e]"
                      : "border-[#e0d6c5] bg-white text-[#555] hover:border-[#bbb]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sleeve Style Selector */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-2">
              2. Sleeve Architecture
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SLEEVE_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSleeve(s.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedSleeve === s.id
                      ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e]"
                      : "border-[#e0d6c5] bg-white text-[#555] hover:border-[#bbb]"
                  }`}
                >
                  <strong className="block text-xs font-bold">{s.label}</strong>
                  <span className="text-[10px] text-[#777] block mt-0.5">{s.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collar & Neckline */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-2">
              3. Collar & Neckline Cut
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLLAR_STYLES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCollar(c.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedCollar === c.id
                      ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e]"
                      : "border-[#e0d6c5] bg-white text-[#555] hover:border-[#bbb]"
                  }`}
                >
                  <strong className="block text-xs font-bold">{c.label}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Hemline Flare */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-2">
              4. Hemline Geometry
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HEMLINE_STYLES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHemline(h.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedHemline === h.id
                      ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e]"
                      : "border-[#e0d6c5] bg-white text-[#555] hover:border-[#bbb]"
                  }`}
                >
                  <strong className="block text-xs font-bold">{h.label}</strong>
                  <span className="text-[10px] text-[#777] block mt-0.5">{h.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fabric & Material */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-2">
              5. Regional Fabric & Weave
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Banarasi Katan Silk", "Chanderi Brocade", "Kanchipuram Silk", "Raw Tussar Silk", "Mulberry Georgette", "Royal Velvet"].map((fab) => (
                <button
                  key={fab}
                  onClick={() => setSelectedFabric(fab)}
                  className={`p-2 rounded-lg border text-xs font-medium text-center transition-all ${
                    selectedFabric === fab
                      ? "border-[#c9513e] bg-[#fbf2f0] text-[#c9513e]"
                      : "border-[#e0d6c5] bg-white text-[#555]"
                  }`}
                >
                  {fab}
                </button>
              ))}
            </div>
          </div>

          {/* Colour Palette Selection */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-2">
              6. Fabric Hue & Zari Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_SUGGESTIONS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => setSelectedColor(col.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedColor === col.hex
                      ? "border-[#c9513e] ring-2 ring-[#c9513e]/20 bg-[#fdf5f3]"
                      : "border-[#e0d6c5] bg-white"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: col.hex }} />
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Design Nuances Input */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#888] tracking-wider mb-1.5">
              7. Specific Design Nuances & Notes (Included in AI Prompt)
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Kashmiri Aari needlework motifs, gold scalloped Gota borders on wrists and hemline, pleated bias waist drape..."
              className="w-full text-xs p-3 rounded-lg border border-[#dcd2c2] bg-white focus:outline-none focus:border-[#c9513e]"
            />
            <span className="text-[11px] text-[#777] mt-1 block">
              These design nuances will be directly merged into the Gemini image synthesis prompt.
            </span>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateRenders}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-lg bg-[#172b2b] hover:bg-[#28453c] text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#e8b547]" />
            {isGenerating ? "Synthesizing Photorealistic Dress Image..." : "Generate Couture Dress Image"}
          </button>
        </div>
      </div>

      {/* Generated Results & Download Options */}
      {generatedImages.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#e8e0d2] space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#aa7917]">
                AI Synthesized Garment
              </span>
              <h3 className="text-xl font-serif text-[#172b2b]">Generated Couture Looks</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadGeneratedImage(generatedImages[selectedImageIndex], selectedImageIndex)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c9513e] hover:bg-[#b04332] text-white text-xs font-bold rounded-lg shadow transition-all"
              >
                <Download className="w-4 h-4" /> Download Selected Look (PNG)
              </button>

              {onNavigateTo3D && (
                <button
                  onClick={onNavigateTo3D}
                  className="flex items-center gap-2 px-4 py-2 bg-[#28453c] text-white text-xs font-bold rounded-lg hover:bg-[#1f3730] shadow transition-all"
                >
                  Send to 3D Testing Lab <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {generatedImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all shadow-md group ${
                  selectedImageIndex === idx ? "border-[#c9513e] ring-4 ring-[#c9513e]/20" : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  alt="Generated couture look"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="text-white flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold block">Variation 0{idx + 1}</span>
                      <span className="text-[10px] opacity-80">
                        {selectedSleeve} sleeve · {selectedCollar} collar · {selectedFabric}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadGeneratedImage(img, idx)
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-black rounded-lg transition-all"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
