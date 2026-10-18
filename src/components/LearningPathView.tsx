import React, { useState } from "react"
import { CheckCircle2, Lock, Play, BookOpen, Zap, Award, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { LearningPathNode } from "../lib/auth"
import { useAuth } from "../lib/auth"

interface LearningPathViewProps {
  onNavigateToModule: (slug: string) => void
  onNavigateToTest: (modeId: string) => void
}

const NODE_ICONS: Record<string, React.ReactNode> = {
  module: <BookOpen className="w-4 h-4" />,
  quiz: <Zap className="w-4 h-4" />,
  test: <Play className="w-4 h-4" />,
  capstone: <Award className="w-5 h-5" />
}

const NODE_COLORS: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  completed: { bg: "#edf5f0", border: "#28a745", dot: "#28a745", text: "#1a5c2e" },
  in_progress: { bg: "#fef7ee", border: "#c9513e", dot: "#c9513e", text: "#7b2d1b" },
  unlocked: { bg: "#faf6ee", border: "#e8b547", dot: "#e8b547", text: "#7a5e00" },
  locked: { bg: "#f5f5f5", border: "#ddd", dot: "#bbb", text: "#999" }
}

const LEVEL_LABELS: Record<string, string> = {
  foundation: "Foundation Path — Building Your Craft Roots",
  intermediate: "Intermediate Path — Deepening Technical Mastery",
  advanced: "Advanced Path — Mastery & Innovation"
}

// Generates the SVG wavy tailoring-dotted path connecting nodes
function WavyPath({ count, completedCount }: { count: number; completedCount: number }) {
  const H = 100
  const W = 80
  const nodes: { x: number; y: number }[] = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? 30 : 50,
    y: i * H + 50
  }))

  let d = ""
  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i]
    const next = nodes[i + 1]
    const midY = (curr.y + next.y) / 2
    if (i === 0) d += `M ${curr.x} ${curr.y} `
    d += `C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y} `
  }

  const totalHeight = count * H + 60
  const filledLength = completedCount > 0 ? Math.round((completedCount / count) * 100) : 0

  return (
    <svg
      width={W}
      height={totalHeight}
      viewBox={`0 0 ${W} ${totalHeight}`}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#28a745" />
          <stop offset={`${filledLength}%`} stopColor="#e8b547" />
          <stop offset="100%" stopColor="#ddd" />
        </linearGradient>
      </defs>
      {/* Background dashed track — resembles tailor's chalk line */}
      <path
        d={d}
        fill="none"
        stroke="#e0d9ce"
        strokeWidth="2.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      {/* Filled progress overlay */}
      {completedCount > 0 && (
        <path
          d={d}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="3.5"
          strokeDasharray={`${filledLength * 5} 10000`}
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
      {/* Needle & thread decorations every 3 nodes */}
      {nodes.filter((_, i) => i % 3 === 1).map((node, i) => (
        <g key={i} transform={`translate(${node.x - 5}, ${node.y - 18})`}>
          <circle cx="5" cy="5" r="2.5" fill="#e8b547" opacity="0.5" />
          <line x1="5" y1="7.5" x2="5" y2="18" stroke="#e8b547" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
        </g>
      ))}
    </svg>
  )
}

export default function LearningPathView({ onNavigateToModule, onNavigateToTest }: LearningPathViewProps) {
  const { profile } = useAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!profile || profile.learningPath.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#f5f0e8] flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#c9513e]" />
        </div>
        <div>
          <h3 className="text-xl font-serif text-[#172b2b]">No Learning Path Yet</h3>
          <p className="text-sm text-[#888] mt-1">Complete the placement test on the homepage to generate your personalised path.</p>
        </div>
      </div>
    )
  }

  const path = profile.learningPath
  const completed = path.filter(n => n.status === "completed").length
  const pct = Math.round((completed / path.length) * 100)
  const currentNode = path.find(n => n.status === "unlocked" || n.status === "in_progress")

  const handleNodeClick = (node: LearningPathNode) => {
    if (node.status === "locked") return
    if (node.type === "module") {
      onNavigateToModule(node.courseSlug)
    } else if (node.testModeId) {
      onNavigateToTest(node.testModeId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="bg-[#172b2b] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547]">
            {LEVEL_LABELS[profile.placementLevel] ?? "Your Learning Path"}
          </span>
          <h2 className="text-2xl font-serif mt-0.5">
            {currentNode ? `Next: ${currentNode.title}` : "Path Complete!"}
          </h2>
          <p className="text-xs text-[#cad5cf] mt-1">
            {completed} of {path.length} milestones complete
            {profile.placementDone && ` · Placement score: ${profile.placementScore}%`}
          </p>
        </div>
        {/* Progress ring */}
        <div className="relative w-20 h-20 shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="#e8b547" strokeWidth="7"
              strokeDasharray={`${Math.round(pct * 2.138)} 213.8`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{pct}%</span>
            <span className="text-[9px] text-[#e8b547] uppercase font-bold">Done</span>
          </div>
        </div>
      </div>

      {/* Wavy path track */}
      <div className="bg-[#faf8f4] rounded-2xl border border-[#ede4d6] p-6">
        <h3 className="text-[11px] uppercase font-bold text-[#888] tracking-wider mb-6 flex items-center gap-2">
          <span>— Your Tailored Journey —</span>
        </h3>

        <div style={{ position: "relative", paddingLeft: 72 }}>
          <WavyPath count={path.length} completedCount={completed} />

          <div className="space-y-2">
            {path.map((node, idx) => {
              const colors = NODE_COLORS[node.status]
              const isExpanded = expandedId === node.id
              const isClickable = node.status !== "locked"

              return (
                <div
                  key={node.id}
                  style={{
                    marginLeft: idx % 2 === 0 ? 0 : 24,
                    marginBottom: 8
                  }}
                >
                  <div
                    className={`rounded-2xl border transition-all duration-200 ${isClickable ? "cursor-pointer hover:shadow-md" : "opacity-60"}`}
                    style={{ background: colors.bg, borderColor: colors.border, borderWidth: "1.5px" }}
                    onClick={() => isClickable && setExpandedId(isExpanded ? null : node.id)}
                  >
                    <div className="flex items-center gap-3 p-3.5">
                      {/* Status indicator dot */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ background: colors.dot + "22", color: colors.dot, border: `2px solid ${colors.dot}` }}
                      >
                        {node.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                         node.status === "locked" ? <Lock className="w-4 h-4" /> :
                         NODE_ICONS[node.type]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: colors.dot }}>
                            {node.type === "capstone" ? "CAPSTONE" : node.type === "quiz" ? "QUIZ" : node.type === "test" ? "TEST" : `MODULE ${String(idx + 1).padStart(2, "0")}`}
                          </span>
                          <span className="text-[9px] text-[#aaa]">· {node.estimatedMins} min</span>
                        </div>
                        <strong className="text-sm font-serif block text-[#172b2b] leading-tight">{node.title}</strong>
                        <span className="text-[11px] text-[#888]">{node.subtitle}</span>
                      </div>

                      {isClickable && (
                        <div className="shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#888]" /> : <ChevronDown className="w-4 h-4 text-[#888]" />}
                        </div>
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && isClickable && (
                      <div className="px-4 pb-4 pt-0 border-t border-dashed" style={{ borderColor: colors.border + "55" }}>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleNodeClick(node) }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                            style={{ background: colors.dot }}
                          >
                            {node.type === "module" ? <><BookOpen className="w-3.5 h-3.5" /> Open Module</> :
                             <><Play className="w-3.5 h-3.5" /> Start {node.type === "capstone" ? "Capstone" : "Test"}</>}
                          </button>

                          {node.youtubeUrl && (
                            <a
                              href={node.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-white hover:bg-red-50 transition-all"
                              style={{ borderColor: "#e53e3e", color: "#e53e3e" }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> YouTube
                            </a>
                          )}

                          {node.resourceUrl && (
                            <a
                              href={node.resourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-white hover:bg-[#faf6ee] transition-all"
                              style={{ borderColor: "#e8b547", color: "#7a5e00" }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Resource
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
