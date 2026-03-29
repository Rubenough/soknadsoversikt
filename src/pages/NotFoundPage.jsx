import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-6" aria-hidden="true">🗺️</p>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Siden finnes ikke</h1>
        <p className="text-[#475569] text-sm leading-relaxed mb-8">
          Adressen du besøkte eksisterer ikke, eller har blitt flyttet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            Til forsiden
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center justify-center h-11 px-5 border border-[#CBD5E1] hover:border-[#7B8FA8] bg-white text-[#334155] font-medium text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            Til appen
          </Link>
        </div>
      </div>
    </div>
  )
}
