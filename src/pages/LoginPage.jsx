import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { session, loading, signInWithMagicLink } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(location.state?.authError ?? '')
  const [sending, setSending] = useState(false)

  if (loading) return null
  if (session) return <Navigate to="/app" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Skriv inn e-postadressen din for å fortsette')
      document.getElementById('email-input')?.focus()
      return
    }
    setSending(true)
    try {
      await signInWithMagicLink(email.trim())
      setSubmitted(true)
    } catch (err) {
      setError('Kunne ikke sende innloggingslenke — sjekk internettforbindelsen og prøv igjen')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 w-full max-w-md text-center">
          <div className="text-4xl mb-4" aria-hidden="true">📬</div>
          <h1 className="text-xl font-bold text-[#0F172A] mb-2">Sjekk innboksen din</h1>
          <p className="text-[#475569] text-sm leading-relaxed">
            Vi har sendt en innloggingslenke til <strong>{email}</strong>.
            Klikk på lenken i e-posten for å logge inn.
          </p>
          <p className="text-xs text-[#64748B] mt-4">Kom ikke e-posten? Sjekk søppelpost-mappen.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-sm text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded"
          >
            Prøv igjen med en annen adresse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[#1E3A6B] font-bold text-lg mb-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded"
          >
            <span aria-hidden="true">📋</span>
            soknadsoversikt.no
          </a>
          <h1 className="text-xl font-bold text-[#0F172A]">Logg inn</h1>
          <p className="text-sm text-[#475569] mt-1">
            Skriv inn e-postadressen din, så sender vi deg en innloggingslenke.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1 mb-4">
            <label htmlFor="email-input" className="text-sm font-medium text-[#0F172A]">
              E-postadresse
              <span aria-hidden="true" className="text-[#DC2626] ml-0.5">*</span>
              <span className="sr-only"> (obligatorisk)</span>
            </label>
            <input
              id="email-input"
              type="email"
              name="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoComplete="email"
              spellCheck={false}
              aria-required="true"
              aria-describedby={error ? 'email-error' : undefined}
              placeholder="navn@eksempel.no"
              className={`w-full h-11 px-3 border rounded-lg text-sm text-[#0F172A] bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] ${error ? 'border-[#DC2626]' : 'border-[#7B8FA8]'}`}
            />
            {error && (
              <span id="email-error" role="alert" className="text-xs text-[#DC2626] mt-1">
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            {sending ? 'Sender…' : 'Send innloggingslenke'}
          </button>
        </form>

        <p className="text-xs text-[#64748B] text-center mt-6">
          Ingen passord. Ingen konto å opprette. Bare en lenke i innboksen.
        </p>
      </div>
    </div>
  )
}
