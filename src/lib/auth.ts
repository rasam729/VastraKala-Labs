import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"
import type { User, Session } from "@supabase/supabase-js"

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  displayName: string
  avatarInitials: string
  placementDone: boolean
  placementScore: number
  placementLevel: "foundation" | "intermediate" | "advanced"
  learningPath: LearningPathNode[]
  streakDays: number
  completedModules: string[]
  quizHistory: QuizAttempt[]
}

export interface LearningPathNode {
  id: string
  type: "module" | "quiz" | "test" | "capstone"
  title: string
  subtitle: string
  courseSlug: string
  status: "locked" | "unlocked" | "in_progress" | "completed"
  order: number
  estimatedMins: number
  resourceUrl?: string
  youtubeUrl?: string
  testModeId?: string
}

export interface QuizAttempt {
  id: string
  testType: string
  score: number
  completedAt: string
  details?: Record<string, unknown>
}

export interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updatePlacementResult: (score: number, level: string, path: LearningPathNode[]) => Promise<void>
  markModuleComplete: (moduleId: string) => Promise<void>
  saveQuizAttempt: (attempt: Omit<QuizAttempt, "id">) => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  updatePlacementResult: async () => {},
  markModuleComplete: async () => {},
  saveQuizAttempt: async () => {}
})

export const useAuth = () => useContext(AuthContext)

// ─── Default learning path for "foundation" level ───────────────────────────
export const FOUNDATION_PATH: LearningPathNode[] = [
  {
    id: "m-hist-1", type: "module", order: 1,
    title: "Vedic & Classical Dress", subtitle: "History of Indian Costumes · Unit 1",
    courseSlug: "history-indian-costumes", status: "unlocked", estimatedMins: 25,
    youtubeUrl: "https://www.youtube.com/watch?v=ixXKYSklJb8",
    resourceUrl: "https://www.museumsofindia.org/museum/197/national-museum"
  },
  {
    id: "m-hist-2", type: "module", order: 2,
    title: "Mughal Courtly Attire", subtitle: "History of Indian Costumes · Unit 2",
    courseSlug: "history-indian-costumes", status: "locked", estimatedMins: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=a2aQ5HdkGDs",
    resourceUrl: "https://www.britishmuseum.org/collection"
  },
  {
    id: "quiz-hist-1", type: "quiz", order: 3,
    title: "Costume History Checkpoint", subtitle: "Test your knowledge of Indian dress history",
    courseSlug: "history-indian-costumes", status: "locked", estimatedMins: 10,
    testModeId: "mode5_speed_round"
  },
  {
    id: "m-text-1", type: "module", order: 4,
    title: "Fibre to Yarn", subtitle: "Traditional Indian Textiles · Unit 1",
    courseSlug: "traditional-indian-textiles", status: "locked", estimatedMins: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=q4hR7cGVmAQ",
    resourceUrl: "https://handloom.nic.in/resources"
  },
  {
    id: "m-text-2", type: "module", order: 5,
    title: "Banarasi & Kanjeevaram", subtitle: "Traditional Indian Textiles · Unit 2",
    courseSlug: "traditional-indian-textiles", status: "locked", estimatedMins: 35,
    youtubeUrl: "https://www.youtube.com/watch?v=TFcnRgMlBuY",
    resourceUrl: "https://weavesofbanaras.com/"
  },
  {
    id: "m-text-3", type: "module", order: 6,
    title: "Ikat & Bandhani Resist", subtitle: "Traditional Indian Textiles · Unit 3",
    courseSlug: "traditional-indian-textiles", status: "locked", estimatedMins: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=Gb_hb1GlnRs",
    resourceUrl: "https://craftscouncilofindia.org/"
  },
  {
    id: "quiz-text-1", type: "quiz", order: 7,
    title: "Textile Science Quiz", subtitle: "Identify weaves, fibres & dye systems",
    courseSlug: "traditional-indian-textiles", status: "locked", estimatedMins: 12,
    testModeId: "mode2_skin_tone"
  },
  {
    id: "m-surf-1", type: "module", order: 8,
    title: "Zardozi Relief", subtitle: "Surface Ornamentation · Unit 1",
    courseSlug: "surface-ornamentation", status: "locked", estimatedMins: 40,
    youtubeUrl: "https://www.youtube.com/watch?v=0Fg0tFqmRFk",
    resourceUrl: "https://www.craftmark.org/"
  },
  {
    id: "m-pat-1", type: "module", order: 9,
    title: "Indian Body Measurements", subtitle: "Ethnic Pattern Making · Unit 1",
    courseSlug: "ethnic-pattern-making", status: "locked", estimatedMins: 35,
    youtubeUrl: "https://www.youtube.com/watch?v=n0EFxVGFR3w",
    resourceUrl: "https://niftindia.ac.in/publications"
  },
  {
    id: "m-pat-2", type: "module", order: 10,
    title: "Kurta Blocks", subtitle: "Ethnic Pattern Making · Unit 2",
    courseSlug: "ethnic-pattern-making", status: "locked", estimatedMins: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=sVLicV3GCFA",
    resourceUrl: "https://www.youtube.com/results?search_query=kurta+pattern+drafting"
  },
  {
    id: "quiz-pat-1", type: "test", order: 11,
    title: "Dieline Reverse Engineering", subtitle: "Draft a cut pattern from a reference image",
    courseSlug: "ethnic-pattern-making", status: "locked", estimatedMins: 20,
    testModeId: "mode3_dieline_reverse"
  },
  {
    id: "m-sar-1", type: "module", order: 12,
    title: "Classic Nivi Drape", subtitle: "Advanced Saree Draping · Unit 2",
    courseSlug: "saree-draping", status: "locked", estimatedMins: 40,
    youtubeUrl: "https://www.youtube.com/watch?v=0SQN_wlC5_U",
    resourceUrl: "https://www.sareesofmysoul.com/"
  },
  {
    id: "m-sust-1", type: "module", order: 13,
    title: "Ethical Field Research", subtitle: "Craft Cluster & Sustainability · Unit 1",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=HmGAfqlWZqw",
    resourceUrl: "https://www.fairtrade.net/"
  },
  {
    id: "capstone", type: "capstone", order: 14,
    title: "Comprehensive Jury Case Study", subtitle: "Final Capstone · Full Portfolio",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 90,
    testModeId: "mode6_case_study"
  }
]

export const INTERMEDIATE_PATH: LearningPathNode[] = [
  {
    id: "m-pat-katori", type: "module", order: 1,
    title: "Katori Blouse Block", subtitle: "Ethnic Pattern Making · Unit 3",
    courseSlug: "ethnic-pattern-making", status: "unlocked", estimatedMins: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=sVLicV3GCFA",
    resourceUrl: "https://niftindia.ac.in/publications"
  },
  {
    id: "m-pat-prince", type: "module", order: 2,
    title: "Princess-Cut Manipulation", subtitle: "Ethnic Pattern Making · Unit 3b",
    courseSlug: "ethnic-pattern-making", status: "locked", estimatedMins: 50,
    youtubeUrl: "https://www.youtube.com/watch?v=vGOxZIiOX2U",
    resourceUrl: "https://www.youtube.com/results?search_query=princess+cut+blouse+drafting"
  },
  {
    id: "quiz-pat-blend", type: "test", order: 3,
    title: "Indo-Western Blend Challenge", subtitle: "Fuse two textile traditions",
    courseSlug: "ethnic-pattern-making", status: "locked", estimatedMins: 25,
    testModeId: "mode4_blend_fusion"
  },
  {
    id: "m-surf-kantha", type: "module", order: 4,
    title: "Phulkari & Kantha", subtitle: "Surface Ornamentation · Unit 4",
    courseSlug: "surface-ornamentation", status: "locked", estimatedMins: 40,
    youtubeUrl: "https://www.youtube.com/watch?v=G_RyKcpVioM",
    resourceUrl: "https://www.craftmark.org/"
  },
  {
    id: "m-sar-pleat", type: "module", order: 5,
    title: "Pleat Engineering", subtitle: "Advanced Saree Draping · Unit 4",
    courseSlug: "saree-draping", status: "locked", estimatedMins: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=0SQN_wlC5_U",
    resourceUrl: "https://www.sareesofmysoul.com/"
  },
  {
    id: "quiz-prompt", type: "test", order: 6,
    title: "Prompt-to-Dress Challenge", subtitle: "Brief → Sketch → 3D Garment → Dieline",
    courseSlug: "surface-ornamentation", status: "locked", estimatedMins: 30,
    testModeId: "mode1_prompt_to_dress"
  },
  {
    id: "m-sust-circ", type: "module", order: 7,
    title: "Circular Material Systems", subtitle: "Craft Cluster & Sustainability · Unit 4",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=HmGAfqlWZqw",
    resourceUrl: "https://www.fairtrade.net/"
  },
  {
    id: "capstone", type: "capstone", order: 8,
    title: "Comprehensive Jury Case Study", subtitle: "Final Capstone · Full Portfolio",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 90,
    testModeId: "mode6_case_study"
  }
]

export const ADVANCED_PATH: LearningPathNode[] = [
  {
    id: "m-adv-sherwani", type: "module", order: 1,
    title: "Sherwani Structure", subtitle: "Ethnic Pattern Making · Unit 5",
    courseSlug: "ethnic-pattern-making", status: "unlocked", estimatedMins: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=n0EFxVGFR3w",
    resourceUrl: "https://niftindia.ac.in/publications"
  },
  {
    id: "m-adv-drape", type: "module", order: 2,
    title: "Fusion Form Development", subtitle: "Advanced Saree Draping · Unit 5",
    courseSlug: "saree-draping", status: "locked", estimatedMins: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=0SQN_wlC5_U",
    resourceUrl: "https://www.sareesofmysoul.com/"
  },
  {
    id: "quiz-adv-blend", type: "test", order: 3,
    title: "Advanced Fusion Challenge", subtitle: "Engineer a hybrid silhouette",
    courseSlug: "saree-draping", status: "locked", estimatedMins: 30,
    testModeId: "mode4_blend_fusion"
  },
  {
    id: "m-adv-enterprise", type: "module", order: 4,
    title: "Collection & Market Strategy", subtitle: "Craft Cluster & Sustainability · Unit 5",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=HmGAfqlWZqw",
    resourceUrl: "https://www.investindia.gov.in/sector/textiles-apparel"
  },
  {
    id: "quiz-adv-speed", type: "test", order: 5,
    title: "Speed Recognition Sprint", subtitle: "10 rapid-fire garment identification questions",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 10,
    testModeId: "mode5_speed_round"
  },
  {
    id: "capstone", type: "capstone", order: 6,
    title: "Comprehensive Jury Case Study", subtitle: "Final Capstone · Full Portfolio",
    courseSlug: "craft-sustainability", status: "locked", estimatedMins: 90,
    testModeId: "mode6_case_study"
  }
]

export function getDefaultPath(level: "foundation" | "intermediate" | "advanced"): LearningPathNode[] {
  if (level === "advanced") return ADVANCED_PATH
  if (level === "intermediate") return INTERMEDIATE_PATH
  return FOUNDATION_PATH
}

// ─── Save helpers (store in Supabase if available, else localStorage) ────────
const LS_KEY = "vastrashastra_profile"

function savePersisted(profile: UserProfile) {
  localStorage.setItem(LS_KEY + "_" + profile.id, JSON.stringify(profile))
}

function loadPersisted(userId: string): Partial<UserProfile> | null {
  try {
    const raw = localStorage.getItem(LS_KEY + "_" + userId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const buildProfile = (u: User, extra?: Partial<UserProfile>): UserProfile => {
    const persisted = loadPersisted(u.id) ?? {}
    const displayName = extra?.displayName ?? persisted.displayName ?? (u.user_metadata?.display_name as string) ?? u.email?.split("@")[0] ?? "Designer"
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    return {
      id: u.id,
      email: u.email ?? "",
      displayName,
      avatarInitials: initials,
      placementDone: false,
      placementScore: 0,
      placementLevel: "foundation",
      learningPath: [],
      streakDays: 0,
      completedModules: [],
      quizHistory: [],
      ...persisted,
      ...extra
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    // Try Supabase first
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      if (data) {
        const p: UserProfile = {
          id: user.id,
          email: user.email ?? "",
          displayName: data.display_name ?? user.email?.split("@")[0] ?? "Designer",
          avatarInitials: (data.display_name ?? "D").slice(0, 2).toUpperCase(),
          placementDone: data.placement_done ?? false,
          placementScore: data.placement_score ?? 0,
          placementLevel: data.placement_level ?? "foundation",
          learningPath: data.learning_path ?? [],
          streakDays: data.streak_days ?? 0,
          completedModules: data.completed_modules ?? [],
          quizHistory: data.quiz_history ?? []
        }
        setProfile(p)
        savePersisted(p)
        return
      }
    } catch {
      // Fall back to localStorage
    }
    const p = buildProfile(user)
    setProfile(p)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        const p = buildProfile(s.user)
        setProfile(p)
        refreshProfile()
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        const p = buildProfile(s.user)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: name } }
    })
    if (error) return { error: error.message }
    if (data.user) {
      // Create profile row
      try {
        await supabase.from("user_profiles").upsert({
          id: data.user.id,
          display_name: name,
          placement_done: false,
          placement_score: 0,
          placement_level: "foundation",
          learning_path: [],
          streak_days: 0,
          completed_modules: [],
          quiz_history: []
        })
      } catch { /* ok */ }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const updatePlacementResult = async (score: number, level: string, path: LearningPathNode[]) => {
    if (!user || !profile) return
    const updated: UserProfile = { ...profile, placementDone: true, placementScore: score, placementLevel: level as any, learningPath: path }
    setProfile(updated)
    savePersisted(updated)
    try {
      await supabase.from("user_profiles").upsert({
        id: user.id,
        placement_done: true,
        placement_score: score,
        placement_level: level,
        learning_path: path,
        display_name: profile.displayName,
        streak_days: profile.streakDays,
        completed_modules: profile.completedModules,
        quiz_history: profile.quizHistory
      })
    } catch { /* ok */ }
  }

  const markModuleComplete = async (moduleId: string) => {
    if (!user || !profile) return
    if (profile.completedModules.includes(moduleId)) return
    const completedModules = [...profile.completedModules, moduleId]
    const learningPath = profile.learningPath.map((node, idx) => {
      if (node.id === moduleId) return { ...node, status: "completed" as const }
      const prevCompleted = profile.learningPath.slice(0, idx).every(n => completedModules.includes(n.id) || n.status === "completed")
      if (prevCompleted && node.status === "locked") return { ...node, status: "unlocked" as const }
      return node
    })
    const updated: UserProfile = { ...profile, completedModules, learningPath }
    setProfile(updated)
    savePersisted(updated)
    try {
      await supabase.from("user_profiles").upsert({
        id: user.id,
        completed_modules: completedModules,
        learning_path: learningPath,
        display_name: profile.displayName,
        streak_days: profile.streakDays,
        placement_done: profile.placementDone,
        placement_score: profile.placementScore,
        placement_level: profile.placementLevel,
        quiz_history: profile.quizHistory
      })
    } catch { /* ok */ }
  }

  const saveQuizAttempt = async (attempt: Omit<QuizAttempt, "id">) => {
    if (!user || !profile) return
    const full: QuizAttempt = { ...attempt, id: "qa-" + Date.now() }
    const quizHistory = [full, ...profile.quizHistory].slice(0, 100)
    const updated: UserProfile = { ...profile, quizHistory }
    setProfile(updated)
    savePersisted(updated)
    try {
      await supabase.from("user_profiles").upsert({
        id: user.id,
        quiz_history: quizHistory,
        display_name: profile.displayName,
        streak_days: profile.streakDays,
        placement_done: profile.placementDone,
        placement_score: profile.placementScore,
        placement_level: profile.placementLevel,
        completed_modules: profile.completedModules,
        learning_path: profile.learningPath
      })
    } catch { /* ok */ }
  }

  const value: AuthContextValue = {
    user, session, profile, loading,
    signIn, signUp, signOut,
    refreshProfile, updatePlacementResult,
    markModuleComplete, saveQuizAttempt
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}
