import React, { useState, useEffect } from "react"
import { Clock, Award, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Trash2 } from "lucide-react"
import { getLocalAttempts, type LocalAttempt } from "../lib/db"

interface AttemptHistoryViewProps {
  onNavigateToModule?: (slug: string) => void
  onNavigateToMode?: (modeId: string) => void
}

const DEFAULT_MOCK_ATTEMPTS: LocalAttempt[] = [
  {
    id: "attempt-1",
    mode: "mode1_prompt_to_dress",
    title: "PROMPT TO DRESS CHALLENGE",
    score: 88,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    summary: "Created raw silk Banarasi silhouette for Diwali gala. Dieline accuracy 85%, Skin tone contrast CR 4.8:1.",
    details: { dielineScore: 85, selectedSkins: ["Wheatish Golden", "Medium Amber"] }
  },
  {
    id: "attempt-2",
    mode: "mode2_skin_tone",
    title: "SKIN TONE HARMONY CHALLENGE",
    score: 92,
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    summary: "Analyzed madder red & cobalt indigo ensemble against white 3D body. Flawless complementary ranking.",
    details: { selectedSkins: ["Wheatish Golden", "Light Ivory", "Deep Bronze"] }
  },
  {
    id: "attempt-3",
    mode: "mode3_dieline_reverse",
    title: "DIELINE REVERSE ENGINEERING",
    score: 74,
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    summary: "Reverse engineered fitted Katori bodice. Armhole depth deviation was 1.2 cm from standard formula.",
    details: { dielineScore: 74 }
  }
]

export default function AttemptHistoryView({ onNavigateToModule, onNavigateToMode }: AttemptHistoryViewProps) {
  const [attempts, setAttempts] = useState<LocalAttempt[]>([])

  useEffect(() => {
    getLocalAttempts()
      .then((saved) => {
        if (saved && saved.length > 0) {
          setAttempts(saved)
        } else {
          setAttempts(DEFAULT_MOCK_ATTEMPTS)
        }
      })
      .catch(() => setAttempts(DEFAULT_MOCK_ATTEMPTS))
  }, [])

  return (
    <div className="space-y-8 bg-[#fdfbf7] p-6 lg:p-10 rounded-2xl border border-[#ded8cd]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-[#e8e0d2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#28453c]">Diagnostic Learning Archive</span>
          <h2 className="text-3xl font-serif text-[#172b2b] mt-1">Student Attempt & Progress History</h2>
          <p className="text-xs text-[#666] max-w-2xl mt-1">
            Every sketch, dieline measurement check, 3D body fit session, and quiz response is logged here to guide your personalized syllabus.
          </p>
        </div>

        {onNavigateToMode && (
          <button
            onClick={() => onNavigateToMode("mode1_prompt_to_dress")}
            className="px-5 py-2.5 bg-[#c9513e] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#b04332] shadow"
          >
            Start New Test Session
          </button>
        )}
      </div>

      {/* Skill Mastery Dashboard Bar */}
      <div className="bg-[#faf7f0] p-6 rounded-xl border border-[#e5dccf]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#194b65] block mb-4">
          Competency Radar & Mastery Matrix
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {[
            { label: "Pattern Math", score: 86, color: "text-[#c9513e]" },
            { label: "Colour Theory", score: 92, color: "text-[#aa7917]" },
            { label: "Dieline Drafting", score: 76, color: "text-[#194b65]" },
            { label: "Cultural Literacy", score: 88, color: "text-[#365540]" },
            { label: "3D Digital Fitting", score: 90, color: "text-[#754058]" },
            { label: "Toile Construction", score: 68, color: "text-[#b65a36]" }
          ].map((skill, i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-[#e0d6c5] shadow-xs">
              <span className={`text-2xl font-serif font-bold block ${skill.color}`}>{skill.score}%</span>
              <span className="text-[11px] text-[#555] font-semibold mt-1 block">{skill.label}</span>
              <div className="w-full bg-[#eee] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#172b2b]" style={{ width: `${skill.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline of Attempts */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif text-[#172b2b] font-bold">Past Evaluation Sessions</h3>

        <div className="space-y-3">
          {attempts.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-[#ded8cd] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#c9513e] transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#c9513e] bg-[#fbf2f0] px-2.5 py-0.5 rounded border border-[#f5ded9]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#888] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-[#555] max-w-2xl mt-1 leading-relaxed">{item.summary}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#888] block">Accuracy</span>
                  <strong className="text-2xl font-serif text-[#172b2b]">{item.score}%</strong>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {item.score >= 80 ? "Passed" : "Review"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Focus Area */}
      <div className="bg-[#f2f7f4] border border-[#c4dcce] p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#1a5b3a] tracking-wider block">Recommended Next Milestone</span>
          <strong className="text-lg font-serif text-[#172b2b] block mt-0.5">
            Level 03: Toile Ease Calibration & Armhole Curvature
          </strong>
          <p className="text-xs text-[#555] mt-1 max-w-xl">
            Based on your recent dieline reverse attempt, focus on eliminating the 1.2 cm armhole ease discrepancy before cutting luxury silk fabrics.
          </p>
        </div>

        {onNavigateToModule && (
          <button
            onClick={() => onNavigateToModule("precision-measurement")}
            className="px-5 py-2.5 bg-[#172b2b] text-white text-xs font-bold rounded-lg hover:bg-[#c9513e] transition-all"
          >
            Resume Lesson 02 →
          </button>
        )}
      </div>
    </div>
  )
}
