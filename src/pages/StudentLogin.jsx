import AuthForm from '../components/AuthForm'
import { GraduationCap } from 'lucide-react'

export default function StudentLogin() {
  return (
    <AuthForm
      role="student"
      icon={<GraduationCap size={28} />}
      gradient="from-purple-400 to-indigo-500"
    />
  )
}
