import AuthForm from '../components/AuthForm'
import { BookOpen } from 'lucide-react'

export default function TeacherLogin() {
  return (
    <AuthForm
      role="teacher"
      icon={<BookOpen size={28} />}
      gradient="from-pink-400 to-purple-500"
    />
  )
}
