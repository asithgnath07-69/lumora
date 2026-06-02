import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Plus, Trash2, Edit3, LogOut, BookOpen, Layers,
  FileText, UploadCloud, ChevronRight, X, Check, BookMarked,
  BarChart3, Users, FolderOpen
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('classes') // classes | subjects | chapters | resources
  const [classes, setClasses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [resources, setResources] = useState([])

  const [stats, setStats] = useState({ classes: 0, subjects: 0, chapters: 0, resources: 0 })
  const [modal, setModal]   = useState(null) // null | { type, data? }
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '', description: '', classId: '', subjectId: '', chapterId: '',
    title: '', driveLink: '', thumbnailUrl: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const tid = profile.id
    const [c, s, ch, r] = await Promise.all([
      supabase.from('classes').select('*').eq('teacher_id', tid).order('created_at', { ascending: false }),
      supabase.from('subjects').select('*, classes(name)').eq('teacher_id', tid).order('created_at', { ascending: false }),
      supabase.from('chapters').select('*, subjects(name)').eq('teacher_id', tid).order('created_at', { ascending: false }),
      supabase.from('resources').select('*, chapters(name), subjects(name), classes(name)').eq('teacher_id', tid).order('created_at', { ascending: false }),
    ])
    setClasses(c.data || [])
    setSubjects(s.data || [])
    setChapters(ch.data || [])
    setResources(r.data || [])
    setStats({
      classes: c.data?.length || 0,
      subjects: s.data?.length || 0,
      chapters: ch.data?.length || 0,
      resources: r.data?.length || 0,
    })
    setLoading(false)
  }

  function openModal(type, data = null) {
    setError('')
    setForm({
      name: data?.name || '',
      description: data?.description || '',
      classId: data?.class_id || '',
      subjectId: data?.subject_id || '',
      chapterId: data?.chapter_id || '',
      title: data?.title || '',
      driveLink: data?.drive_link || '',
      thumbnailUrl: data?.thumbnail_url || '',
    })
    setModal({ type, data })
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const tid = profile.id
      const tname = profile.full_name

      if (modal.type === 'class') {
        if (!form.name.trim()) throw new Error('Class name is required')
        if (modal.data) {
          const { error } = await supabase.from('classes').update({ name: form.name, description: form.description }).eq('id', modal.data.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('classes').insert({ name: form.name, description: form.description, teacher_id: tid, teacher_name: tname })
          if (error) throw error
        }
      }

      if (modal.type === 'subject') {
        if (!form.name.trim() || !form.classId) throw new Error('Name and class are required')
        if (modal.data) {
          const { error } = await supabase.from('subjects').update({ name: form.name, class_id: form.classId }).eq('id', modal.data.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('subjects').insert({ name: form.name, class_id: form.classId, teacher_id: tid })
          if (error) throw error
        }
      }

      if (modal.type === 'chapter') {
        if (!form.name.trim() || !form.subjectId) throw new Error('Name and subject are required')
        const subj = subjects.find(s => s.id === form.subjectId)
        if (modal.data) {
          const { error } = await supabase.from('chapters').update({ name: form.name, subject_id: form.subjectId }).eq('id', modal.data.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('chapters').insert({ name: form.name, subject_id: form.subjectId, teacher_id: tid })
          if (error) throw error
        }
      }

      if (modal.type === 'resource') {
        if (!form.title.trim() || !form.driveLink.trim() || !form.chapterId) throw new Error('Title, Drive link, and chapter are required')
        const chap = chapters.find(c => c.id === form.chapterId)
        const subj = subjects.find(s => s.id === chap?.subject_id)
        if (modal.data) {
          const { error } = await supabase.from('resources').update({
            title: form.title, description: form.description,
            drive_link: form.driveLink, thumbnail_url: form.thumbnailUrl,
            chapter_id: form.chapterId, subject_id: chap?.subject_id, class_id: subj?.class_id,
          }).eq('id', modal.data.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('resources').insert({
            title: form.title, description: form.description,
            drive_link: form.driveLink, thumbnail_url: form.thumbnailUrl,
            chapter_id: form.chapterId, subject_id: chap?.subject_id, class_id: subj?.class_id,
            teacher_id: tid, teacher_name: tname,
          })
          if (error) throw error
        }
      }

      setModal(null)
      fetchAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(table, id) {
    if (!confirm('Delete this item? This may also remove related data.')) return
    await supabase.from(table).delete().eq('id', id)
    fetchAll()
  }

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  const tabItems = [
    { key: 'classes',   label: 'Classes',   icon: <BookOpen size={16} />,   count: stats.classes },
    { key: 'subjects',  label: 'Subjects',  icon: <Layers size={16} />,     count: stats.subjects },
    { key: 'chapters',  label: 'Chapters',  icon: <BookMarked size={16} />, count: stats.chapters },
    { key: 'resources', label: 'Resources', icon: <FileText size={16} />,   count: stats.resources },
  ]

  return (
    <div className="min-h-screen bg-lumora-gradient">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-purple-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lumora">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-gray-800 text-lg leading-none">Lumora</div>
              <div className="text-xs text-purple-400 font-body">Teacher Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-body text-gray-600">
              {profile?.full_name}
            </span>
            <button onClick={handleLogout} className="lumora-btn-ghost text-xs px-3 py-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { label: 'Classes',   value: stats.classes,   icon: <BookOpen size={20} />,   color: 'from-pink-400 to-rose-400' },
            { label: 'Subjects',  value: stats.subjects,  icon: <Layers size={20} />,     color: 'from-purple-400 to-pink-400' },
            { label: 'Chapters',  value: stats.chapters,  icon: <FolderOpen size={20} />, color: 'from-indigo-400 to-purple-400' },
            { label: 'Resources', value: stats.resources, icon: <FileText size={20} />,   color: 'from-blue-400 to-indigo-400' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lumora`}>
                {s.icon}
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500 font-body">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabItems.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lumora'
                  : 'bg-white/70 text-gray-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {t.icon} {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-purple-100 text-purple-600'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Add button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold text-gray-800 capitalize">{tab}</h2>
            <button
              onClick={() => openModal(tab.slice(0, -1))}
              className="lumora-btn text-sm px-4 py-2"
            >
              <Plus size={16} /> Add {tab.slice(0, -1)}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="h-4 bg-purple-100 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-purple-50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ContentGrid
              tab={tab}
              classes={classes} subjects={subjects} chapters={chapters} resources={resources}
              onEdit={(type, item) => openModal(type, item)}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <Modal
            modal={modal}
            form={form} setForm={setForm}
            classes={classes} subjects={subjects} chapters={chapters}
            error={error} saving={saving}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ContentGrid({ tab, classes, subjects, chapters, resources, onEdit, onDelete }) {
  const items = { classes, subjects, chapters, resources }[tab]

  if (!items?.length) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-purple-300" size={28} />
        </div>
        <p className="font-display text-lg font-medium text-gray-500">No {tab} yet</p>
        <p className="text-gray-400 font-body text-sm mt-1">Click "Add" to create your first {tab.slice(0,-1)}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 group hover:shadow-lumora transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-body font-semibold text-gray-800 text-sm leading-snug">
              {item.title || item.name}
            </h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(tab.slice(0,-1), item)}
                className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-400 hover:text-purple-600 transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(tab, item.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {item.description && (
            <p className="text-gray-500 text-xs font-body mb-3 line-clamp-2">{item.description}</p>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-purple-400 font-body flex-wrap">
            {item.classes?.name && <><span className="bg-pink-50 px-2 py-0.5 rounded-full">{item.classes.name}</span><ChevronRight size={10} /></>}
            {item.subjects?.name && <><span className="bg-purple-50 px-2 py-0.5 rounded-full">{item.subjects.name}</span><ChevronRight size={10} /></>}
            {item.chapters?.name && <span className="bg-indigo-50 px-2 py-0.5 rounded-full">{item.chapters.name}</span>}
          </div>

          {tab === 'resources' && item.drive_link && (
            <a
              href={item.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-body font-medium text-purple-500 hover:text-purple-700 transition-colors"
            >
              Open Drive Link <ChevronRight size={12} />
            </a>
          )}

          <div className="mt-2 text-xs text-gray-400 font-body">
            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function Modal({ modal, form, setForm, classes, subjects, chapters, error, saving, onSave, onClose }) {
  const typeLabels = { class: 'Class', subject: 'Subject', chapter: 'Chapter', resource: 'Resource' }
  const isEdit = !!modal.data

  // Filter subjects by selected class (for chapter form)
  const filteredSubjects = subjects.filter(s => !form.classId || s.class_id === form.classId)
  // Filter chapters by selected subject (for resource form)
  const filteredChapters = chapters.filter(c => !form.subjectId || c.subject_id === form.subjectId)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md glass-card p-6"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit' : 'Create'} {typeLabels[modal.type]}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Resource: class + subject + chapter selects */}
          {modal.type === 'resource' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Class</label>
                <select
                  className="lumora-input"
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value, subjectId: '', chapterId: '' }))}
                >
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
                <select
                  className="lumora-input"
                  value={form.subjectId}
                  onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, chapterId: '' }))}
                >
                  <option value="">Select subject…</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Chapter</label>
                <select
                  className="lumora-input"
                  value={form.chapterId}
                  onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))}
                >
                  <option value="">Select chapter…</option>
                  {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                <input className="lumora-input" placeholder="Resource title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea className="lumora-input resize-none" rows={2} placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Google Drive Link</label>
                <input className="lumora-input" placeholder="https://drive.google.com/…" value={form.driveLink} onChange={e => setForm(f => ({ ...f, driveLink: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Thumbnail URL (optional)</label>
                <input className="lumora-input" placeholder="https://…" value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
              </div>
            </>
          )}

          {/* Chapter: class + subject selects */}
          {modal.type === 'chapter' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Class</label>
                <select className="lumora-input" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value, subjectId: '' }))}>
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
                <select className="lumora-input" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                  <option value="">Select subject…</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Chapter Name</label>
                <input className="lumora-input" placeholder="e.g. Introduction to Algebra" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </>
          )}

          {/* Subject: class select */}
          {modal.type === 'subject' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Class</label>
                <select className="lumora-input" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject Name</label>
                <input className="lumora-input" placeholder="e.g. Mathematics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </>
          )}

          {/* Class: just name + description */}
          {modal.type === 'class' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Class Name</label>
                <input className="lumora-input" placeholder="e.g. Class 10 Science" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description (optional)</label>
                <textarea className="lumora-input resize-none" rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="lumora-btn-ghost flex-1 justify-center">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving}
            className="lumora-btn flex-1 justify-center disabled:opacity-60"
          >
            {saving ? (
              <motion.div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><Check size={16} /> {isEdit ? 'Save Changes' : 'Create'}</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
