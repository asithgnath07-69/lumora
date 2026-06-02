import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import TeacherLogin from './pages/TeacherLogin'
import StudentLogin from './pages/StudentLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentBrowse from './pages/StudentBrowse'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || !profile) return <Navigate to="/" replace />
  if (profile.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
      } />
      <Route path="/student/browse" element={
        <ProtectedRoute role="student"><StudentBrowse /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
