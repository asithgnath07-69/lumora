import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, BookOpen, Layers, BookMarked, FileText,
  ChevronRight, ExternalLink, LogOut, ArrowLeft, Search
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function StudentBrowse() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  // Navigation state
  const [step, setStep] = useState('classes') // classes | subjects | chapters | resources
  const [selectedClass, setSelectedClass]     = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)

  const [classes, setClasses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchClasses() }, [])

  async function fetchClasses() {
    setLoading(true)
    // Only show classes that have at least one resource
    const { data: res } = await supabase.from('resources').select('class_id')
    const classIds = [...new Set((res || []).map(r => r.class_id))]
    if (!classIds.length) { setClasses([]); setLoading(false); return }
    const { data } = await supabase.from('classes').select('*').in('id', classIds).order('name')
    setClasses(data || [])
    setLoading(false)
  }

  async function selectClass(cls) {
    setSelectedClass(cls)
    setLoading(true)
    // Only subjects with resources
    const { data: res } = await supabase.from('resources').select('subject_id').eq('class_id', cls.id)
    const ids = [...new Set((res || []).map(r => r.subject_id))]
    if (!ids.length) { setSubjects([]); setStep('subjects'); setLoading(false); return }
    const { data } = await supabase.from('subjects').select('*').in('id', ids).order('name')
    setSubjects(data || [])
    setStep('subjects')
    setLoading(false)
    setSearch('')
  }

  async function selectSubject(subj) {
    setSelectedSubject(subj)
    setLoading(true)
    const { data: res } = await supabase.from('resources').select('chapter_id').eq('subject_id', subj.id)
    const ids = [...new Set((res || []).map(r => r.chapter_id))]
    if (!ids.length) { setChapters([]); setStep('chapters'); setLoading(false); return }
    const { data } = await supabase.from('chapters').select('*').in('id', ids).order('name')
    setChapters(data || [])
    setStep('chapters')
    setLoading(false)
    setSearch('')
  }

  async function selectChapter(chap) {
    setSelectedChapter(chap)
    setLoading(true)
    const { data } = await supabase.from('resources').select('*').eq('chapter_id', chap.id).order('created_at', { ascending: false })
    setResources(data || [])
    setStep('resources')
    setLoading(false)
    setSearch('')
  }

  function goBack() {
    if (step === 'subjects') { setStep('classes'); setSelectedClass(null) }
    if (step === 'chapters') { setStep('subjects'); setSelectedSubject(null) }
    if (step === 'resources') { setStep('chapters'); setSelectedChapter(null) }
    setSearch('')
  }

  const stepConfig = {
    classes:   { label: 'Choose a Class',   icon: <BookOpen size={20} />,    color: 'from-pink-400 to-rose-400' },
    subjects:  { label: 'Choose a Subject', icon: <Layers size={20} />,      color: 'from-purple-400 to-pink-400' },
    chapters:  { label: 'Choose a Chapter', icon: <BookMarked size={20} />,  color: 'from-indigo-400 to-purple-400' },
    resources: { label: 'Resources',        icon: <FileText size={20} />,    color: 'from-blue-400 to-indigo-400' },
  }

  const activeList = { classes, subjects, chapters, resources }[step]
  const filtered = (activeList || []).filter(item =>
    (item.name || item.title || '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-lumora-gradient">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-purple-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lumora">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-gray-800 text-lg leading-none">Lumora</div>
              <div className="text-xs text-purple-400 font-body">Student Library</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-body text-gray-600">{profile?.full_name}</span>
            <button onClick={handleLogout} className="lumora-btn-ghost text-xs px-3 py-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <motion.div
          className="flex items-center gap-2 text-sm font-body text-purple-400 mb-6 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[
            { key: 'classes', label: 'Classes' },
            selectedClass && { key: 'subjects', label: selectedClass.name },
            selectedSubject && { key: 'chapters', label: selectedSubject.name },
            selectedChapter && { key: 'resources', label: selectedChapter.name },
          ].filter(Boolean).map((crumb, i, arr) => (
            <span key={crumb.key} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={14} className="text-purple-300" />}
              <span className={i === arr.length - 1 ? 'text-purple-700 font-medium' : 'text-purple-400'}>
                {crumb.label}
              </span>
            </span>
          ))}
        </motion.div>

        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          {step !== 'classes' && (
            <button
              onClick={goBack}
              className="p-2 rounded-xl hover:bg-purple-50 text-purple-400 hover:text-purple-700 border border-purple-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stepConfig[step].color} flex items-center justify-center text-white shadow-lumora`}>
            {stepConfig[step].icon}
          </div>
          <h2 className="font-display text-xl font-semibold text-gray-800">{stepConfig[step].label}</h2>
        </div>

        {/* Search */}
        {(activeList?.length || 0) > 4 && (
          <div className="relative mb-5">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300" />
            <input
              type="text"
              className="lumora-input pl-10"
              placeholder={`Search ${step}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step + (selectedClass?.id || '') + (selectedSubject?.id || '') + (selectedChapter?.id || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-4 bg-purple-100 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-purple-50 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState step={step} />
            ) : step === 'resources' ? (
              <ResourceGrid resources={filtered} />
            ) : (
              <ItemGrid
                items={filtered}
                step={step}
                onSelect={step === 'classes' ? selectClass : step === 'subjects' ? selectSubject : selectChapter}
                colorMap={{ classes: 'from-pink-400 to-rose-400', subjects: 'from-purple-400 to-pink-400', chapters: 'from-indigo-400 to-purple-400' }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function ItemGrid({ items, step, onSelect, colorMap }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          className="glass-card p-5 text-left group hover:shadow-lumora transition-all duration-200 w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          onClick={() => onSelect(item)}
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[step]} flex items-center justify-center text-white mb-3 shadow-lumora group-hover:scale-110 transition-transform`}>
            {step === 'classes' ? <BookOpen size={18} /> : step === 'subjects' ? <Layers size={18} /> : <BookMarked size={18} />}
          </div>
          <h3 className="font-body font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
          {item.description && <p className="text-gray-500 text-xs font-body line-clamp-2 mb-2">{item.description}</p>}
          <div className="flex items-center gap-1 text-purple-400 text-xs font-body group-hover:gap-2 transition-all">
            Explore <ChevronRight size={12} />
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function ResourceGrid({ resources }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {resources.map((r, i) => (
        <motion.div
          key={r.id}
          className="glass-card p-5 group hover:shadow-lumora transition-all duration-200"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
        >
          {r.thumbnail_url && (
            <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-purple-50">
              <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white flex-shrink-0 shadow-lumora">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-body font-semibold text-gray-800 text-sm mb-1 leading-snug">{r.title}</h3>
              {r.description && <p className="text-gray-500 text-xs font-body line-clamp-2 mb-2">{r.description}</p>}
              <p className="text-purple-300 text-xs font-body">by {r.teacher_name}</p>
            </div>
          </div>
          <a
            href={r.drive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-xs font-body font-medium shadow-lumora hover:shadow-lumora-lg hover:scale-[1.02] transition-all duration-200"
          >
            <ExternalLink size={14} /> Open Resource
          </a>
        </motion.div>
      ))}
    </div>
  )
}

function EmptyState({ step }) {
  return (
    <motion.div
      className="glass-card p-16 text-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="text-purple-300" size={32} />
      </motion.div>
      <p className="font-display text-xl font-semibold text-gray-500 mb-2">Nothing here yet</p>
      <p className="text-gray-400 font-body text-sm">
        {step === 'resources'
          ? 'No resources have been uploaded for this chapter yet.'
          : `No ${step} are available right now.`}
      </p>
    </motion.div>
  )
}
