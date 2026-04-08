import { useState, useMemo } from 'react'
import ApplicationCard from '../ApplicationCard'

const STATUSES = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']

const STAT_CARDS = [
  { key: 'total',       label: 'Totalt',      color: 'border-t-[#1E3A6B]', hoverShadow: 'hover:shadow-[0_3px_10px_rgba(30,58,107,0.2)]' },
  { key: 'active',      label: 'Aktive',      color: 'border-t-[#3B82F6]', hoverShadow: 'hover:shadow-[0_3px_10px_rgba(59,130,246,0.25)]' },
  { key: 'Intervju',    label: 'Intervju',    color: 'border-t-[#10B981]', hoverShadow: 'hover:shadow-[0_3px_10px_rgba(16,185,129,0.25)]' },
  { key: 'Tilbud',      label: 'Tilbud',      color: 'border-t-[#059669]', hoverShadow: 'hover:shadow-[0_3px_10px_rgba(5,150,105,0.25)]' },
  { key: 'Fått jobben', label: 'Fått jobben', color: 'border-t-[#059669]', hoverShadow: 'hover:shadow-[0_3px_10px_rgba(5,150,105,0.25)]' },
  { key: 'Avslag',      label: 'Avslag',      color: 'border-t-[#EF4444]', hoverShadow: 'hover:shadow-[0_3px_10px_rgba(239,68,68,0.25)]' },
]

function CardSkeleton() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col gap-3 animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-[#E2E8F0] rounded w-2/3" />
          <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
        </div>
        <div className="h-5 bg-[#E2E8F0] rounded-full w-16 shrink-0" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 bg-[#F1F5F9] rounded w-20" />
        <div className="h-3 bg-[#F1F5F9] rounded w-16" />
      </div>
      <div className="flex gap-2 pt-1 border-t border-[#F1F5F9]">
        <div className="flex-1 h-8 bg-[#F1F5F9] rounded-lg" />
        <div className="flex-1 h-8 bg-[#F1F5F9] rounded-lg" />
      </div>
    </div>
  )
}

export default function ApplicationsPanel({ hidden, counts, applications, loading, error, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const showingClosed = filterStatus === 'avsluttede'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return applications.filter(a => {
      const isClosed = Boolean(a.outcome)
      if (showingClosed !== isClosed) return false
      const matchSearch = !q || a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
      const matchStatus = showingClosed || !filterStatus || a.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [applications, search, filterStatus, showingClosed])

  return (
    <section
      id="panel-soknader"
      role="tabpanel"
      aria-labelledby="tab-soknader"
      hidden={hidden}
      tabIndex={0}
    >
      {/* Statistikk-rad */}
      <section className="mb-6" aria-label="Søknadsstatistikk">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STAT_CARDS.map(({ key, label, color, hoverShadow }) => (
            <div
              key={key}
              className={`bg-white border border-[#E2E8F0] rounded-xl p-4 text-center border-t-[3px] ${color} ${hoverShadow} hover:-translate-y-0.5 transition-all duration-200`}
            >
              <span className="block text-3xl font-bold text-[#1E3A6B] leading-tight mb-1 tabular-nums">
                {counts[key] ?? 0}
              </span>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#64748B]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Verktøylinje */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-50">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" aria-hidden="true">🔍</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk på bedrift eller stilling…"
            aria-label="Søk i søknadslisten"
            autoComplete="off"
            className="w-full h-10 pl-10 pr-3 border-[1.5px] border-[#7B8FA8] rounded-lg text-sm text-[#0F172A] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]"
          />
        </div>

        <button
          onClick={onAdd}
          className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">+</span>
          Legg til søknad
        </button>
      </div>

      {/* Statusfilter */}
      <div className="flex flex-wrap items-center gap-2 mb-5" role="group" aria-label="Filtrer etter status">
        {['', ...STATUSES].map(s => (
          <button
            key={s || 'alle'}
            onClick={() => setFilterStatus(s)}
            aria-pressed={filterStatus === s}
            className={`h-11 px-3.5 rounded-full text-xs font-semibold border transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${
              filterStatus === s
                ? 'bg-[#1E3A6B] border-[#1E3A6B] text-white'
                : 'bg-white border-[#CBD5E1] text-[#475569] hover:border-[#7B8FA8] hover:text-[#0F172A]'
            }`}
          >
            {s || 'Alle'}
          </button>
        ))}

        <span className="w-px h-5 bg-[#E2E8F0]" aria-hidden="true" />

        <button
          onClick={() => setFilterStatus(showingClosed ? '' : 'avsluttede')}
          aria-pressed={showingClosed}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold border transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${
            showingClosed
              ? 'bg-[#64748B] border-[#64748B] text-white'
              : 'bg-white border-[#CBD5E1] text-[#64748B] hover:border-[#7B8FA8] hover:text-[#475569]'
          }`}
        >
          Avsluttede
        </button>
      </div>

      {/* Søknadsliste */}
      <section aria-labelledby="list-heading">
        <h2 id="list-heading" className="sr-only">Liste over søknader</h2>

        {loading ? (
          <div role="status" aria-label="Laster søknader">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3" aria-hidden="true">⚠️</p>
            <p className="font-semibold text-[#0F172A] mb-1">Kunne ikke laste søknadene</p>
            <p className="text-sm text-[#475569]">Sjekk internettforbindelsen og prøv å laste siden på nytt.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3" aria-hidden="true">📋</p>
            <p className="font-semibold text-[#0F172A] mb-1">
              {applications.length === 0 ? 'Ingen søknader ennå' : showingClosed ? 'Ingen avsluttede søknader' : 'Ingen aktive søknader'}
            </p>
            <p className="text-sm text-[#475569] mb-6">
              {applications.length === 0
                ? 'Legg til din første søknad for å komme i gang.'
                : showingClosed
                ? 'Prøv et annet søkeord eller filter.'
                : 'Alle søknader er avsluttet. Trykk «Avsluttede» for å se dem.'}
            </p>
            {applications.length === 0 && (
              <button
                onClick={onAdd}
                className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
              >
                + Legg til søknad
              </button>
            )}
          </div>
        ) : (
          <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(app => (
              <div key={app.id} role="listitem">
                <ApplicationCard
                  application={app}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
