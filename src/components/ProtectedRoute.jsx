import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-[#475569] text-sm">Laster…</div>
      </div>
    )
  }

  if (!session) {
    const hash = window.location.hash
    const hasAuthError = hash.includes('error=')
    if (hasAuthError) {
      return <Navigate to="/login" state={{ authError: 'Innloggingslenken er utløpt eller ugyldig. Be om en ny nedenfor.' }} replace />
    }
    return <Navigate to="/login" replace />
  }

  return children
}
