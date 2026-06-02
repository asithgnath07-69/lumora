import { motion } from 'framer-motion'
import { Sparkles, BookOpen, GraduationCap, ArrowRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

const floatVariants = {
  animate: { y: [-8, 8, -8], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'teacher' ? '/teacher/dashboard' : '/student/browse')
    }
  }, [user, profile])

  return (
    <div className="min-h-screen bg-hero-gradient overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-lavender-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Floating sparkles */}
      {[
        { top: '15%', left: '10%', delay: 0 },
        { top: '25%', right: '12%', delay: 0.5 },
        { top: '60%', left: '5%', delay: 1 },
        { top: '70%', right: '8%', delay: 0.3 },
        { top: '40%', left: '88%', delay: 0.8 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute text-purple-300"
          style={pos}
          animate={{ rotate: 360, scale: [1, 1.3, 1] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: pos.delay }}
        >
          <Star size={i % 2 === 0 ? 16 : 12} fill="currentColor" />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.div
            className="relative mb-4"
            variants={floatVariants}
            animate="animate"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-lumora-lg">
              <Sparkles size={40} className="text-white" />
            </div>
            {/* Sparkle dots */}
            {['-top-2 -right-2', '-bottom-2 -left-2', '-top-2 left-6', 'top-6 -right-3'].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute w-3 h-3 bg-pink-300 rounded-full ${pos}`}
                animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-center leading-tight">
              Lumora
            </h1>
            <p className="text-center text-purple-500 font-body font-medium mt-1 tracking-widest text-sm uppercase">
              Smart Teaching Library
            </p>
            <p className="text-center text-purple-300 font-body text-xs mt-0.5">by AzithBuild</p>
          </motion.div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          className="text-center mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-800 leading-snug mb-4">
            Your Premium{' '}
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Academic Workspace
            </span>
          </h2>
          <p className="font-body text-gray-500 text-lg leading-relaxed">
            A beautifully crafted platform where teachers share wisdom and students discover knowledge — organised, elegant, and always within reach.
          </p>
        </motion.div>

        {/* Portal cards */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 w-full max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <PortalCard
            icon={<BookOpen size={28} />}
            title="Teacher Portal"
            desc="Create classes, upload resources & manage your library"
            gradient="from-pink-400 to-purple-500"
            bgGradient="from-pink-50 to-purple-50"
            onClick={() => navigate('/teacher/login')}
          />
          <PortalCard
            icon={<GraduationCap size={28} />}
            title="Student Portal"
            desc="Browse classes, explore subjects & access resources"
            gradient="from-purple-400 to-indigo-500"
            bgGradient="from-purple-50 to-indigo-50"
            onClick={() => navigate('/student/login')}
          />
        </motion.div>

        {/* Features */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-12 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {['Dynamic Classes', 'Google Drive Links', 'Real-time Updates', 'Elegant Design'].map(f => (
            <span key={f} className="px-4 py-1.5 rounded-full bg-white/70 border border-purple-100 text-purple-600 text-xs font-body font-medium shadow-sm">
              ✦ {f}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function PortalCard({ icon, title, desc, gradient, bgGradient, onClick }) {
  return (
    <motion.button
      className={`flex-1 glass-card p-6 text-left cursor-pointer group bg-gradient-to-br ${bgGradient} hover:shadow-lumora-lg transition-all duration-300`}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lumora group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="font-body text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
      <div className="flex items-center gap-1 text-purple-500 text-sm font-medium font-body group-hover:gap-2 transition-all">
        Enter <ArrowRight size={14} />
      </div>
    </motion.button>
  )
}
