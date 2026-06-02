import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthForm({ role, icon, gradient }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', fullName: '', dateOfBirth: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const redirectPath = role === 'teacher' ? '/teacher/dashboard' : '/student/browse'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn({ email: form.email, password: form.password })
        if (error) throw error
        navigate(redirectPath)
      } else {
        if (!form.fullName.trim()) throw new Error('Full name is required')
        if (role === 'teacher' && !form.dateOfBirth) throw new Error('Date of birth is required')
        const { error } = await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role,
          dateOfBirth: form.dateOfBirth || null
        })
        if (error) throw error
        setError('Account created! Please check your email to confirm, then log in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-500 hover:text-purple-700 font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3 shadow-lumora`}>
              {icon}
            </div>
            <h1 className="font-display text-2xl font-semibold text-gray-800">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-purple-500 text-sm font-body mt-1 capitalize">{role} Portal · Lumora</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-purple-50 rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-body font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-start gap-2 p-3 rounded-xl text-sm font-body mb-4 ${
                  error.includes('created') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-body font-medium text-gray-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      className="lumora-input"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                  {role === 'teacher' && (
                    <div>
                      <label className="block text-xs font-body font-medium text-gray-600 mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        className="lumora-input"
                        value={form.dateOfBirth}
                        onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                className="lumora-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="lumora-input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`lumora-btn w-full justify-center bg-gradient-to-r ${gradient} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <>
                  <Sparkles size={16} />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
