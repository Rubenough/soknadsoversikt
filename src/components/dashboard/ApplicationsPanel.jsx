import { useState, useMemo } from 'react'
import ApplicationCard from '../ApplicationCard'

const STATUSES = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']
const OUTCOMES = ['Avslag', 'Fått jobben', 'Trukket søknad']

const STAT_CARDS = [
  { key: 'total',       label: 'Totalt',      color: 'border-t-[#1E3A6B]' },
  { key: 'active',      label: 'Aktive',      color: 'border-t-[#3B82F6]' },
  { key: 'Intervju',    label: 'Intervju',    color: 'border-t-[#10B981]' },
  { key: 'Tilbud',      label: 'Tilbud',      color: 'border-t-[#059669]' },
  { key: 'Fått jobben', label: 'Fått jobben', color: 'border-t-[#059669]' },
  { key: 'Avslag',      label: 'Avslag',      color: 'border-t-[#EF4444]' },
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return applications.filter(a => {
      const matchSearch = !q || a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
      const matchStatus = !filterStatus || a.status === filterStatus || a.outcome === filterStatus
      return matchSearch && matchStatus
    })
  }, [applications, search, filterStatus])

  return (
    <section
      id="panel-soknader"
      role="tabpanel"
      aria-labelledby="tab-soknader"
      hidden={hidden}
      tabIndex={0}
    >
      {/* Statistikk-rad */}
      <div className="mb-6" aria-label="Søknadsstatistikk">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STAT_CARDS.map(({ key, label, color }) => (
            <div
              key={key}
              className={`bg-white border border-[#E2E8F0] rounded-xl p-4 text-center border-t-[3px] ${color} hover:shadow-md transition-shadow`}
            >
              <span className="block text-3xl font-bold text-[#1E3A6B] leading-none mb-1 tabular-nums">
                {counts[key] ?? 0}
              </span>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#64748B]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Verktøylinje */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
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

        <div>
          <label htmlFor="filter-status" className="sr-only">Filtrer etter status</label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-10 pl-3 pr-8 border-[1.5px] border-[#7B8FA8] rounded-lg text-sm text-[#0F172A] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] cursor-pointer"
          >
            <option value="">Alle</option>
            <optgroup label="Status">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <optgroup label="Utfall">
              {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
            </optgroup>
          </select>
        </div>

        <button
          onClick={onAdd}
          aria-label="Legg til ny søknad"
          className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">+</span>
          Legg til søknad
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
              {applications.length === 0 ? 'Ingen søknader ennå' : 'Ingen treff'}
            </p>
            <p className="text-sm text-[#475569] mb-6">
              {applications.length === 0
                ? 'Legg til din første søknad for å komme i gang.'
                : 'Prøv et annet søkeord eller filter.'}
            </p>
            {applications.length === 0 && (
              <button
                onClick={onAdd}
                className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
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
