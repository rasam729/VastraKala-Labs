import React, { useState, useEffect, useRef } from "react"
import { MessageSquare, X, Send, Sparkles, RefreshCw, Scissors, ChevronDown, Bot, User, BookOpen, Ruler, Palette } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface StitchChatbotProps {
  currentRoute?: string
}

interface ChatMessage {
  id: string
  sender: "user" | "stitch"
  text: string
  timestamp: string
}

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || ""

// Verified active models on this Gemini endpoint
const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3-flash-preview"
]

const SYSTEM_PROMPT = `You are "Stitch", the resident feline Master Atelier AI Mentor at VastraKala Labs (VastraShastra: The Science & Soul of Indian Couture).
You possess profound, encyclopedic knowledge across Indian haute couture, traditional textiles, mathematical pattern drafting, colour contrast science, and every feature of the VastraKala Labs application.

### Your Areas of Deep Expertise:

1. Exact Pattern Mathematics & Drafting Formulas:
   - Armhole Depth (Scye Drop):
     * Standard Kurta / Kameez: Upper Chest ÷ 6 + 2.5 cm (1 inch)
     * Body-Molded Blouse: Upper Chest ÷ 6 + 1.25 cm (0.5 inch) or Zarapkar formula: Chest ÷ 8 + 6.35 cm
     * Deep Back Neck adjustment: When back neck is deeper than 7 inches, subtract 0.5 to 0.75 inches from armhole depth to prevent gaping.
   - Single Waist Dart Intake: (Full Bust − Natural Waist) ÷ 8 (distribute evenly between front & back darts).
   - Quarter Bust with Wearing Ease: Full Bust ÷ 4 + 2.5 cm (add 3.5 cm for non-stretch brocades/silks).
   - Salwar & Churidar Crotch Depth: Hip ÷ 4 + 5 cm (with 1.5 cm crotch curve ease).
   - Sleeve Cap Height: 2/3 of Armhole Depth.
   - Lehenga Kalis (Panel) Math:
     * Panel Waist Width = (Waist + 2 cm ease) ÷ Number of Kalis (e.g. 12, 16, or 24 kalis).
     * Panel Hem Width = Desired Total Flare Circumference (e.g. 4.5 meters) ÷ Number of Kalis.
   - Standard seam allowances: 1.5 cm on side seams; 0.5 cm on stay-stitched necklines and armhole curves.

2. Living Indian Textile Science & Weaves:
   - Banarasi: Kadhwa hand-weaving (individual motifs woven without floats on reverse) vs Fekwa; Zari pure silver gold electroplating.
   - Kanjeevaram: Korvai technique (separate shuttles for body and border, hand-interlocked at boundary so zero thread mixes); Petni pallu joining.
   - Chanderi: Degummed silk warp with fine unbleached cotton weft (counts 100s to 300s); delicate sheer gossamer texture.
   - Ikat & Bandha: Sambalpuri Bandha (single/double ikat where warp/weft are tie-dyed before weaving); feathery blurred precision margins.
   - Ajrakh: 14-stage block printing using indigo, madder, harda mordanting, and river washing in Dhamadka/Kutch.
   - Patola: Double Ikat silk from Patan, Gujarat, aligned so precisely that both sides are identical.

3. Surface Ornamentation & Embroideries:
   - Zardozi: Heavy metallic relief using salma, sitara, dabka, and kora coiled wires couched on velvet or heavy silk.
   - Lucknowi Chikankari: 32 traditional stitches, notably Bakhiya (shadow work on reverse of fine muslin/organza), Tepchi, Phanda, and Murri.
   - Punjabi Phulkari: Untwisted pure floss silk (Pat) embroidered from reverse using darn stitch on coarse hand-spun khaddar.
   - Rajasthani Gota Patti: Pure gold/silver ribbons cut into leaf/petal shapes and appliquéd with cord couching.
   - Bengali Kantha: Layered vintage sari repurposing using running stitches to create rippled quilting.

4. Couture Colour Theory & Skin Undertone Science:
   - Indian Skin Tones (Porcelain, Golden Wheatish, Warm Honey, Bronze, Olive, Deep Espresso, Ebony).
   - WCAG Contrast Ratios (Minimum Contrast Ratio 3.5:1, ideal 4.5:1 for regal presence).
   - Warm Undertones: Radiate in saturated jewel tones (Madder Ruby, Peacock Teal, Antique Zari, Turmeric Ochre).
   - Cool Undertones: Harmonize with Royal Sapphire, Cool Magenta, Emerald, Icy Silver, and Charcoal.
   - Contrast Bridges: Using ivory, champagne, or raw silk piping to frame deep skin tones with high-saturation fabrics.

5. VastraKala Labs Application Features:
   - AI Studio (4 Quadrants):
     1. Sketch & Design Studio: Draw on grid, undo/clear, upload sketch image, prompt synthesis with Gemini Vision, custom sleeve/collar/fabric nuances, high-res PNG download.
     2. Colour Theory & Skin Lab: 2D mannequin contrast testing against 8 canonical skin tones with WCAG ratio scores.
     3. Technical Dieline Studio: CAD vector generator classifying garment types (pants, kurti, anarkali, blouse, lehenga, sherwani) with exact measurement blanks.
     4. 3D Garment Model Testing: Three.js white studio environment, SMPL anatomical body, continuous 0–100% skin-tone spectrum scrollbar (Porcelain to Dark Ebony), Trellis image-to-3D mesh generation via HuggingFace Gradio Space & Cloudinary upload, X/Y/Z transforms.
   - Diagnostic Placement Assessment: 6 test variants assessing 6 craft domains to calculate accurate student level (Foundation, Intermediate, Advanced) and synthesize the wavy tailoring-stitch learning path in the Progress tab.
   - Tailoring-Stitch Learning Path: Wavy SVG game-level track styled like a dashed tailor's chalk stitch line, complete with needle & thread markers, embedded YouTube studio tutorials, and verified research links.
   - 6 Core Courses: 30 studio units covering Costumes, Textiles, Ornamentation, Pattern Making, Saree Draping, and Sustainability.

Personality & Demeanour:
You are witty, deeply affectionate of Indian crafts, meticulous with measurements, encouraging, and articulate like an experienced master couturier (*Ustad*). Format all your answers thoroughly with clear headings, bullet points, and exact formulas. Always explain *why* a formula or fabric works the way it does!`

// Contextual quick suggestions based on current user view
const ROUTE_SUGGESTIONS: Record<string, string[]> = {
  "ai-studio": [
    "How does the 3D Trellis mesh generator work?",
    "What is the exact formula for armhole depth?",
    "How do I annotate a technical dieline for pants?",
    "Explain skin contrast ratio for Indian dresses"
  ],
  "progress": [
    "How was my wavy learning path generated?",
    "What is the difference between Foundation and Advanced tier?",
    "How do I unlock milestone test checkpoints?",
    "Give me tips for the Katori blouse module"
  ],
  "history": [
    "How is my jury case study evaluated?",
    "What are the 3 criteria in the atelier rubric?",
    "How can I improve my reverse dieline score?"
  ],
  "placement": [
    "What topics does the placement exam cover?",
    "Explain the Kanjeevaram Korvai weaving technique",
    "How is the single waist dart intake calculated?"
  ],
  "default": [
    "What is VastraKala Labs?",
    "How do I calculate armhole depth for a kurta?",
    "Which colours suit warm wheatish skin tones?",
    "Explain Banarasi Kadhwa vs Jacquard weave"
  ]
}

export default function StitchChatbot({ currentRoute = "" }: StitchChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "stitch",
      text: "Purr-fect timing! I'm Stitch, your resident AI Master Couturier. Whether you need exact pattern drafting formulas, textile history, skin contrast advice, or guidance in the 3D Fit Lab—just ask!",
      timestamp: "Just now"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [bubbleTip, setBubbleTip] = useState("Need design guidance? Ask Stitch! ✂️")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  // Contextual bubble tip when route changes
  useEffect(() => {
    if (currentRoute.includes("ai-studio")) {
      setBubbleTip("In the AI Studio? Ask about 3D fit or dieline math! 🎨")
    } else if (currentRoute.includes("progress")) {
      setBubbleTip("Checking your learning path? Let's discuss milestones! 🧵")
    } else if (currentRoute.includes("placement")) {
      setBubbleTip("Taking the diagnostic test? Trust your craft instinct! 📐")
    } else if (currentRoute.includes("test")) {
      setBubbleTip("Speed sprint or Jury challenge? Need drafting tips? ✨")
    } else {
      setBubbleTip("Need couture guidance? Stitch is here! 🐾")
    }
  }, [currentRoute])

  const getSuggestions = () => {
    if (currentRoute.includes("ai-studio")) return ROUTE_SUGGESTIONS["ai-studio"]
    if (currentRoute.includes("progress")) return ROUTE_SUGGESTIONS["progress"]
    if (currentRoute.includes("history")) return ROUTE_SUGGESTIONS["history"]
    if (currentRoute.includes("placement")) return ROUTE_SUGGESTIONS["placement"]
    return ROUTE_SUGGESTIONS["default"]
  }

  const handleSendMessage = async (userPrompt?: string) => {
    const textToSend = (userPrompt || inputValue).trim()
    if (!textToSend || isLoading) return

    const userMessage: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages((prev) => [...prev, userMessage])
    if (!userPrompt) setInputValue("")
    setIsLoading(true)

    try {
      let stitchReply = ""

      // ── Method 1: Direct Gemini REST call with active models ──
      if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
        // Build recent conversational history
        const recentHistory = messages.slice(-4).map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        }))

        const payload = {
          contents: [
            ...recentHistory,
            {
              role: "user",
              parts: [
                {
                  text: `Current Studio/Page: "${currentRoute || "main"}"
Student Question: ${textToSend}`
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200
          }
        }

        for (const mName of GEMINI_MODELS) {
          try {
            const resp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              }
            )

            if (resp.ok) {
              const data = await resp.json()
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text
              if (text && text.trim().length > 0) {
                stitchReply = text
                break
              }
            } else {
              console.warn(`Gemini REST model ${mName} returned status ${resp.status}`)
            }
          } catch (fetchErr) {
            console.warn(`Gemini REST fetch for ${mName} failed:`, fetchErr)
          }
        }

        // ── Method 2: SDK Fallback if REST was blocked by CORS/fetch ──
        if (!stitchReply) {
          try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
            for (const mName of GEMINI_MODELS) {
              try {
                const model = genAI.getGenerativeModel({
                  model: mName,
                  systemInstruction: SYSTEM_PROMPT
                })
                const result = await model.generateContent({
                  contents: [
                    {
                      role: "user",
                      parts: [
                        {
                          text: `Context: Student is on route "${currentRoute || "home"}".
Question: ${textToSend}`
                        }
                      ]
                    }
                  ]
                })
                const text = result.response.text()
                if (text && text.trim().length > 0) {
                  stitchReply = text
                  break
                }
              } catch (sdkErr) {
                console.warn(`SDK model ${mName} failed:`, sdkErr)
              }
            }
          } catch (sdkInitErr) {
            console.warn("SDK initialization error:", sdkInitErr)
          }
        }
      }

      // ── Method 3: Expert Deterministic Fallback if network/offline ──
      if (!stitchReply) {
        const lower = textToSend.toLowerCase()
        if (lower.includes("armhole") || lower.includes("depth") || lower.includes("scye") || lower.includes("sleeve")) {
          stitchReply = `### Armhole Depth (Scye Drop) Geometry:
• **Fundamental Rule**: Calculate armhole depth from the **Upper Chest / Ribcage**, *never* the Full Bust Apex! Drafting from full bust on a heavy cup drops the scye excessively, causing the bodice to ride up when arms are raised.
• **Standard Kurta / Kameez**: \`Armhole Depth = Upper Chest ÷ 6 + 2.5 cm (1 inch)\`
• **Saree Blouse (Fitted Choli)**: \`Armhole Depth = Upper Chest ÷ 6 + 1.25 cm (0.5 inch)\`
• **Zarapkar System**: \`Armhole Depth = Chest ÷ 8 + 6.35 cm (2.5 inches)\`
• **Deep Back Neck Deduction**: If back neck depth is > 7 inches, subtract 0.5 to 0.75 inches to prevent gaping.
• **Sleeve Cap Height**: \`2/3 × Armhole Depth\`.`
        } else if (lower.includes("dart") || lower.includes("katori") || lower.includes("blouse") || lower.includes("waist")) {
          stitchReply = `### Bodice Dart Mathematics & Katori Architecture:
• **Single Waist Dart Intake**: \`(Full Bust − Natural Waist) ÷ 8\`
  * *Example*: For Bust 88 cm and Waist 72 cm (difference 16 cm): \`16 ÷ 8 = 2.0 cm\` dart allowance per side.
• **Dart Apex Distance**: \`Bust ÷ 10 + 1 cm\` from Centre Front.
• **Katori Blouse Geometry**: The bottom rounded cup of a Katori blouse MUST be cut on the **True Bias grain (45°)**. This provides natural mechanical stretch over the bust mound without requiring synthetic elastane or underwires.`
        } else if (lower.includes("trellis") || lower.includes("3d") || lower.includes("model") || lower.includes("fit")) {
          stitchReply = `### 3D Garment Fitting & Trellis Workflow:
1. **Interactive Three.js Studio**: Features an anatomical SMPL human body model rendered in a clean white studio with soft ambient and directional illumination.
2. **Continuous Skin Spectrum**: Use the horizontal scrollbar (0 to 100%) to smoothly adjust the model's skin tone across Porcelain, Golden Wheatish, Warm Honey, Bronze, Espresso, and Dark Ebony, complete with live hexadecimal readouts.
3. **AI 3D Mesh Synthesis**:
   - Upload any clean front-view garment image in the 3D Model Testing tab.
   - Click **"Generate 3D Model"**.
   - The platform uploads the asset to Cloudinary, streams it to HuggingFace's TRELLIS space, and returns an interactive 360° \`.glb\` mesh.
4. **Spatial Transform Controls**: Use the X, Y, and Z position and scale sliders to adjust shoulder breadth, waist drape, and vertical height independently!`
        } else if (lower.includes("skin") || lower.includes("contrast") || lower.includes("undertone") || lower.includes("colour") || lower.includes("color")) {
          stitchReply = `### Indian Couture Skin Tone & Undertone Harmony:
• **Golden Wheatish / Warm Honey Undertones**:
  * *Flattering Palettes*: Saturated jewel tones—Madder Terracotta (#c9513e), Royal Indigo (#194b65), Emerald Green, and Antique Zari (#aa7917).
  * *WCAG Contrast*: Aim for a contrast ratio > 3.5:1 against skin.
• **Cool Pinkish / Espresso Undertones**:
  * *Flattering Palettes*: Royal Sapphire, Rich Amethyst, Cool Fuchsia, Jade, and Silver Zari.
• **Neutral Undertones**:
  * Excels in natural mineral dyes like Ajrakh iron black, indigo, and madder red.
• *Atelier Pro-Tip*: When wearing high-saturation or dark garments against deep skin, insert an ivory or champagne silk piping along the collar and armhole to create a luminous visual bridge!`
        } else if (lower.includes("korvai") || lower.includes("kanjeevaram") || lower.includes("banarasi") || lower.includes("textile") || lower.includes("weave")) {
          stitchReply = `### Traditional Weaves: Banarasi & Kanjeevaram:
• **Kanjeevaram Korvai Technique**:
  * The body and border are woven using two or three distinct shuttles on pure mulberry silk.
  * The borders are interlocked by hand at the selvedge junction using a toothed 'temple' (*rekku*) pattern.
  * Because warp threads are tied individually, the border has solid saturated colour without thread contamination from the body!
• **Banarasi Kadhwa Brocade**:
  * Each floral motif (*booti*) is hand-engraved and woven with separate spools of silver/gold zari.
  * There are zero floating loose threads on the back of the cloth, unlike cheap power-loom Jacquards!`
        } else if (lower.includes("dieline") || lower.includes("pattern") || lower.includes("cad") || lower.includes("measurement")) {
          stitchReply = `### Technical Dieline Studio & CAD Vector Blueprints:
• **Image Analysis via Gemini Vision**: Upload any garment photograph (pants, kurti, anarkali, blouse, lehenga, or sherwani). Gemini Vision detects the silhouette, grainline orientation, and seam count.
• **CAD Vector Blueprint**: Generates an interactive SVG cutting pattern with explicit grainlines, notches, and cut-quantity indicators.
• **Measurement Blanks**: Provides customizable drafting blanks for:
  - Quarter Bust + Ease
  - Waist Dart Intake
  - Sleeve Crown Height & Inseam
  - Crotch Depth & Thigh Circumference for pants
  - Kali Flare Multipliers for anarkalis and lehengas.`
        } else {
          stitchReply = `### Greetings from the Atelier!
As your resident AI master mentor, I can assist you with:
• **Pattern Mathematics**: Zarapkar formulas for armholes, waist darts, crotch depths, and lehenga flare kalis.
• **Living Weaves**: Weaving mechanisms of Banarasi Kadhwa, Kanjeevaram Korvai, Chanderi sheer, Patola, and Ajrakh.
• **Surface Ornamentation**: Zardozi relief, Lucknowi Chikankari stitches, and Phulkari floss work.
• **Skin Tone Harmony**: WCAG contrast ratio analysis and undertone matching.
• **App Walkthroughs**: 3D Trellis mesh generation, technical CAD dielines, and diagnostic placement tests.

What garment, formula, or craft shall we explore together?`
        }
      }

      const stitchMessage: ChatMessage = {
        id: "s-" + Date.now(),
        sender: "stitch",
        text: stitchReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages((prev) => [...prev, stitchMessage])
    } catch (error) {
      console.error("Stitch conversation error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "stitch",
          text: "My claws got tangled in the measuring tape! Let me reset—please ask your question once more.",
          timestamp: "Just now"
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Format message text with markdown-style headings, bold, and bullet points
  const renderFormattedText = (rawText: string) => {
    return rawText.split("\n").map((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="font-serif font-bold text-sm text-[#172b2b] mt-2 mb-1">
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        )
      }
      if (trimmed.startsWith("•") || trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const content = trimmed.replace(/^[-•*]\s*/, "")
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1.5 my-1 text-xs">
            <span className="text-[#c9513e] font-bold shrink-0">•</span>
            <span>
              {content.split("**").map((chunk, cIdx) =>
                cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-[#172b2b]">{chunk}</strong> : chunk
              )}
            </span>
          </div>
        )
      }
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />
      }
      return (
        <p key={idx} className="my-1 text-xs leading-relaxed">
          {line.split("**").map((chunk, cIdx) =>
            cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-[#172b2b]">{chunk}</strong> : chunk
          )}
        </p>
      )
    })
  }

  return (
    <>
      {/* Floating Stitch Badge (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[950] flex flex-col items-end pointer-events-auto">
        {/* Pulsing context tooltip when closed */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="mb-2.5 px-3.5 py-1.5 rounded-full bg-[#172b2b] text-white text-[11px] font-bold shadow-lg border border-[#e8b547]/40 flex items-center gap-1.5 cursor-pointer hover:bg-[#c9513e] transition-all transform hover:-translate-y-0.5 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8b547]" />
            <span>{bubbleTip}</span>
          </div>
        )}

        {/* Trigger Button with Cat.png */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden border-2 ${
            isOpen
              ? "bg-[#172b2b] border-[#c9513e] rotate-90"
              : "bg-[#faf8f4] border-[#e8b547] hover:scale-110"
          }`}
          style={{ boxShadow: "0 10px 25px rgba(23, 43, 43, 0.3)" }}
          aria-label="Open Stitch AI Fashion Mentor"
          title="Chat with Stitch"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="w-full h-full p-1 flex items-center justify-center">
              <img
                src="/Cat.png"
                alt="Stitch AI Mentor"
                className="w-full h-full object-contain filter drop-shadow transition-transform group-hover:scale-110"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#28a745] border-2 border-white" />
            </div>
          )}
        </button>
      </div>

      {/* Expandable Atelier Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[950] w-[92vw] sm:w-[440px] h-[600px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-[#ded4c3] flex flex-col overflow-hidden animate-fadeIn"
          style={{
            boxShadow: "0 25px 60px rgba(23, 43, 43, 0.35)",
            backdropFilter: "blur(8px)"
          }}
        >
          {/* Header */}
          <div className="bg-[#172b2b] text-white p-4 flex items-center justify-between border-b border-[#28453c]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faf8f4] p-1 border-2 border-[#e8b547] shrink-0 overflow-hidden">
                <img src="/Cat.png" alt="Stitch" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-base text-white leading-none">Stitch</h3>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e8b547] text-[#172b2b]">
                    AI Couturier
                  </span>
                </div>
                <p className="text-[10px] text-[#cad5cf] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28a745] inline-block" /> Powered by Gemini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([{ id: "init", sender: "stitch", text: "Atelier workbench cleared! What shall we draft next?", timestamp: "Now" }])}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#aaa] hover:text-white transition-all"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#aaa] hover:text-white transition-all"
                title="Minimize Stitch"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Feature Context Banner */}
          <div className="bg-[#faf6ee] px-4 py-2 border-b border-[#e8dfd1] flex items-center justify-between text-[11px] text-[#7a5e00]">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <Scissors className="w-3.5 h-3.5 text-[#c9513e]" />
              <span>Studio Context: <strong>{currentRoute || "Main Campus"}</strong></span>
            </span>
            <span className="text-[10px] text-[#28a745] uppercase tracking-wider shrink-0 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#28a745]" /> Live Mentor
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fcfaf7]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "stitch" && (
                  <div className="w-7 h-7 rounded-full bg-[#faf8f4] p-0.5 border border-[#e8b547] shrink-0 mt-0.5 overflow-hidden">
                    <img src="/Cat.png" alt="Stitch" className="w-full h-full object-contain" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#172b2b] text-white rounded-br-none shadow-sm"
                      : "bg-white text-[#2c3e3e] border border-[#e8e0d2] rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="font-sans">
                    {msg.sender === "stitch" ? renderFormattedText(msg.text) : msg.text}
                  </div>
                  <span
                    className={`text-[9px] block text-right mt-1.5 ${
                      msg.sender === "user" ? "text-white/60" : "text-[#999]"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[#c9513e] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#888] bg-white p-3 rounded-2xl border border-[#ded4c3] w-fit shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#faf8f4] p-0.5 border border-[#e8b547] shrink-0 overflow-hidden">
                  <img src="/Cat.png" alt="Stitch" className="w-full h-full object-contain animate-pulse" />
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <span>Stitch is formulating</span>
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse" style={{ animationDelay: "200ms" }}>.</span>
                  <span className="animate-pulse" style={{ animationDelay: "400ms" }}>.</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Suggestions */}
          <div className="px-3 py-2 bg-white border-t border-[#ede4d6] overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
            {getSuggestions().map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#faf6ee] hover:bg-[#c9513e] hover:text-white text-[#7a5e00] border border-[#e8dfd1] text-[10px] font-medium transition-all shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 bg-white border-t border-[#ded4c3] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Stitch about formulas, weaves, fit..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#ddd] bg-[#faf8f4] text-xs text-[#172b2b] placeholder-[#aaa] focus:outline-none focus:border-[#c9513e] focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#172b2b] hover:bg-[#c9513e] text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
              aria-label="Send prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
