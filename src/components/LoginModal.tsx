import React, { useState } from "react"
import { X, Eye, EyeOff, Loader2, LogIn, UserPlus, Scissors } from "lucide-react"
import { useAuth } from "../lib/auth"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  intent?: "start" | "generic"
}

export default function LoginModal({ isOpen, onClose, onSuccess, intent = "generic" }: LoginModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!isOpen) return null

  const reset = () => {
    setError("")
    setSuccess("")
    setEmail("")
    setPassword("")
    setName("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err.includes("Invalid") ? "Incorrect email or password." : err)
    } else {
      setSuccess("Welcome back!")
      setTimeout(() => {
        onClose()
        onSuccess?.()
      }, 800)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (name.trim().length < 2) { setError("Please enter your name (min 2 chars)."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true)
    const { error: err } = await signUp(email.trim(), password, name.trim())
    setLoading(false)
    if (err) {
      setError(err.includes("already") ? "This email is already registered. Try logging in." : err)
    } else {
      setSuccess("Account created! You can now start your journey.")
      setTimeout(() => {
        onClose()
        onSuccess?.()
      }, 1200)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", background: "rgba(23,43,43,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ded4c3] overflow-hidden"
        style={{ boxShadow: "0 30px 80px rgba(23,43,43,0.35)" }}
      >
        {/* Decorative top stripe */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #c9513e 0%, #e8b547 50%, #315c73 100%)" }} />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#172b2b] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#e8b547]" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[#c9513e] uppercase">VastraShastra</span>
            </div>
            <h2 className="text-2xl font-serif text-[#172b2b] mt-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            {intent === "start" && (
              <p className="text-xs text-[#888] mt-1 max-w-xs">
                Sign in to save your placement test results and personalised learning path.
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#f5f0e8] transition-all text-[#888] hover:text-[#172b2b]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-0 mx-6 mt-5 bg-[#f5f0e8] rounded-xl p-1">
          <button
            onClick={() => { setMode("login"); reset() }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "login" ? "bg-white text-[#172b2b] shadow-sm" : "text-[#888] hover:text-[#172b2b]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            onClick={() => { setMode("signup"); reset() }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "signup" ? "bg-white text-[#172b2b] shadow-sm" : "text-[#888] hover:text-[#172b2b]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> New Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider block mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ananya Sharma"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#faf8f4] text-[#172b2b] text-sm font-medium placeholder-[#bbb] focus:outline-none focus:border-[#c9513e] focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="designer@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#faf8f4] text-[#172b2b] text-sm font-medium placeholder-[#bbb] focus:outline-none focus:border-[#c9513e] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-[#ddd] bg-[#faf8f4] text-[#172b2b] text-sm font-medium placeholder-[#bbb] focus:outline-none focus:border-[#c9513e] focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <span className="mt-0.5">⚠</span>{error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700">
              <span className="mt-0.5">✓</span>{success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#172b2b] hover:bg-[#c9513e] text-white text-sm font-bold transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Please wait..." : mode === "login" ? "Sign In to VastraShastra" : "Create Account & Begin"}
          </button>

          {intent === "start" && mode === "login" && (
            <button
              type="button"
              onClick={() => { setMode("signup"); reset() }}
              className="w-full py-2 text-xs text-[#888] hover:text-[#c9513e] font-medium transition-all"
            >
              First time here? Create a free account →
            </button>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-[#bbb]">Your learning data is saved securely. No spam, ever.</p>
        </div>
      </div>
    </div>
  )
}
