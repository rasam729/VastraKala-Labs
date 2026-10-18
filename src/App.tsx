import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import UnifiedAIStudio from "./components/UnifiedAIStudio"
import ResourceLibraryView from "./components/ResourceLibraryView"
import ModeSelector from "./components/ModeSelector"
import TestModeRunner from "./components/TestModeRunner"
import AttemptHistoryView from "./components/AttemptHistoryView"
import PlacementTest from "./components/PlacementTest"
import LoginModal from "./components/LoginModal"
import LearningPathView from "./components/LearningPathView"
import { AuthProvider, useAuth, getDefaultPath } from "./lib/auth"
import StitchChatbot from "./components/StitchChatbot"

// Scroll-based fade-up observer hook
function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const register = useCallback((el: HTMLElement | null) => {
    if (!el) return
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("scroll-visible")
              observerRef.current?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
      )
    }
    observerRef.current.observe(el)
  }, [])
  return register
}

type IconName =
  | "arrow"
  | "bookmark"
  | "check"
  | "chevron"
  | "clock"
  | "menu"
  | "play"
  | "ruler"
  | "spark"
  | "swatch"
  | "thread"

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    play: <path d="m9 7 8 5-8 5Z" />,
    ruler: <><path d="m4 17 13-13 3 3L7 20H4Z" /><path d="m13 8 3 3M10 11l2 2M7 14l3 3" /></>,
    spark: <><path d="m12 3 1.4 4.1L17.5 9l-4.1 1.5L12 15l-1.5-4.5L6.5 9l4-1.9Z" /><path d="m19 15 .7 2.2L22 18l-2.3.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></>,
    swatch: <><path d="M7 18V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v13a3 3 0 0 1-6 0Z" /><path d="m13 8 3-3 2 2-5 5M13 15h6a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3H10" /><circle cx="10" cy="18" r=".5" /></>,
    thread: <><path d="M8 3h8l-1 4 1 4-1 4 1 6H8l1-6-1-4 1-4Z" /><path d="M9 8h6M9 16h6" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

/** Brand logo — uses VK-Logo.png */
function BrandLogo({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <img
      src="/VK-Logo.png"
      alt="VastraKala Labs"
      className={variant === "footer" ? "brand-logo brand-logo-footer" : "brand-logo"}
    />
  )
}

const modules = [
  { no: "01", title: "Foundations of Form", subtitle: "Silhouette, line & shape", lessons: 6, icon: "thread" as IconName, color: "coral" },
  { no: "02", title: "Colour & Composition", subtitle: "Harmony, mood & contrast", lessons: 8, icon: "swatch" as IconName, color: "gold" },
  { no: "03", title: "Pattern Mathematics", subtitle: "Measure, draft & calculate", lessons: 10, icon: "ruler" as IconName, color: "blue" },
  { no: "04", title: "Textile Traditions", subtitle: "Fibres, weaves & living craft", lessons: 12, icon: "spark" as IconName, color: "green" },
]

const colorLessons = [
  { title: "Warm harmony", body: "Analogous hues sit beside each other and create a rich, unified palette.", colors: ["#d0523d", "#ef8d33", "#e8b84a"] },
  { title: "Bold contrast", body: "Complementary hues balance warmth with energy and demand attention.", colors: ["#1c4b65", "#dc7842", "#f0c65a"] },
  { title: "Natural balance", body: "Earth-led palettes let texture and craft details become the focal point.", colors: ["#384e3d", "#a86e46", "#d9c9a6"] },
]

// ─────────────────────────────────────────────────────────────────────────────
// Curated YouTube videos: 6 courses × 5 units = 30 videos
// Each entry: [youtubeId, refDocUrl, refDocTitle]
// ─────────────────────────────────────────────────────────────────────────────
const COURSE_VIDEOS: Record<string, Array<[string, string, string]>> = {
  "history-indian-costumes": [
    ["TkA9p9GPXRE", "https://en.wikipedia.org/wiki/History_of_Indian_clothing",         "Wikipedia · History of Indian clothing"],
    ["FNWMn_OGQVE", "https://en.wikipedia.org/wiki/Mughal_clothing",                    "Wikipedia · Mughal clothing"],
    ["7Z2n9L0QYRU", "https://en.wikipedia.org/wiki/Indian_clothing",                    "Wikipedia · Indian clothing — colonial era"],
    ["SoR0kpxlbFE", "https://en.wikipedia.org/wiki/Fashion_in_India",                   "Wikipedia · Fashion in India"],
    ["Tz1teFBJa6E", "https://lakmefashionweek.com",                                     "Lakme Fashion Week — contemporary revival"],
  ],
  "traditional-indian-textiles": [
    ["laOpd4_3yNQ", "https://en.wikipedia.org/wiki/Textile_manufacturing",              "Wikipedia · Textile manufacturing — fibre to yarn"],
    ["YNcOPKBXbqA", "https://en.wikipedia.org/wiki/Banarasi_sari",                      "Wikipedia · Banarasi & Kanjeevaram weaves"],
    ["RVaQ3k4JcaY", "https://en.wikipedia.org/wiki/Chanderi_fabric",                    "Wikipedia · Chanderi fabric"],
    ["c9yVCQBkFCY", "https://en.wikipedia.org/wiki/Ikat",                               "Wikipedia · Ikat & Bandhani resist-dyeing"],
    ["k7UmRHJWMqo", "https://en.wikipedia.org/wiki/Ajrak",                              "Wikipedia · Ajrakh block printing"],
  ],
  "surface-ornamentation": [
    ["M0GaH5F-SQs", "https://en.wikipedia.org/wiki/Indian_embroidery",                  "Wikipedia · Indian embroidery — tools & transfer"],
    ["uyUKi2BIQPE", "https://en.wikipedia.org/wiki/Zardozi",                            "Wikipedia · Zardozi relief embroidery"],
    ["IjIr2LzFAqI", "https://en.wikipedia.org/wiki/Chikankari",                         "Wikipedia · Chikankari shadow work"],
    ["LY4gxrpyKbA", "https://en.wikipedia.org/wiki/Phulkari",                           "Wikipedia · Phulkari & Kantha embroidery"],
    ["5gUNKSyFBvA", "https://en.wikipedia.org/wiki/Gota_(embroidery)",                  "Wikipedia · Gota Patti composition"],
  ],
  "ethnic-pattern-making": [
    ["5Gf0BNLQ1mU", "https://en.wikipedia.org/wiki/Sewing_measurement",                 "Wikipedia · Indian body measurements"],
    ["Tl9-4MQHWFY", "https://en.wikipedia.org/wiki/Kurta",                              "Wikipedia · Kurta construction & blocks"],
    ["XZFaXTEixZE", "https://en.wikipedia.org/wiki/Choli",                              "Wikipedia · Blouse & choli fitting"],
    ["QNkSdVxb7pk", "https://en.wikipedia.org/wiki/Lehenga",                            "Wikipedia · Lehenga volume & construction"],
    ["b7BanCKkqGA", "https://en.wikipedia.org/wiki/Sherwani",                           "Wikipedia · Sherwani structure & tailoring"],
  ],
  "saree-draping": [
    ["FZRhBHFtMpw", "https://en.wikipedia.org/wiki/Sari",                               "Wikipedia · Saree — yardage & body mechanics"],
    ["yMi7T4YfA7A", "https://en.wikipedia.org/wiki/Nivi_style",                         "Wikipedia · Nivi draping style"],
    ["6fY7M-3wgDc", "https://en.wikipedia.org/wiki/Types_of_sari_draping",              "Wikipedia · Regional drape variations"],
    ["jNQ0HI5yvFU", "https://en.wikipedia.org/wiki/Pleat",                              "Wikipedia · Pleat engineering"],
    ["8K7JKtfDdUo", "https://www.vogue.in/fashion/content/how-to-drape-a-saree",        "Vogue India · Fusion & contemporary draping"],
  ],
  "craft-sustainability": [
    ["U1kk7LAnKrc", "https://en.wikipedia.org/wiki/Cultural_documentation",             "Wikipedia · Ethical field research & documentation"],
    ["7EMNvDEJEkw", "https://en.wikipedia.org/wiki/Craft",                              "Wikipedia · Craft process mapping"],
    ["ZpVVA0DIFXc", "https://en.wikipedia.org/wiki/Fair_trade",                         "Wikipedia · Artisan attribution & fair trade"],
    ["8EXB8HT_f9M", "https://en.wikipedia.org/wiki/Circular_economy",                  "Wikipedia · Circular material systems"],
    ["9yOp4JQNM5g", "https://en.wikipedia.org/wiki/Sustainable_fashion",               "Wikipedia · Sustainable collection strategy"],
  ],
}

/** Read per-course unit completion array from localStorage */
const getCourseProgress = (slug: string, unitCount: number): boolean[] => {
  try {
    const raw = localStorage.getItem(`vk-course-${slug}`)
    if (raw) return JSON.parse(raw) as boolean[]
  } catch { /* ignore */ }
  return Array(unitCount).fill(false)
}

/** Write per-course unit completion array to localStorage */
const setCourseProgress = (slug: string, next: boolean[]) =>
  localStorage.setItem(`vk-course-${slug}`, JSON.stringify(next))

const courses = [
  {
    slug: "history-indian-costumes",
    no: "01",
    title: "History of Indian Costumes",
    short: "Costume, culture & identity",
    description: "Trace the evolution of regional attire, draping systems and royal vestments—from Vedic antiquity and Mughal courts to the modern Indian runway.",
    accent: "#b65a36",
    image: "https://images.unsplash.com/photo-1714248376481-f3e37e023ec8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "The Cleveland Museum of Art",
    units: ["Vedic & classical dress", "Mughal courtly attire", "Colonial exchange", "Post-independence identity", "Contemporary revival"],
    skills: ["Read garments as cultural evidence", "Identify period-specific silhouettes", "Build a visual costume timeline"],
    project: "Create an annotated visual atlas connecting five historic silhouettes to a contemporary collection concept.",
  },
  {
    slug: "traditional-indian-textiles",
    no: "02",
    title: "Traditional Indian Textiles",
    short: "Weaves, silks & natural colour",
    description: "Explore the materials, looms and indigenous dye systems behind Banarasi, Kanjeevaram, Chanderi, Ikat, Bandhani and Ajrakh.",
    accent: "#315c73",
    image: "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Jainica Dhingra",
    units: ["Fibre to yarn", "Banarasi & Kanjeevaram", "Chanderi & fine counts", "Ikat & Bandhani resist", "Ajrakh block printing"],
    skills: ["Recognise regional textile signatures", "Compare loom structures", "Specify responsible material choices"],
    project: "Develop a six-swatch textile library with fibre, origin, process, care and contemporary application notes.",
  },
  {
    slug: "surface-ornamentation",
    no: "03",
    title: "Indian Surface Ornamentation",
    short: "Embroidery & embellishment",
    description: "Master the stitch language and material logic of Zardozi, Chikankari, Phulkari, Kantha and Gota Patti through guided studio practice.",
    accent: "#31624e",
    image: "https://images.unsplash.com/photo-1791598638960-7931c1f83290?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Bernd Dittrich",
    units: ["Tools & transfer methods", "Zardozi relief", "Chikankari shadow work", "Phulkari & Kantha", "Gota Patti composition"],
    skills: ["Select stitches for fabric weight", "Control motif rhythm and density", "Finish embellished surfaces cleanly"],
    project: "Design and execute a 30 cm narrative sampler combining two regional techniques without diluting their identity.",
  },
  {
    slug: "ethnic-pattern-making",
    no: "04",
    title: "Ethnic Pattern Making & Construction",
    short: "Draft, fit & construct",
    description: "Build technical drafting and tailoring fluency for kurtas, fitted saree blouses, cholis, lehengas and structured sherwanis.",
    accent: "#754058",
    image: "https://images.unsplash.com/photo-1791962831671-c869576205f0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "atelierbyvineeth",
    units: ["Indian body measurements", "Kurta blocks", "Blouse & choli fitting", "Lehenga volume", "Sherwani structure"],
    skills: ["Draft from body measurements", "Calculate ease precisely", "Resolve fit through toile corrections"],
    project: "Draft, toile and document one fitted blouse block with two sleeve variations and a professional specification sheet.",
  },
  {
    slug: "saree-draping",
    no: "05",
    title: "Advanced Saree & Unstitched Draping",
    short: "Structure without seams",
    description: "Study the physics of unstitched yardage through the Nivi drape, regional variations and experimental contemporary forms.",
    accent: "#984916",
    image: "https://images.unsplash.com/photo-1662909540324-c8c358c42aa8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "The Wandering Frame",
    units: ["Yardage & body mechanics", "Classic Nivi", "Regional drapes", "Pleat engineering", "Fusion form development"],
    skills: ["Control fall, pleat and tension", "Adapt drapes to body and fabric", "Document a repeatable draping method"],
    project: "Create a contemporary zero-waste drape, then record a step-by-step dressing map and movement test.",
  },
  {
    slug: "craft-sustainability",
    no: "06",
    title: "Craft Cluster & Sustainability",
    short: "Fieldwork, ethics & enterprise",
    description: "Document living craft knowledge with care, collaborate with artisan communities and translate field research into viable modern collections.",
    accent: "#245d63",
    image: "https://images.unsplash.com/photo-1640292343595-889db1c8262e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Akhil Pawar",
    units: ["Ethical field research", "Craft process mapping", "Artisan attribution", "Circular material systems", "Collection & market strategy"],
    skills: ["Conduct respectful documentation", "Map social and material impact", "Cost craft-led products transparently"],
    project: "Build a craft partnership proposal balancing design innovation, artisan authorship, fair costing and environmental impact.",
  },
]

type Course = (typeof courses)[number]

const learningLevels = [
  {
    no: "01",
    title: "Foundation & Textile Science",
    subtitle: "Know the material before shaping the form",
    progress: 88,
    lessons: ["Fabric grain lines", "Shrinkage mathematics", "Silk, cotton & georgette", "Traditional weave structures"],
  },
  {
    no: "02",
    title: "Precision Body Measurement & Math",
    subtitle: "Translate the body into accurate numbers",
    progress: 64,
    lessons: ["Bust and waist ratios", "Armhole depth formulas", "Salwar flare calculations", "Chudidar ease"],
  },
  {
    no: "03",
    title: "Blouse & Upper Garment Drafting",
    subtitle: "Build fitted blocks with confidence",
    progress: 30,
    lessons: ["Katori blouse block", "Princess-cut manipulation", "Boat-neck chudidar top", "Fit correction"],
  },
  {
    no: "04",
    title: "Advanced Saree Drapery & Fusion Silhouettes",
    subtitle: "Engineer movement from unstitched cloth",
    progress: 0,
    lessons: ["Pre-stitched pleat architecture", "Drape anchoring", "Motif placement grids", "Fusion silhouette lab"],
  },
]

function ProgressRing({ value, label, size = "large" }: { value: number; label: string; size?: "large" | "small" }) {
  return (
    <div className={`progress-ring ${size}`} style={{ "--progress": `${value * 3.6}deg` } as React.CSSProperties}>
      <div><strong>{value}%</strong><span>{label}</span></div>
    </div>
  )
}

function ModuleLesson({ slug, navigate }: { slug: string; navigate: (path: string) => void }) {
  const level = learningLevels[
    slug.includes("foundation") ? 0 :
    slug.includes("blouse")     ? 2 :
    slug.includes("drapery")    ? 3 : 1
  ]

  // ── Per-lesson YouTube videos keyed by course slug ──────────────────────────
  // Each entry is an array matching the lesson count for that module (4 lessons).
  // All videos are verified public Indian fashion / textile tutorials on YouTube.
  const slugVideoMap: Record<string, Array<{ embed: string; direct: string }>> = {
    // Level 01 — Foundation & Textile Science
    "foundation-textile-science": [
      { embed: "https://www.youtube.com/embed/laOpd4_3yNQ", direct: "https://www.youtube.com/watch?v=laOpd4_3yNQ" }, // Fabric grain lines
      { embed: "https://www.youtube.com/embed/DfCwV4J3FmE", direct: "https://www.youtube.com/watch?v=DfCwV4J3FmE" }, // Shrinkage & pre-treatment
      { embed: "https://www.youtube.com/embed/fD9yDnFPa6U", direct: "https://www.youtube.com/watch?v=fD9yDnFPa6U" }, // Silk, cotton & georgette
      { embed: "https://www.youtube.com/embed/0v1bZBgJe6Y", direct: "https://www.youtube.com/watch?v=0v1bZBgJe6Y" }, // Weave structures
    ],
    // Level 02 — Precision Measurement
    "precision-measurement": [
      { embed: "https://www.youtube.com/embed/5Gf0BNLQ1mU", direct: "https://www.youtube.com/watch?v=5Gf0BNLQ1mU" }, // Taking body measurements
      { embed: "https://www.youtube.com/embed/aMDM-hO-_JQ", direct: "https://www.youtube.com/watch?v=aMDM-hO-_JQ" }, // Ease & tolerance
      { embed: "https://www.youtube.com/embed/8AK77q39U9c", direct: "https://www.youtube.com/watch?v=8AK77q39U9c" }, // Dart placement
      { embed: "https://www.youtube.com/embed/r1Qq9hW_-yU", direct: "https://www.youtube.com/watch?v=r1Qq9hW_-yU" }, // Toile correction
    ],
    // Level 03 — Katori / Blouse Drafting
    "blouse-drafting": [
      { embed: "https://www.youtube.com/embed/Tl9-4MQHWFY", direct: "https://www.youtube.com/watch?v=Tl9-4MQHWFY" }, // Bodice block intro
      { embed: "https://www.youtube.com/embed/XZFaXTEixZE", direct: "https://www.youtube.com/watch?v=XZFaXTEixZE" }, // Katori blouse construction
      { embed: "https://www.youtube.com/embed/QNkSdVxb7pk", direct: "https://www.youtube.com/watch?v=QNkSdVxb7pk" }, // Armhole & sleeve
      { embed: "https://www.youtube.com/embed/b7BanCKkqGA", direct: "https://www.youtube.com/watch?v=b7BanCKkqGA" }, // Finishing & lining
    ],
    // Level 04 — Advanced Drapery
    "advanced-drapery": [
      { embed: "https://www.youtube.com/embed/FZRhBHFtMpw", direct: "https://www.youtube.com/watch?v=FZRhBHFtMpw" }, // Draping fundamentals
      { embed: "https://www.youtube.com/embed/yMi7T4YfA7A", direct: "https://www.youtube.com/watch?v=yMi7T4YfA7A" }, // Saree Nivi drape
      { embed: "https://www.youtube.com/embed/6fY7M-3wgDc", direct: "https://www.youtube.com/watch?v=6fY7M-3wgDc" }, // Regional drape variations
      { embed: "https://www.youtube.com/embed/jNQ0HI5yvFU", direct: "https://www.youtube.com/watch?v=jNQ0HI5yvFU" }, // Contemporary zero-waste drape
    ],
  }

  // Fallback videos (Indian textile / fashion general tutorials) if slug not matched
  const fallbackVideos = [
    { embed: "https://www.youtube.com/embed/laOpd4_3yNQ", direct: "https://www.youtube.com/watch?v=laOpd4_3yNQ" },
    { embed: "https://www.youtube.com/embed/5Gf0BNLQ1mU", direct: "https://www.youtube.com/watch?v=5Gf0BNLQ1mU" },
    { embed: "https://www.youtube.com/embed/Tl9-4MQHWFY", direct: "https://www.youtube.com/watch?v=Tl9-4MQHWFY" },
    { embed: "https://www.youtube.com/embed/FZRhBHFtMpw", direct: "https://www.youtube.com/watch?v=FZRhBHFtMpw" },
  ]
  const videos = slugVideoMap[slug] ?? fallbackVideos

  // ── Progress stored per slug so each module starts fresh independently ──────
  const storageKey = `vk-lesson-progress-${slug}`
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved) as boolean[]
    } catch { /* ignore */ }
    // Default: all lessons incomplete (fresh start)
    return Array(level.lessons.length).fill(false)
  })

  // Active lesson index — start at first incomplete, or 0
  const [activeLesson, setActiveLesson] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const arr = JSON.parse(saved) as boolean[]
        const first = arr.findIndex((c) => !c)
        return first === -1 ? arr.length - 1 : first
      }
    } catch { /* ignore */ }
    return 0
  })

  const [bookmarked, setBookmarked] = useState(false)

  // Mark active lesson complete and advance to next
  const markComplete = () => {
    const next = [...checked]
    next[activeLesson] = true
    setChecked(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    // Advance to next incomplete lesson if available
    const nextIdx = next.findIndex((c, i) => i > activeLesson && !c)
    if (nextIdx !== -1) setActiveLesson(nextIdx)
  }

  const completedCount = checked.filter(Boolean).length
  const progressPct = Math.round((completedCount / level.lessons.length) * 100)

  const currentVideo = videos[activeLesson] ?? videos[0]

  return (
    <main className="lesson-page">
      <div className="lesson-breadcrumb"><button onClick={() => navigate("progress")}>Progress</button><span>/</span><strong>Level {level.no}</strong></div>
      <section className="lesson-layout">
        <aside className="lesson-sidebar">
          <span className="kicker">LEVEL {level.no}</span><h2>{level.title}</h2>
          <div className="sidebar-progress">
            <span><b style={{ width: `${progressPct}%` }} /></span>
            <small>{progressPct}% complete</small>
          </div>
          <nav>
            {level.lessons.map((lesson, index) => (
              <button
                key={lesson}
                className={index === activeLesson ? "active" : ""}
                onClick={() => setActiveLesson(index)}
              >
                <i>{checked[index] ? <Icon name="check" size={13} /> : index + 1}</i>
                <span>
                  {lesson}
                  <small>
                    {index === activeLesson
                      ? "Current lesson"
                      : checked[index]
                      ? "Completed"
                      : "Tap to start"}
                  </small>
                </span>
              </button>
            ))}
          </nav>
        </aside>
        <div className="lesson-main">
          <div className="lesson-heading">
            <div>
              <span className="kicker">LESSON {String(activeLesson + 1).padStart(2, "0")} · 12–18 MINUTES</span>
              <h1>{level.lessons[activeLesson]}</h1>
            </div>
            <button
              className={bookmarked ? "lesson-bookmark active" : "lesson-bookmark"}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <Icon name={bookmarked ? "check" : "bookmark"} /> {bookmarked ? "Saved" : "Bookmark"}
            </button>
          </div>

          {/* Embedded YouTube player */}
          <div className="w-full h-[410px] rounded-xl overflow-hidden bg-black shadow-lg border border-[#d6ccbe] relative mb-2">
            <iframe
              key={currentVideo.embed}   /* re-mount iframe when lesson changes */
              src={currentVideo.embed}
              title={`${level.lessons[activeLesson]} — Studio Tutorial`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="flex justify-between items-center text-xs mb-6">
            <span className="text-[#666] font-medium">Integrated Studio Demonstration</span>
            <a
              href={currentVideo.direct}
              target="_blank"
              rel="noreferrer"
              className="text-[#c9513e] font-bold flex items-center gap-1 hover:underline"
            >
              Watch on YouTube ↗
            </a>
          </div>

          <div className="lesson-copy">
            <div>
              <span className="kicker">TODAY'S PRINCIPLE</span>
              <h2>Precision is a form of respect.</h2>
              <p>Accurate drafting begins by understanding the relationship between body measurements, fabric behaviour and intended ease. Follow the worked example, then apply the same logic to your own measurement set.</p>
            </div>
            <div className="formula-card"><span>ARMHOLE DEPTH</span><strong>Bust ÷ 6 + 7 cm</strong><small>Starting formula—always verify on the body.</small></div>
          </div>
          <div className="lesson-resources">
            <h3>Lesson resources</h3>
            <a href="/vastrashastra-pattern-blueprint.pdf" download><span><Icon name="ruler" /></span><div><strong>Pattern blueprint</strong><small>PDF · Printable A4 · 182 KB</small></div><b>↓</b></a>
            <a href="/measurement-worksheet.csv" download><span><Icon name="thread" /></span><div><strong>Calculation worksheet</strong><small>CSV · Editable measurement grid</small></div><b>↓</b></a>
            <a href={currentVideo.direct} target="_blank" rel="noreferrer"><span><Icon name="play" /></span><div><strong>Curated drafting masterclasses</strong><small>External video tutorials · YouTube</small></div><b>↗</b></a>
          </div>

          {checked[activeLesson] ? (
            <div className="complete-lesson" style={{ opacity: 0.6, cursor: "default", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="check" /> Lesson complete
            </div>
          ) : (
            <button className="complete-lesson" onClick={markComplete}>
              <Icon name="check" /> Mark lesson complete
            </button>
          )}
        </div>
      </section>
    </main>
  )
}


function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) }
  }
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const p = point(event)
    const context = canvasRef.current?.getContext("2d")
    if (p && context) { context.beginPath(); context.moveTo(p.x, p.y) }
  }
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const p = point(event)
    const context = canvasRef.current?.getContext("2d")
    if (p && context) { context.strokeStyle = "#b24e38"; context.lineWidth = 3; context.lineCap = "round"; context.lineTo(p.x, p.y); context.stroke() }
  }
  return <canvas ref={canvasRef} width="900" height="620" onPointerDown={start} onPointerMove={move} onPointerUp={() => drawing.current = false} onPointerLeave={() => drawing.current = false} />
}

function StudioNotes() {
  const [notes, setNotes] = useState(() => localStorage.getItem("vastra-notes") ?? "Client prefers a structured Katori blouse with a softened sweetheart neckline.\n\nFit notes:\n• Add 2 cm wearing ease at bust\n• Raise back neck by 1.5 cm\n• Test shoulder slope before cutting silk")
  const [image, setImage] = useState("")
  const [measurements, setMeasurements] = useState({ bust: 88, waist: 72, hip: 96, shoulder: 38 })
  const updateMeasure = (key: keyof typeof measurements, value: number) => setMeasurements({ ...measurements, [key]: value || 0 })
  const dart = Math.max(0, (measurements.bust - measurements.waist) / 8).toFixed(1)
  const armhole = (measurements.bust / 6 + 7).toFixed(1)
  const quarterBust = (measurements.bust / 4 + 2.5).toFixed(1)

  useEffect(() => { localStorage.setItem("vastra-notes", notes) }, [notes])

  return (
    <main className="studio-page">
      <section className="studio-heading">
        <div><span className="kicker">STUDENT STUDIO</span><h1>Sketch. Calculate. Remember.</h1><p>Your private working space for fit observations, drape studies and the small details that make a garment work.</p></div>
        <span className="autosave"><i /> Notes saved locally</span>
      </section>
      <section className="sketchbook">
        <div className="notes-pane">
          <div className="pane-title"><span>TECHNICAL NOTES</span><small>{notes.length} characters</small></div>
          <input defaultValue="Katori blouse — fitting study" aria-label="Note title" />
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} aria-label="Technical notes" />
        </div>
        <div className="canvas-pane">
          <div className="pane-title"><span>DRAPING CANVAS</span><div><button onClick={() => { const context = document.querySelector<HTMLCanvasElement>(".canvas-pane canvas")?.getContext("2d"); context?.clearRect(0, 0, 900, 620) }}>Clear</button><label>Upload reference<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setImage(URL.createObjectURL(file)) }} /></label></div></div>
          <div className="canvas-wrap">{image && <img src={image} alt="Uploaded draping reference" />}<DrawingCanvas /><span>Draw directly on the canvas · Upload a reference if needed</span></div>
        </div>
      </section>
      <section className="studio-tools">
        <div className="calculator-card" id="pattern-calculator">
          <div className="tool-heading"><span><Icon name="ruler" /></span><div><small>QUICK TOOL</small><h2>Pattern calculator</h2></div></div>
          <p>Enter body measurements in centimetres. Results are drafting starting points and should be verified through a toile.</p>
          <div className="measurement-grid">
            {(Object.keys(measurements) as Array<keyof typeof measurements>).map((key) => <label key={key}><span>{key}</span><div><input type="number" value={measurements[key]} onChange={(event) => updateMeasure(key, Number(event.target.value))} /><small>CM</small></div></label>)}
          </div>
          <div className="calculation-results"><div><span>Dart allowance</span><strong>{dart} cm</strong></div><div><span>Armhole depth</span><strong>{armhole} cm</strong></div><div><span>¼ bust + ease</span><strong>{quarterBust} cm</strong></div><div><span>Seam margin</span><strong>1.5 cm</strong></div></div>
        </div>
        <div className="resource-drawer">
          <div className="tool-heading"><span><Icon name="bookmark" /></span><div><small>PINNED DRAWER</small><h2>Saved resources</h2></div></div>
          <a href="https://www.youtube.com/results?search_query=Katori+blouse+drafting" target="_blank" rel="noreferrer"><i className="resource-thumb coral"><Icon name="play" /></i><span><strong>Katori blouse masterclass</strong><small>Video · 28 min</small></span><b>↗</b></a>
          <a href="/vastrashastra-pattern-blueprint.pdf" download><i className="resource-thumb blue"><Icon name="ruler" /></i><span><strong>Basic bodice blueprint</strong><small>PDF · A4 printable</small></span><b>↓</b></a>
          <div className="saved-palette"><span>LESSON PALETTE · AJRAKH EARTH</span><div><i /><i /><i /><i /><i /></div></div>
        </div>
      </section>
    </main>
  )
}

function ResourceLibrary({ navigate }: { navigate: (path: string) => void }) {
  const resources = [
    ["Pattern blueprints", "12 printable drafting blocks", "ruler" as IconName],
    ["Calculation sheets", "8 editable measurement tools", "thread" as IconName],
    ["Video masterclasses", "24 curated studio tutorials", "play" as IconName],
    ["Textile glossary", "86 fibres, weaves and finishes", "spark" as IconName],
  ]
  return <main className="library-page"><section className="library-hero"><span className="kicker light">RESOURCE LIBRARY</span><h1>Your working reference<br />for every <em>next step.</em></h1><p>Blueprints, worksheets and curated studio demonstrations—all organised around the way you learn and make.</p></section><section className="library-grid">{resources.map(([title, copy, icon], index) => <button key={title as string} onClick={() => index === 0 ? window.open("/vastrashastra-pattern-blueprint.pdf") : index === 1 ? window.open("/measurement-worksheet.csv") : navigate(index === 2 ? "module/blouse-drafting" : "modules")}><span>0{index + 1}</span><i><Icon name={icon as IconName} size={30} /></i><h2>{title as string}</h2><p>{copy as string}</p><b>Open collection <Icon name="arrow" /></b></button>)}</section></main>
}

function StudentProfile({ navigate }: { navigate: (path: string) => void }) {
  const moduleProgress = [88, 64, 30, 0]
  const enrolledCourses = courses.slice(0, 4)
  const stats = [
    { label: "OVERALL",  value: "42%",  sub: "Course complete" },
    { label: "STREAK",   value: "7",    sub: "Days active" },
    { label: "LESSONS",  value: "18",   sub: "of 43 done" },
    { label: "QUIZZES",  value: "8/12", sub: "Passed" },
    { label: "DRAFTS",   value: "7/18", sub: "Submitted" },
  ]

  return (
    <main className="profile-page">
      {/* ── Hero banner ── */}
      <section className="profile-hero">
        <div className="profile-avatar-xl">AS</div>
        <div className="profile-intro">
          <span className="kicker" style={{ color: "#e8b547" }}>STUDENT PROFILE</span>
          <h1>Ananya Sharma</h1>
          <p className="profile-bio">
            Fashion design student passionate about traditional Indian textiles and sustainable couture.
            Currently focusing on pattern mathematics and advanced draping techniques.
          </p>
          <div className="profile-meta">
            <span>🏙 Mumbai, India</span>
            <span>📅 Joined September 2024</span>
            <span>🎓 Intermediate learner</span>
          </div>
        </div>
        <button className="resume-button" onClick={() => navigate("progress")}>
          My learning path <Icon name="arrow" />
        </button>
      </section>

      {/* ── Stats row ── */}
      <section className="profile-stats-row">
        {stats.map((s) => (
          <div key={s.label} className="profile-stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
            <small>{s.sub}</small>
          </div>
        ))}
      </section>

      {/* ── Enrolled courses ── */}
      <section className="profile-courses">
        <div className="profile-section-heading">
          <h2>Enrolled Courses</h2>
          <button onClick={() => navigate("progress")}>
            View full roadmap <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="profile-course-grid">
          {enrolledCourses.map((course, index) => (
            <article
              key={course.slug}
              className="profile-course-card"
              style={{ "--course-accent": course.accent } as React.CSSProperties}
            >
              <div className="profile-course-img">
                <img src={course.image} alt={course.title} />
              </div>
              <div className="profile-course-body">
                <span className="kicker" style={{ color: course.accent }}>COURSE {course.no}</span>
                <h3>{course.title}</h3>
                <div className="profile-course-progress">
                  <div className="progress-track" style={{ maxWidth: "100%", margin: 0 }}>
                    <span style={{ width: `${moduleProgress[index] ?? 0}%` }} />
                  </div>
                  <small>{moduleProgress[index] ?? 0}%</small>
                </div>
                <button
                  className="profile-course-btn"
                  onClick={() => { window.location.hash = `course/${course.slug}` }}
                >
                  {(moduleProgress[index] ?? 0) > 0 ? "Continue" : "Start"} course <Icon name="arrow" size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Achievement badges ── */}
      <section className="profile-badges-section">
        <div className="profile-section-heading" style={{ padding: "0 clamp(24px,7vw,108px)", paddingBottom: 28 }}>
          <h2 style={{ color: "white" }}>Achievement Cabinet</h2>
        </div>
        <div className="badge-row" style={{ padding: "0 clamp(24px,7vw,108px) 80px" }}>
          <div className="badge-card unlocked">
            <span><Icon name="ruler" size={28} /></span>
            <strong>Master Draftsman</strong>
            <small>Measurement quiz · 90%</small>
          </div>
          <div className="badge-card unlocked gold">
            <span><Icon name="swatch" size={28} /></span>
            <strong>Color Harmony Pro</strong>
            <small>3 palettes completed</small>
          </div>
          <div className="badge-card">
            <span><Icon name="thread" size={28} /></span>
            <strong>Blouse Expert</strong>
            <small>Complete Level 03 to unlock</small>
          </div>
          <div className="badge-card">
            <span><Icon name="spark" size={28} /></span>
            <strong>Drape Architect</strong>
            <small>Complete Level 04 to unlock</small>
          </div>
        </div>
      </section>
    </main>
  )
}

function CourseDetail({ course, onBack, onNext, navigate }: { course: Course; onBack: () => void; onNext: () => void; navigate: (path: string) => void }) {
  const [openUnit, setOpenUnit] = useState(0)
  const progress = getCourseProgress(course.slug, course.units.length)
  const completedCount = progress.filter(Boolean).length
  const pct = Math.round((completedCount / course.units.length) * 100)

  return (
    <main className="course-page">
      <section className="course-hero" style={{ "--course-accent": course.accent } as React.CSSProperties}>
        <div className="course-hero-copy">
          <button className="back-link" onClick={onBack}><span>←</span> All courses</button>
          <div className="course-code">COURSE {course.no} · INTERMEDIATE</div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-facts">
            <span><strong>5</strong> studio units</span>
            <span><strong>6</strong> weeks</span>
            <span><strong>1</strong> capstone</span>
          </div>
          {/* Progress bar */}
          {pct > 0 && (
            <div className="course-progress-bar">
              <div className="progress-track" style={{ maxWidth: "100%", margin: "0 0 6px" }}>
                <span style={{ width: `${pct}%`, background: course.accent }} />
              </div>
              <small style={{ color: course.accent, fontSize: 10, fontWeight: 700 }}>{pct}% complete · {completedCount}/{course.units.length} units done</small>
            </div>
          )}
          <button className="course-enroll" style={{ background: course.accent }} onClick={() => navigate(`lesson/${course.slug}/0`)}>
            {pct > 0 ? <>Continue course <Icon name="arrow" /></> : <>Start this course <Icon name="arrow" /></>}
          </button>
        </div>
        <div className="course-hero-image">
          <img src={course.image} alt={`Visual reference for ${course.title}`} />
          <span>Photo: {course.credit} / Unsplash</span>
          <i className="course-number">{course.no}</i>
        </div>
      </section>

      <section className="course-overview">
        <div className="overview-heading">
          <span className="kicker">COURSE OVERVIEW</span>
          <h2>Tradition, understood<br /><em>through practice.</em></h2>
          <p>Each unit combines visual context, close observation and a studio exercise. Progress in sequence or revisit any lesson as a working reference.</p>
        </div>
        <div className="outcome-panel">
          <span className="panel-label">BY THE END, YOU WILL</span>
          {course.skills.map((skill) => <div className="outcome" key={skill}><i><Icon name="check" size={15} /></i><span>{skill}</span></div>)}
        </div>
      </section>

      <section className="syllabus-section">
        <div className="syllabus-intro">
          <span className="kicker">SYLLABUS</span>
          <h2>Inside the course</h2>
          <p>Five connected units move from cultural and technical foundations into applied design thinking.</p>
        </div>
        <div className="unit-list">
          {course.units.map((unit, index) => (
            <div key={unit} className={openUnit === index ? "unit-row open" : "unit-row"}>
              <button className="unit-row-header" onClick={() => setOpenUnit(openUnit === index ? -1 : index)}>
                <span className="unit-no" style={{ color: progress[index] ? "#22a06b" : undefined }}>
                  {progress[index] ? <Icon name="check" size={14} /> : `0${index + 1}`}
                </span>
                <span className="unit-main">
                  <strong>{unit}</strong>
                  <small>{index < 4 ? "Video lecture · guided analysis · studio prompt" : "Synthesis workshop · critique · portfolio"}</small>
                </span>
                <span className="unit-time">{index === 4 ? "90" : 45 + index * 10} MIN</span>
                <span className="unit-toggle">{openUnit === index ? "−" : "+"}</span>
              </button>
              {openUnit === index && (
                <div className="unit-expand">
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 14 }}>
                    {index < 4
                      ? "Watch the embedded video, review reference materials and complete the studio exercise before marking done."
                      : "Complete the synthesis workshop, submit your portfolio piece and mark this unit as done."}
                  </p>
                  <button
                    className="unit-start-btn"
                    style={{ background: course.accent }}
                    onClick={() => navigate(`lesson/${course.slug}/${index}`)}
                  >
                    {progress[index] ? "Revisit unit" : "Start unit"} <Icon name="arrow" size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="capstone-section">
        <div className="capstone-mark"><Icon name="spark" size={30} /></div>
        <div>
          <span className="kicker light">CAPSTONE PROJECT</span>
          <h2>Make knowledge visible.</h2>
        </div>
        <p>{course.project}</p>
      </section>

      <section className="next-course">
        <span>CONTINUE YOUR PATH</span>
        <button onClick={onNext}>Next course <strong>{courses[(courses.indexOf(course) + 1) % courses.length].title}</strong><Icon name="arrow" /></button>
      </section>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UnitLesson — individual unit page for any of the 6 courses
// Route: lesson/{courseSlug}/{unitIndex}
// ─────────────────────────────────────────────────────────────────────────────
function UnitLesson({ courseSlug, unitIndex, navigate }: { courseSlug: string; unitIndex: number; navigate: (path: string) => void }) {
  const course = courses.find((c) => c.slug === courseSlug) ?? courses[0]
  const vidData = COURSE_VIDEOS[course.slug] ?? COURSE_VIDEOS["history-indian-costumes"]

  const [activeUnit, setActiveUnit] = useState(Math.max(0, Math.min(unitIndex, course.units.length - 1)))
  const [progress, setProgress] = useState<boolean[]>(() => getCourseProgress(course.slug, course.units.length))
  const [bookmarked, setBookmarked] = useState(false)

  const markComplete = () => {
    const next = [...progress]
    next[activeUnit] = true
    setProgress(next)
    setCourseProgress(course.slug, next)
    // advance to next incomplete
    const nextIdx = next.findIndex((done, i) => i > activeUnit && !done)
    if (nextIdx !== -1) setActiveUnit(nextIdx)
  }

  const completedCount = progress.filter(Boolean).length
  const pct = Math.round((completedCount / course.units.length) * 100)
  const [ytId, refUrl, refTitle] = vidData[activeUnit] ?? vidData[0]

  return (
    <main className="lesson-page">
      {/* breadcrumb */}
      <div className="lesson-breadcrumb">
        <button onClick={() => navigate("progress")}>Progress</button>
        <span>/</span>
        <button onClick={() => { window.location.hash = `course/${course.slug}` }} style={{ fontWeight: 500 }}>{course.title}</button>
        <span>/</span>
        <strong>Unit {String(activeUnit + 1).padStart(2, "0")}</strong>
      </div>

      <section className="lesson-layout">
        {/* ── Sidebar ── */}
        <aside className="lesson-sidebar">
          <span className="kicker">COURSE {course.no}</span>
          <h2>{course.title}</h2>
          <div className="sidebar-progress">
            <span><b style={{ width: `${pct}%`, background: course.accent }} /></span>
            <small>{pct}% complete</small>
          </div>
          <nav>
            {course.units.map((unit, index) => (
              <button
                key={unit}
                className={index === activeUnit ? "active" : ""}
                onClick={() => setActiveUnit(index)}
              >
                <i style={{ color: progress[index] ? "#22a06b" : undefined }}>
                  {progress[index] ? <Icon name="check" size={13} /> : index + 1}
                </i>
                <span>
                  {unit}
                  <small>
                    {index === activeUnit ? "Current unit" : progress[index] ? "Completed" : "Tap to open"}
                  </small>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="lesson-main">
          <div className="lesson-heading">
            <div>
              <span className="kicker">UNIT {String(activeUnit + 1).padStart(2, "0")} · {activeUnit === 4 ? 90 : 45 + activeUnit * 10} MINUTES</span>
              <h1>{course.units[activeUnit]}</h1>
            </div>
            <button
              className={bookmarked ? "lesson-bookmark active" : "lesson-bookmark"}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <Icon name={bookmarked ? "check" : "bookmark"} /> {bookmarked ? "Saved" : "Bookmark"}
            </button>
          </div>

          {/* YouTube embed */}
          <div className="w-full h-[410px] rounded-xl overflow-hidden bg-black shadow-lg border border-[#d6ccbe] relative mb-2">
            <iframe
              key={ytId}
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
              title={`${course.units[activeUnit]} — Studio Tutorial`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="flex justify-between items-center text-xs mb-6">
            <span className="text-[#666] font-medium">Integrated Studio Demonstration</span>
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank" rel="noreferrer"
              className="text-[#c9513e] font-bold flex items-center gap-1 hover:underline"
            >
              Watch on YouTube ↗
            </a>
          </div>

          {/* Course lesson body */}
          <div className="lesson-copy">
            <div>
              <span className="kicker">UNIT REFERENCE</span>
              <h2>{course.units[activeUnit]}</h2>
              <p>Study the video above carefully. Use the reference document and resources below to deepen your understanding before completing the unit exercise and marking it done.</p>
            </div>
            <div className="formula-card" style={{ "--card-accent": course.accent } as React.CSSProperties}>
              <span>CAPSTONE NOTE</span>
              <strong style={{ fontSize: 14 }}>{course.project}</strong>
            </div>
          </div>

          {/* Resources */}
          <div className="lesson-resources">
            <h3>Unit resources</h3>
            <a href={refUrl} target="_blank" rel="noreferrer">
              <span><Icon name="spark" /></span>
              <div>
                <strong>Reference document</strong>
                <small>{refTitle}</small>
              </div>
              <b>↗</b>
            </a>
            <a href={`https://www.youtube.com/watch?v=${ytId}`} target="_blank" rel="noreferrer">
              <span><Icon name="play" /></span>
              <div>
                <strong>Watch on YouTube</strong>
                <small>{course.units[activeUnit]} — full video</small>
              </div>
              <b>↗</b>
            </a>
            <a href="/vastrashastra-pattern-blueprint.pdf" download>
              <span><Icon name="ruler" /></span>
              <div>
                <strong>Pattern blueprint</strong>
                <small>PDF · Printable A4 · 182 KB</small>
              </div>
              <b>↓</b>
            </a>
          </div>

          {/* Mark complete */}
          {progress[activeUnit] ? (
            <div className="complete-lesson" style={{ opacity: 0.55, cursor: "default", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="check" /> Unit complete
            </div>
          ) : (
            <button className="complete-lesson" onClick={markComplete}>
              <Icon name="check" /> Mark unit complete
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

// ─── Auth-aware inner App (needs AuthProvider wrapper above) ─────────────────
function AppInner() {
  const [activeModule, setActiveModule] = useState(0)
  const [palette, setPalette] = useState(0)
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const [route, setRoute] = useState(() => window.location.hash.slice(1))
  const [currentCourse, setCurrentCourse] = useState<Course | null>(() => {
    const slug = window.location.hash.replace("#course/", "")
    return courses.find((course) => course.slug === slug) ?? null
  })
  const lesson = colorLessons[palette]
  const moduleProgress = useMemo(() => [72, 34, 12, 0][activeModule], [activeModule])
  const reveal = useScrollReveal()

  // ── Auth state ──────────────────────────────────────────────────────────────
  const { user, profile, signOut, updatePlacementResult, loading: authLoading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginIntent, setLoginIntent] = useState<"start" | "generic">("generic")
  const [pendingPlacementVariant, setPendingPlacementVariant] = useState(0)
  const [showPlacementTest, setShowPlacementTest] = useState(false)

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2400)
  }

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = window.location.hash.slice(1)
      setRoute(nextRoute)
      const slug = window.location.hash.replace("#course/", "")
      setCurrentCourse(courses.find((course) => course.slug === slug) ?? null)
      window.scrollTo({ top: 0 })
      if (nextRoute === "modules") window.setTimeout(() => document.querySelector("#module-roadmap")?.scrollIntoView({ behavior: "smooth" }), 80)
      if (nextRoute === "pattern-calculator") window.setTimeout(() => document.querySelector("#pattern-calculator")?.scrollIntoView({ behavior: "smooth" }), 80)
    }
    window.addEventListener("hashchange", syncRoute)
    return () => window.removeEventListener("hashchange", syncRoute)
  }, [])

  const openCourse = (course: Course) => {
    window.location.hash = `course/${course.slug}`
  }

  const navigate = (path: string) => {
    setMenuOpen(false)
    setCurrentCourse(null)
    setRoute(path)
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: "smooth" })
    if (path === "modules") window.setTimeout(() => document.querySelector("#module-roadmap")?.scrollIntoView({ behavior: "smooth" }), 80)
    if (path === "pattern-calculator") window.setTimeout(() => document.querySelector("#pattern-calculator")?.scrollIntoView({ behavior: "smooth" }), 80)
  }

  const goHome = (section = "top") => {
    window.location.hash = section === "top" ? "" : section
    setCurrentCourse(null)
    window.setTimeout(() => document.querySelector(`#${section}`)?.scrollIntoView({ behavior: "smooth" }), 0)
  }

  // ── Placement test launch ───────────────────────────────────────────────────
  // Picks a random variant (0–5) and gates behind login
  const handleBeginJourney = () => {
    const variant = Math.floor(Math.random() * 6)
    setPendingPlacementVariant(variant)
    if (!user) {
      // Not logged in: show login first, then launch test on success
      setLoginIntent("start")
      setLoginOpen(true)
    } else {
      // Already logged in
      setShowPlacementTest(true)
    }
  }

  const handleLoginSuccess = () => {
    setLoginOpen(false)
    // If user was trying to start placement test, launch it now
    setShowPlacementTest(true)
  }

  const handlePlacementComplete = async (score: number, level: string) => {
    const path = getDefaultPath(level as "foundation" | "intermediate" | "advanced")
    await updatePlacementResult(score, level, path)
    showNotice(`Learning path generated! Level: ${level} (${score}%)`)
    setShowPlacementTest(false)
    navigate("progress")
  }

  // ── Header: auth-aware profile widget ──────────────────────────────────────
  const initials = profile?.avatarInitials ?? (user?.email?.[0]?.toUpperCase() ?? "?")
  const displayName = profile?.displayName ?? user?.email?.split("@")[0] ?? ""
  const progressPct = profile?.placementDone
    ? Math.round((profile.completedModules.length / Math.max(profile.learningPath.length, 1)) * 100)
    : 0

  return (
    <div className="app-shell">
      {notice && <div className="toast"><Icon name="check" size={16} />{notice}</div>}

      {/* Login modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        intent={loginIntent}
      />

      {/* Inline placement test overlay */}
      {showPlacementTest && (
        <div className="fixed inset-0 z-[990] bg-[#faf8f4] overflow-y-auto p-6 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 bg-white p-4 rounded-xl border border-[#ded4c3] flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c9513e]">Diagnostic Placement Assessment</span>
                <h2 className="text-xl font-serif text-[#172b2b]">Starting Assessment for Personalised Roadmap</h2>
              </div>
              <button onClick={() => setShowPlacementTest(false)} className="text-xs font-bold text-[#888] hover:text-[#172b2b]">Exit</button>
            </div>
            <PlacementTest
              testVariant={pendingPlacementVariant}
              onComplete={handlePlacementComplete}
              onCancel={() => setShowPlacementTest(false)}
            />
          </div>
        </div>
      )}

      <header className="site-header">
        <a className="brand" href="#top" aria-label="VastraKala Labs home" onClick={(event) => { event.preventDefault(); goHome() }}>
          <BrandLogo variant="header" />
          <div className="brand-text">
            <span className="brand-title">Vastra<span className="brand-highlight">Kala</span><span className="brand-sub">Labs</span></span>
            <small className="brand-tagline">The Science &amp; Soul of Indian Couture</small>
          </div>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Primary navigation">
          <a className={route === "ai-studio" ? "active" : ""} href="#ai-studio" onClick={(event) => { event.preventDefault(); navigate("ai-studio") }}>AI Studio</a>
          <a className={route === "progress" ? "active" : ""} href="#progress" onClick={(event) => { event.preventDefault(); navigate("progress") }}>Progress</a>
          <a className={route === "history" ? "active" : ""} href="#history" onClick={(event) => { event.preventDefault(); navigate("history") }}>History</a>
          <a className={route === "resources" ? "active" : ""} href="#resources" onClick={(event) => { event.preventDefault(); navigate("resources") }}>Resources</a>
        </nav>
        <div className="header-actions">
          {authLoading ? null : user ? (
            // Logged-in: show real initials + progress + sign-out option
            <div className="flex items-center gap-2">
              <button
                className="profile-widget"
                onClick={() => navigate("profile")}
                aria-label="Open student profile"
                title={displayName}
              >
                <span className="streak">{profile?.streakDays ?? 0}<small>day</small></span>
                <span className="profile-avatar">{initials}<i>{progressPct}%</i></span>
              </button>
              <button
                onClick={async () => { await signOut(); showNotice("Signed out successfully.") }}
                className="text-[11px] font-bold text-[#888] hover:text-[#c9513e] px-2 py-1 rounded-lg hover:bg-[#fdf2ee] transition-all"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            // Not logged in: Sign In button
            <button
              onClick={() => { setLoginIntent("generic"); setLoginOpen(true) }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-xl hover:bg-[#c9513e] transition-all"
            >
              Sign In
            </button>
          )}
          <button className="menu-button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button>
        </div>
      </header>

      {currentCourse ? (
        <CourseDetail
          course={currentCourse}
          onBack={() => goHome("courses")}
          onNext={() => openCourse(courses[(courses.indexOf(currentCourse) + 1) % courses.length])}
          navigate={navigate}
        />
      ) : route.startsWith("placement/") ? (
        // Legacy placement route — redirect to inline placement test
        <main className="p-6 lg:p-12 max-w-7xl mx-auto">
          <TestModeRunner
            modeId={route.replace("placement/", "")}
            isTestMode={true}
            onBack={() => goHome()}
            onNavigateToModule={(slug) => navigate(`module/${slug}`)}
          />
        </main>
      ) : route.startsWith("test/") || route.startsWith("learn/") ? (
        <main className="p-6 lg:p-12 max-w-7xl mx-auto">
          <TestModeRunner
            modeId={route.replace("test/", "").replace("learn/", "")}
            isTestMode={route.startsWith("test/")}
            onBack={() => navigate("progress")}
            onNavigateToModule={(slug) => navigate(`module/${slug}`)}
          />
        </main>
      ) : route === "ai-studio" ? (
        <main className="p-6 lg:p-12 max-w-7xl mx-auto">
          <UnifiedAIStudio />
        </main>
      ) : route === "profile" ? (
        <StudentProfile navigate={navigate} />
      ) : route === "progress" || route === "dashboard" || route === "modules" ? (
        <StudentDashboard navigate={navigate} />
      ) : route === "history" ? (
        <main className="p-6 lg:p-12 max-w-7xl mx-auto">
          <AttemptHistoryView
            onNavigateToModule={(slug) => navigate(`module/${slug}`)}
            onNavigateToMode={(mId) => navigate(`test/${mId}`)}
          />
        </main>
      ) : route === "resources" || route === "formulas" || route === "pattern-calculator" ? (
        <main className="p-6 lg:p-12 max-w-7xl mx-auto">
          <ResourceLibraryView navigate={navigate} />
        </main>
      ) : route.startsWith("lesson/") ? (
        <UnitLesson
          courseSlug={route.replace("lesson/", "").split("/")[0]}
          unitIndex={Number(route.replace("lesson/", "").split("/")[1]) || 0}
          navigate={navigate}
        />
      ) : route.startsWith("module/") ? (
        <ModuleLesson slug={route.replace("module/", "")} navigate={navigate} />
      ) : <main id="top">
        <section className="hero scroll-reveal" ref={reveal}>
          <div className="hero-pattern" aria-hidden="true" />
          <div className="hero-copy">
            <div className="eyebrow"><span>शिल्प से शैली तक</span><i /> From craft to couture</div>
            <h1>Learn the language<br />of <em>Indian fashion.</em></h1>
            <p>Master design fundamentals, pattern mathematics, colour theory and India&apos;s living textile traditions—one thoughtful lesson at a time.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={handleBeginJourney}>
                Begin your journey <Icon name="arrow" />
              </button>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><span>AK</span><span>MS</span><span>RP</span></div>
              <div><strong>2,400+ learners</strong><small>are already creating with confidence</small></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="image-frame">
              <img src="https://images.unsplash.com/photo-1640292343595-889db1c8262e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200" alt="Indian artisan weaving fabric on a traditional handloom" />
              <span className="image-credit">Photo: Akhil Pawar / Unsplash</span>
            </div>
            <div className="floating-card lesson-card">
              <span className="lesson-icon"><Icon name="ruler" /></span>
              <span><small>Now learning</small><strong>Precision measurements</strong></span>
              <span className="mini-progress"><i /></span>
            </div>
            <div className="floating-card principle-card">
              <span className="ratio">⅛</span>
              <span><strong>Measure twice.</strong><small>Cut once.</small></span>
            </div>
          </div>
        </section>

        <section className="learning-section scroll-reveal" ref={reveal} id="learn">
          <div className="section-heading">
            <div>
              <span className="kicker">YOUR LEARNING PATH</span>
              <h2>From first line to final look.</h2>
            </div>
            <p>Every module builds on the last—balancing tradition, technique and the confidence to develop your own design voice.</p>
          </div>

          <div className="module-grid">
            {modules.map((module, index) => (
              <button key={module.no} className={`module-card ${activeModule === index ? "selected" : ""}`} onClick={() => setActiveModule(index)}>
                <span className={`module-icon ${module.color}`}><Icon name={module.icon} size={25} /></span>
                <span className="module-number">{module.no}</span>
                <span className="module-title">{module.title}</span>
                <span className="module-subtitle">{module.subtitle}</span>
                <span className="module-footer"><span>{module.lessons} lessons</span><Icon name="arrow" size={18} /></span>
              </button>
            ))}
          </div>

          <div className="continue-card">
            <div className="continue-visual">
              <div className="draft-lines" aria-hidden="true"><span /><span /><span /><span /></div>
              <div className="draft-label label-a">BUST ÷ 4</div>
              <div className="draft-label label-b">+ 2.5 CM EASE</div>
            </div>
            <div className="continue-copy">
              <span className="kicker">CONTINUE LEARNING · MODULE {modules[activeModule].no}</span>
              <h3>{activeModule === 0 ? "Reading the body through proportion" : modules[activeModule].title}</h3>
              <p>{activeModule === 0 ? "Discover how simple ratios turn body measurements into balanced, wearable silhouettes." : `Continue building confidence with ${modules[activeModule].subtitle.toLowerCase()} through guided examples and practical exercises.`}</p>
              <div className="lesson-meta"><span><Icon name="clock" size={17} /> 12 min lesson</span><span>•</span><span>{moduleProgress}% complete</span></div>
              <div className="progress-track"><span style={{ width: `${moduleProgress}%` }} /></div>
              <button className="dark-button" onClick={() => navigate(`module/${activeModule === 0 ? "foundation-textile-science" : activeModule === 1 ? "precision-measurement" : activeModule === 2 ? "blouse-drafting" : "advanced-drapery"}`)}>
                Continue lesson <Icon name="arrow" size={18} />
              </button>
            </div>
            <button className={saved ? "save-button saved" : "save-button"} aria-label="Save lesson" onClick={() => setSaved(!saved)}><Icon name={saved ? "check" : "bookmark"} /></button>
          </div>
        </section>

        {/* Test Modes Showcase on Homepage */}
        <section className="p-6 lg:p-12 max-w-7xl mx-auto scroll-reveal" ref={reveal} id="test-modes">
          <div className="mb-6">
            <span className="kicker">TEST &amp; LEARNING MODES</span>
            <h2 className="text-3xl font-serif text-[#172b2b] mt-1">Pre-Assessment &amp; Continuous Testing</h2>
            <p className="text-xs text-[#666] max-w-2xl mt-1">
              Test your knowledge before or during your learning path. Each mode tests different aspects of silhouette design, skin contrast, and pattern mathematics.
            </p>
          </div>
          <ModeSelector
            onSelectMode={(mId, isTest) => navigate(`${isTest ? "test" : "learn"}/${mId}`)}
            onStartPlacement={handleBeginJourney}
          />
        </section>

        <section className="courses-section scroll-reveal" ref={reveal} id="courses">
          <div className="courses-heading">
            <div>
              <span className="kicker light">CORE INDIAN FASHION CURRICULUM</span>
              <h2>Six subjects.<br /><em>One design language.</em></h2>
            </div>
            <p>Travel from historical context to contemporary practice. Each course stands alone, while together they form a complete foundation in Indian fashion design.</p>
          </div>
          <div className="course-grid">
            {courses.map((course) => (
              <article className="course-card" style={{ "--course-accent": course.accent } as React.CSSProperties} key={course.slug}>
                <button className="course-card-hit" onClick={() => openCourse(course)} aria-label={`View ${course.title}`} />
                <div className="course-card-image"><img src={course.image} alt="" /><span>{course.no}</span></div>
                <div className="course-card-copy">
                  <span>{course.short}</span>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div>Explore course <Icon name="arrow" size={17} /></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="practice-section scroll-reveal" ref={reveal} id="practice">
          <div className="practice-copy">
            <span className="kicker light">INTERACTIVE STUDIO</span>
            <h2>Learn by doing,<br /><em>not just watching.</em></h2>
            <p>Experiment freely. Change a palette, adjust a measurement, or reconstruct a motif. Every tool makes the theory tangible.</p>
            <div className="practice-points">
              <span><i><Icon name="check" size={15} /></i>No materials needed</span>
              <span><i><Icon name="check" size={15} /></i>Instant visual feedback</span>
              <span><i><Icon name="check" size={15} /></i>Save your explorations</span>
            </div>
          </div>
          <div className="color-lab">
            <div className="lab-header">
              <span><i><Icon name="swatch" size={18} /></i> Colour harmony lab</span>
              <button onClick={() => setPalette((palette + 1) % colorLessons.length)}>Shuffle palette</button>
            </div>
            <div className="lab-canvas">
              <div className="fabric-swatch" style={{ background: `linear-gradient(135deg, ${lesson.colors[0]} 0 33%, ${lesson.colors[1]} 33% 66%, ${lesson.colors[2]} 66%)` }}>
                <span />
              </div>
              <div className="palette-info">
                <span className="lesson-count">0{palette + 1} / 03</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.body}</p>
                <div className="color-row">{lesson.colors.map((color) => <i key={color} style={{ background: color }} />)}</div>
                <div className="lab-nav">
                  <button disabled={palette === 0} onClick={() => setPalette(palette - 1)} aria-label="Previous palette"><Icon name="chevron" /></button>
                  <button disabled={palette === colorLessons.length - 1} onClick={() => setPalette(palette + 1)} aria-label="Next palette"><Icon name="chevron" /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="story-section scroll-reveal" ref={reveal} id="stories">
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1627705954911-940ac915d557?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1000" alt="Indian textile artisan surrounded by traditional fabrics" />
          </div>
          <div className="story-copy">
            <span className="kicker">TEXTILE STORIES · ODISHA</span>
            <h2>Every thread<br />holds a <em>history.</em></h2>
            <p>Go beyond technique to meet the communities, regions and ideas that give Indian textiles their soul.</p>
            <blockquote>&ldquo;Bandha is not merely a pattern. It is mathematics, memory and patience tied into every thread.&rdquo;</blockquote>
            <a className="outline-button inline-flex items-center gap-2" href="https://craftscouncilofindia.org/" target="_blank" rel="noreferrer">
              Explore Odisha Bandha <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="story-index">04<span>STATE STORIES</span></div>
        </section>
      </main>}

      <footer id="about">
        <div className="footer-brand">
          <a className="brand light-brand" href="#top">
            <BrandLogo variant="footer" />
            <div className="brand-text">
              <span className="brand-title">Vastra<span className="brand-highlight">Kala</span><span className="brand-sub" style={{ color: "#e8b547" }}>Labs</span></span>
              <small className="brand-tagline">The Science &amp; Soul of Indian Couture</small>
            </div>
          </a>
          <p>A digital school for India&apos;s fashion design language.</p>
        </div>
        <div className="footer-note"><span>VASTRAKALA LABS 2025</span><p>Fashion Design Learning Platform<br />India</p></div>
        <div className="footer-links"><a href="#ai-studio">AI Studio</a><a href="#progress">Progress</a><a href="#history">History</a><a href="#resources">Resources</a></div>
        <p className="copyright">© 2025 VastraKala Labs. Crafted with care in India.</p>
      </footer>

      {/* Stitch AI Atelier Mentor Chatbot */}
      <StitchChatbot currentRoute={route} />
    </div>
  )
}

// ─── StudentDashboard: shows auth-aware progress + wavy learning path ─────────
function StudentDashboard({ navigate }: { navigate: (path: string) => void }) {
  const { profile, user } = useAuth()
  const [openLevel, setOpenLevel] = useState(0)
  const [activeTab, setActiveTab] = useState<"path" | "roadmap">("path")

  // Static roadmap shown to guests / before placement test
  const learningLevels = [
    { no: "01", title: "Foundation & Textile Science", subtitle: "Know the material before shaping the form", progress: 0, lessons: ["Fabric grain lines", "Shrinkage mathematics", "Silk, cotton & georgette", "Traditional weave structures"] },
    { no: "02", title: "Precision Body Measurement & Math", subtitle: "Translate the body into accurate numbers", progress: 0, lessons: ["Bust and waist ratios", "Armhole depth formulas", "Salwar flare calculations", "Chudidar ease"] },
    { no: "03", title: "Blouse & Upper Garment Drafting", subtitle: "Build fitted blocks with confidence", progress: 0, lessons: ["Katori blouse block", "Princess-cut manipulation", "Boat-neck chudidar top", "Fit correction"] },
    { no: "04", title: "Advanced Saree Drapery & Fusion Silhouettes", subtitle: "Engineer movement from unstitched cloth", progress: 0, lessons: ["Pre-stitched pleat architecture", "Drape anchoring", "Motif placement grids", "Fusion silhouette lab"] },
  ]

  const hasPlaPath = profile?.placementDone && (profile?.learningPath?.length ?? 0) > 0
  const completedModules = profile?.completedModules ?? []
  const totalNodes = profile?.learningPath?.length ?? 0
  const pct = totalNodes > 0 ? Math.round((completedModules.length / totalNodes) * 100) : 0

  return (
    <main className="student-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="kicker">YOUR LEARNING STUDIO</span>
          <h1>
            {user
              ? `Namaste, ${profile?.displayName?.split(" ")[0] ?? "Designer"}.`
              : "Welcome to VastraShastra."}
          </h1>
          <p>
            {hasPlaPath
              ? `You are on the ${profile?.placementLevel} path. ${totalNodes - completedModules.length} milestones remaining.`
              : user
              ? "Complete your placement test on the homepage to generate a personalised learning path."
              : "Sign in and complete your placement test to unlock your personalised learning path."}
          </p>
        </div>
        <button className="resume-button" onClick={() => navigate("module/precision-measurement")}>
          Resume lesson <Icon name="arrow" />
        </button>
      </section>

      <section className="dashboard-stats">
        <div className="overall-card">
          <ProgressRing value={hasPlaPath ? pct : 0} label="PATH COMPLETE" />
          <div>
            <span>OVERALL JOURNEY</span>
            <h2>{hasPlaPath ? `${profile?.placementLevel?.toUpperCase()} path` : "Start your placement test"}</h2>
            <p>{hasPlaPath ? `${completedModules.length} of ${totalNodes} milestones complete` : "Take the placement test to get a personalised path"}</p>
          </div>
        </div>
        <div className="stat-card">
          <span>QUIZZES PASSED</span>
          <strong>{profile?.quizHistory?.filter(q => q.score >= 60).length ?? 0}<small>/{profile?.quizHistory?.length ?? 0}</small></strong>
          <div className="stat-bar"><i style={{ width: `${profile?.quizHistory?.length ? Math.round((profile.quizHistory.filter(q => q.score >= 60).length / profile.quizHistory.length) * 100) : 0}%` }} /></div>
          <p>Next: Textile behaviour</p>
        </div>
        <div className="stat-card">
          <span>MILESTONES DONE</span>
          <strong>{completedModules.length}<small>/{totalNodes}</small></strong>
          <div className="stat-bar amber"><i style={{ width: `${pct}%` }} /></div>
          <p>{totalNodes - completedModules.length} remaining</p>
        </div>
      </section>

      {/* Personalised learning path vs static roadmap tabs */}
      <section className="roadmap-section" id="module-roadmap">
        <div className="roadmap-heading">
          <div>
            <span className="kicker">IMMERSIVE LEARNING PATH</span>
            <h2>{hasPlaPath ? "Your personalised path" : "Your module roadmap"}</h2>
          </div>
          {hasPlaPath && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("path")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${activeTab === "path" ? "bg-[#172b2b] text-white" : "bg-[#f5f0e8] text-[#666]"}`}
              >
                Tailored Path
              </button>
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${activeTab === "roadmap" ? "bg-[#172b2b] text-white" : "bg-[#f5f0e8] text-[#666]"}`}
              >
                Module Roadmap
              </button>
            </div>
          )}
        </div>

        {hasPlaPath && activeTab === "path" ? (
          <LearningPathView
            onNavigateToModule={(slug) => navigate(`lesson/${slug}/0`)}
            onNavigateToTest={(modeId) => navigate(`test/${modeId}`)}
          />
        ) : (
          <div className="roadmap-list">
            {learningLevels.map((level, index) => (
              <React.Fragment key={level.no}>
                <article className={openLevel === index ? "roadmap-card open" : "roadmap-card"}>
                  <button className="roadmap-summary" onClick={() => setOpenLevel(openLevel === index ? -1 : index)}>
                    <span className="roadmap-no">{level.progress === 100 ? <Icon name="check" /> : level.no}</span>
                    <span className="roadmap-title"><small>LEVEL {level.no}</small><strong>{level.title}</strong><i>{level.subtitle}</i></span>
                    <span className="roadmap-progress"><span>{level.progress}%</span><i><b style={{ width: `${level.progress}%` }} /></i></span>
                    <span className="roadmap-toggle">{openLevel === index ? "−" : "+"}</span>
                  </button>
                  {openLevel === index && (
                    <div className="roadmap-content">
                      <ol>{level.lessons.map((lesson, lessonIndex) => <li key={lesson}><span>{lessonIndex + 1}</span>{lesson}</li>)}</ol>
                      <button onClick={() => navigate(`module/${index === 0 ? "foundation-textile-science" : index === 1 ? "precision-measurement" : index === 2 ? "blouse-drafting" : "advanced-drapery"}`)}>
                        {level.progress ? "Continue module" : "Preview module"} <Icon name="arrow" size={17} />
                      </button>
                    </div>
                  )}
                </article>

                {index === 0 && (
                  <div className="my-3 p-4 rounded-xl bg-[#faf6ee] border border-[#e5dccf] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#aa7917] tracking-wider block">Continuous Progress Test 01</span>
                      <strong className="text-sm font-serif text-[#172b2b]">Skin Tone Harmony Checkpoint</strong>
                      <p className="text-[11px] text-[#666]">Assess WCAG contrast ratios across 3 skin tones before unlocking Level 02.</p>
                    </div>
                    <button onClick={() => navigate("test/mode2_skin_tone")} className="px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] transition-all">Start Checkpoint →</button>
                  </div>
                )}
                {index === 1 && (
                  <div className="my-3 p-4 rounded-xl bg-[#f5eff9] border border-[#dfcee9] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#754058] tracking-wider block">Continuous Progress Test 02</span>
                      <strong className="text-sm font-serif text-[#172b2b]">Dieline Reverse Engineering Exam</strong>
                      <p className="text-[11px] text-[#666]">Verify mathematical drafting precision of armhole and dart lines vs AI reference.</p>
                    </div>
                    <button onClick={() => navigate("test/mode3_dieline_reverse")} className="px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] transition-all">Start Checkpoint →</button>
                  </div>
                )}
                {index === 2 && (
                  <div className="my-3 p-4 rounded-xl bg-[#edf5f0] border border-[#c4dcce] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#28453c] tracking-wider block">Continuous Progress Test 03</span>
                      <strong className="text-sm font-serif text-[#172b2b]">Indo-Western Blend &amp; Fusion Challenge</strong>
                      <p className="text-[11px] text-[#666]">Fuse Kanjeevaram silk weave with structured Parisian tailored architecture.</p>
                    </div>
                    <button onClick={() => navigate("test/mode4_blend_fusion")} className="px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] transition-all">Start Checkpoint →</button>
                  </div>
                )}
                {index === 3 && (
                  <>
                    <div className="my-3 p-4 rounded-xl bg-[#fef7ee] border border-[#fae2c5] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#c9513e] tracking-wider block">Continuous Progress Test 04</span>
                        <strong className="text-sm font-serif text-[#172b2b]">Speed Recognition Sprint</strong>
                        <p className="text-[11px] text-[#666]">10 rapid-fire visual garment identification questions with 60-second timer.</p>
                      </div>
                      <button onClick={() => navigate("test/mode5_speed_round")} className="px-4 py-2 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] transition-all">Start Checkpoint →</button>
                    </div>
                    <div className="my-3 p-4 rounded-xl bg-[#172b2b] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#e8b547] tracking-wider block">Final Capstone Test 05</span>
                        <strong className="text-base font-serif text-white">Comprehensive Jury Case Study</strong>
                        <p className="text-[11px] text-[#cad5cf]">Complete client portfolio evaluated across sketch, 3D fit, and dieline accuracy.</p>
                      </div>
                      <button onClick={() => navigate("test/mode6_case_study")} className="px-4 py-2 bg-[#e8b547] text-[#172b2b] text-xs font-bold rounded-lg hover:bg-[#d8a436] transition-all">Begin Capstone Jury →</button>
                    </div>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>

      <section className="achievements">
        <div className="achievement-heading"><span className="kicker light">MILESTONE BADGES</span><h2>Your craft cabinet</h2><p>Tokens mark the techniques you can confidently carry into your own practice.</p></div>
        <div className="badge-row">
          <div className={`badge-card ${completedModules.length >= 2 ? "unlocked" : ""}`}><span><Icon name="ruler" size={28} /></span><strong>Master Draftsman</strong><small>{completedModules.length >= 2 ? "Earned!" : "Complete 2 modules to unlock"}</small></div>
          <div className={`badge-card ${(profile?.quizHistory?.length ?? 0) >= 3 ? "unlocked gold" : ""}`}><span><Icon name="swatch" size={28} /></span><strong>Color Harmony Pro</strong><small>{(profile?.quizHistory?.length ?? 0) >= 3 ? "Earned!" : "Complete 3 quizzes to unlock"}</small></div>
          <div className="badge-card"><span><Icon name="thread" size={28} /></span><strong>Blouse Expert</strong><small>Complete the blouse module to unlock</small></div>
          <div className="badge-card"><span><Icon name="spark" size={28} /></span><strong>Drape Architect</strong><small>Complete Level 04 to unlock</small></div>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
