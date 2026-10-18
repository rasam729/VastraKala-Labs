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

const SYSTEM_PROMPT = `You are "Stitch", the resident feline Master Atelier AI Mentor at VastraKala Labs (The Science & Soul of Indian Couture).
You possess decades of deep wisdom across Indian fashion design, traditional textiles, pattern drafting mathematics, colour harmony, and this entire learning platform.

Your expertise includes:
1. Indian Fashion Heritage: Vedic draping, Mughal courtly attire (Jama, Angrakha, Aba), regional sarees (Nivi, Nauvari, Seedha Pallu, Mekhela Chador), and contemporary Indo-Western revival.
2. Traditional Indian Textiles: Banarasi brocade, Kanjeevaram Korvai interlocking weave, Chanderi tissue, Patola double ikat, Sambalpuri Bandha, Ajrakh natural resist printing, Jamdani extra-weft, Paithani tapestry borders.
3. Surface Ornamentation: Zardozi metallic relief, Lucknowi Chikankari shadow work, Punjabi Phulkari geometric silk floss, Rajasthani Gota Patti applique, Bengali Kantha running stitch.
4. Exact Pattern Mathematics & Drafting Formulas:
   - Armhole Depth = Bust ÷ 6 + 7 cm
   - Single Waist Dart Intake = (Bust − Waist) ÷ 8
   - Quarter Bust with Ease = Bust ÷ 4 + 2.5 cm
   - Salwar Crotch Depth = Hip ÷ 4 + 2 cm
   - Sleeve Cap Height = 2/3 of Armhole Depth
   - Back Neck Width = Shoulder ÷ 6 + 0.5 cm
   - Standard seam allowances: 1.5 cm for structural seams; 0.5 cm for stay-stitched curves.
5. Skin Tone Contrast & Colour Science:
   - Warm Undertones (Wheatish / Golden / Warm Honey): Flattered by rich jewel tones (Madder Ruby, Emerald, Indigo, Amber Gold) with WCAG contrast ratio > 3.5:1.
   - Cool Undertones (Pinkish / Olive / Deep Ebony): Flattered by royal sapphire, cool fuchsia, jade, silver zari.
   - Dual-tone borders and neutral ivory bridges for high-contrast balance.
6. VastraKala Labs Platform Features:
   - AI Studio: Sketch & Design Studio (canvas with undo/clear, sketch image upload to Gemini dress synthesis, PNG download), Colour Theory & Skin Lab, Technical Dieline (CAD vector generator with measurement blanks), and 3D Model Testing (Three.js SMPL body, continuous skin spectrum scrollbar, and Trellis 3D mesh synthesis).
   - Placement Test: 6 diagnostic test variants generating the wavy tailoring-stitch learning path in the Progress tab.
   - Curriculum: 6 courses, 30 units with embedded YouTube studio tutorials and curated research documentation.

Personality & Tone:
Warm, articulate, witty, encouraging, and rigorous with craft measurements. You are a mentor guiding an apprentice tailor or fashion designer. Format your answers clearly with bullet points, bold highlights, and mathematical formulas when appropriate.`

// Contextual quick suggestions based on current user view
const ROUTE_SUGGESTIONS: Record<string, string[]> = {
  "ai-studio": [
    "How does the 3D Trellis mesh generator work?",
    "What is the formula for armhole depth?",
    "How do I annotate a technical dieline?",
    "Explain skin contrast ratio for Indian dresses"
  ],
  "progress": [
    "How does my wavy learning path get generated?",
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
    "How do I calculate armhole depth?",
    "Which colours suit warm wheatish skin tones?",
    "How do I start my personalized learning journey?"
  ]
}

export default function StitchChatbot({ currentRoute = "" }: StitchChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "stitch",
      text: "Purr-fect timing! I'm Stitch, your resident AI Master Couturier. Whether you need pattern drafting formulas, textile history, skin contrast advice, or guidance in the 3D Fit Lab—just ask!",
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
      setBubbleTip("In the AI Studio? I can help with dielines & 3D fit! 🎨")
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

    // Call Gemini API
    try {
      let stitchReply = ""

      if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
        try {
          const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
          // Try gemini-1.5-flash first, fallback to 2.0-flash or 1.5-pro
          const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
          let responseText = ""

          for (const mName of modelNames) {
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
                        text: `Context: The student is currently on page/route "${currentRoute || "home"}".
Student asks: ${textToSend}`
                      }
                    ]
                  }
                ]
              })
              responseText = result.response.text()
              if (responseText) break
            } catch (err) {
              console.warn(`Model ${mName} attempt failed:`, err)
            }
          }

          if (responseText) {
            stitchReply = responseText
          }
        } catch (apiErr) {
          console.warn("Direct GoogleGenerativeAI call failed, checking fallback:", apiErr)
        }
      }

      // High-quality deterministic fallback knowledge base if API key is not ready or rate-limited
      if (!stitchReply) {
        const lower = textToSend.toLowerCase()
        if (lower.includes("armhole") || lower.includes("depth") || lower.includes("sleeve")) {
          stitchReply = `**Armhole Depth Formula**:
• **Standard Formula**: \`Armhole Depth = Bust ÷ 6 + 7 cm\`
• *Example*: For an 88 cm bust: \`88 ÷ 6 + 7 = 14.66 + 7 = 21.66 cm\` (round to 21.5–22.0 cm).
• **Sleeve Cap Height**: \`2/3 × Armhole Depth\` (e.g., \`2/3 × 21.6 = 14.4 cm\`).
• **Atelier Pro-Tip**: Always add 1.5 cm wearing ease when drafting silk or heavy brocade, as structured handlooms have zero stretch!`
        } else if (lower.includes("dart") || lower.includes("katori") || lower.includes("blouse")) {
          stitchReply = `**Waist Dart & Bodice Intake Mathematics**:
• **Single Waist Dart Intake**: \`(Bust − Waist) ÷ 8\`
• *Example*: If Bust = 88 cm and Waist = 72 cm, difference = 16 cm. \`16 ÷ 8 = 2.0 cm\` dart allowance per side.
• **Apex Distance**: Usually \`Bust ÷ 10 + 1 cm\` from centre front.
• For a **Katori Blouse**, always shape the rounded bottom cup along the true bias grain (45°) for natural breast contouring without underwires!`
        } else if (lower.includes("trellis") || lower.includes("3d") || lower.includes("model")) {
          stitchReply = `**3D Garment Synthesis & Trellis Guide**:
1. **Upload Reference**: In the 3D Model Testing tab, upload a clean garment photo.
2. **Click "Generate 3D Model"**: Our backend uploads the image to Cloudinary and communicates directly with the HuggingFace TRELLIS Gradio space to synthesize a full 360° \`.glb\` mesh.
3. **Anatomical Draping**: The generated garment loads automatically onto our SMPL human body model.
4. **Controls**: Use the continuous skin-tone spectrum scrollbar (0–100%) to test against 8 diverse undertones, and use the X/Y/Z position and scale sliders to tailor the fit!`
        } else if (lower.includes("skin") || lower.includes("contrast") || lower.includes("undertone") || lower.includes("colour")) {
          stitchReply = `**Couture Skin Harmony & Undertone Theory**:
• **Warm Wheatish / Golden Undertones**: Glows best against saturated jewel tones—**Madder Ruby (#c9513e)**, **Peacock Indigo (#194b65)**, and antique **Zari Gold (#aa7917)**. Minimum WCAG contrast ratio should exceed 3.5:1.
• **Cool Pinkish / Espresso Undertones**: Shines with royal sapphire, icy pastel metallics, and emerald.
• **Neutral Undertones**: Ideal for earthy Ajrakh palettes and dual-tone borders.
• *Atelier Tip*: When working with deep tones, use an ivory or cream border piping to create a luminous visual bridge!`
        } else if (lower.includes("korvai") || lower.includes("kanjeevaram") || lower.includes("banarasi")) {
          stitchReply = `**Textile Masterclass: Korvai & Brocade**:
• **Korvai Weaving (Kanjeevaram)**: A labour-intensive South Indian technique where the saree body and border are woven separately using two or three distinct shuttles, then meticulously interlocked by hand at the boundary. This allows contrasting solid border colours with zero thread show-through!
• **Banarasi Kadhwa**: Each motif (booti) is hand-engraved and woven individually with no loose floats on the reverse, unlike modern Jacquard power looms. Pure heritage craftsmanship!`
        } else if (lower.includes("placement") || lower.includes("path") || lower.includes("level")) {
          stitchReply = `**Diagnostic Placement Assessment & Tailoring Path**:
• Clicking **"Begin your journey"** on the homepage launches one of 6 diagnostic test variants covering 6 key disciplines (History, Weaves, Pattern Math, Colour, Construction, Sustainability).
• Your score classifies you into:
  - **Foundation Tier (<50%)**: Starts with grainlines, shrinkage physics, and fabric behaviour.
  - **Intermediate Tier (50–79%)**: Starts with bodice blocks, dart manipulation, and colour contrast.
  - **Advanced Tier (≥80%)**: Direct access to sherwani structure, fusion silhouettes, and capstone jury.
• Your personalised path is mapped out in the **Progress tab** as an SVG wavy tailoring-stitch line!`
        } else {
          stitchReply = `At your service! As your atelier mentor, I can help you with:
• **Pattern Formulas**: Armhole depth, waist darts, sleeve crowns, and lehenga kali math.
• **Textile Traditions**: Weaving mechanisms of Banarasi, Kanjeevaram, Chanderi, Ikat, and Ajrakh.
• **Surface Craft**: Zardozi relief, Chikankari stitches, and Phulkari floss work.
• **AI Studio Tools**: 3D Trellis mesh generation, vector CAD dieline blueprints, and Gemini vision sketch synthesis.

What garment or technique would you like to explore together?`
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
      console.error("Stitch error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "stitch",
          text: "My claws got tangled in the measuring tape! Please try asking again in a moment.",
          timestamp: "Just now"
        }
      ])
    } finally {
      setIsLoading(false)
    }
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
          className="fixed bottom-24 right-6 z-[950] w-[92vw] sm:w-[420px] h-[580px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-[#ded4c3] flex flex-col overflow-hidden animate-fadeIn"
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
                    AI Mentor
                  </span>
                </div>
                <p className="text-[10px] text-[#cad5cf] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28a745] inline-block" /> Master Atelier Couturier
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
              <span>Current Studio: <strong>{currentRoute || "Main Campus"}</strong></span>
            </span>
            <span className="text-[10px] text-[#999] uppercase tracking-wider shrink-0 font-bold">Gemini 1.5</span>
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
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#172b2b] text-white rounded-br-none shadow-sm"
                      : "bg-white text-[#2c3e3e] border border-[#e8e0d2] rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text.split("\n").map((line, idx) => {
                      // Simple markdown-style bold formatting
                      if (line.startsWith("•") || line.startsWith("-")) {
                        return <div key={idx} className="ml-2 my-0.5">{line}</div>
                      }
                      return <div key={idx} className={line.startsWith("**") ? "font-bold text-[#172b2b] mt-1" : ""}>{line}</div>
                    })}
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
                  <span>Stitch is drafting</span>
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
