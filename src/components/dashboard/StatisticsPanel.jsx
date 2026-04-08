import { useMemo } from 'react'
import { RESOURCES } from '../../data/resources'

const FUNNEL_STAGES = [
  { label: 'Sendt',        color: '#3B82F6' },
  { label: 'Fikk svar',    color: '#F59E0B' },
  { label: 'Intervju',     color: '#10B981' },
  { label: 'Tilbud',       color: '#8B5CF6' },
  { label: 'Fått jobben',  color: '#059669' },
]

function getISOWeek(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function formatDeadline(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / (24 * 3600 * 1000))
  if (diff === 0) return 'I dag'
  if (diff === 1) return 'I morgen'
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export default function StatisticsPanel({ hidden, counts, applications }) {
  const total = applications.length

  const { svarrate, intervjurate } = useMemo(() => {
    if (total === 0) return { svarrate: null, intervjurate: null }
    const responded = applications.filter(a => a.status !== 'Sendt' || a.outcome).length
    const hadInterview = applications.filter(a =>
      a.status === 'Intervju' || a.status === 'Tilbud' || a.outcome === 'Fått jobben'
    ).length
    return {
      svarrate: Math.round((responded / total) * 100),
      intervjurate: Math.round((hadInterview / total) * 100),
    }
  }, [applications, total])

  const funnelCounts = useMemo(() => {
    const responded = applications.filter(a => a.status !== 'Sendt' || a.outcome).length
    const interviewed = applications.filter(a =>
      a.status === 'Intervju' || a.status === 'Tilbud' || a.outcome === 'Fått jobben'
    ).length
    const offered = applications.filter(a =>
      a.status === 'Tilbud' || a.outcome === 'Fått jobben'
    ).length
    const hired = applications.filter(a => a.outcome === 'Fått jobben').length
    return [total, responded, interviewed, offered, hired]
  }, [applications, total])

  const weeklyData = useMemo(() => {
    const now = new Date()
    const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay()
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() + mondayOffset)

    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(monday.getTime() - (7 - i) * 7 * 24 * 3600 * 1000)
      const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000 - 1)
      return { start, end, count: 0, label: `V${getISOWeek(start)}` }
    })

    applications.forEach(a => {
      if (!a.applied_at) return
      const d = new Date(a.applied_at)
      const w = weeks.find(w => d >= w.start && d <= w.end)
      if (w) w.count++
    })

    return weeks
  }, [applications])

  const displayWeeks = useMemo(() => {
    const firstWithData = weeklyData.findIndex(w => w.count > 0)
    if (firstWithData === -1) return weeklyData.slice(-4)
    const start = Math.min(firstWithData, Math.max(weeklyData.length - 4, 0))
    return weeklyData.slice(start)
  }, [weeklyData])

  const maxWeekCount = Math.max(...displayWeeks.map(w => w.count), 1)

  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const in14days = new Date(now.getTime() + 14 * 24 * 3600 * 1000)
    return applications
      .filter(a => {
        if (!a.deadline || a.outcome) return false
        const d = new Date(a.deadline)
        return d >= now && d <= in14days
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }, [applications])

  return (
    <section
      id="panel-statistikk"
      role="tabpanel"
      aria-labelledby="tab-statistikk"
      hidden={hidden}
      tabIndex={0}
    >
      <h2 className="text-xl font-bold text-[#1E3A6B] mb-6">Statistikk</h2>

      {/* Kommende frister */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 mb-5">
          <p className="text-xs font-bold tracking-widest uppercase text-[#EA580C] mb-3">Frister de neste 14 dagene</p>
          <div className="flex flex-col gap-2">
            {upcomingDeadlines.map(a => {
              const d = new Date(a.deadline)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const diff = Math.round((d - today) / (24 * 3600 * 1000))
              const urgent = diff <= 2
              return (
                <div key={a.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[#0F172A] truncate block">{a.company}</span>
                    <span className="text-xs text-[#64748B] truncate block">{a.position}</span>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full ${
                    urgent
                      ? 'bg-[#FEE2E2] text-[#DC2626]'
                      : 'bg-[#FED7AA] text-[#EA580C]'
                  }`}>
                    {formatDeadline(a.deadline)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Nøkkeltall */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: 'Totalt sendt',
            value: total,
            suffix: '',
            sub: null,
            color: '#1E3A6B',
            icon: '📋',
          },
          {
            label: 'Svarrate',
            value: svarrate ?? '—',
            suffix: svarrate !== null ? '%' : '',
            sub: null,
            color: '#3B82F6',
            icon: '📬',
          },
          {
            label: 'Intervjurate',
            value: intervjurate ?? '—',
            suffix: intervjurate !== null ? '%' : '',
            sub: null,
            color: '#10B981',
            icon: '🤝',
          },
          {
            label: 'Fått jobben',
            value: counts['Fått jobben'],
            suffix: '',
            sub: null,
            color: '#059669',
            icon: '🏆',
          },
        ].map(({ label, value, suffix, sub, color, icon }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-1">
            <span className="text-base" aria-hidden="true">{icon}</span>
            <span className="text-2xl font-bold tabular-nums" style={{ color }}>
              {value}{suffix}
            </span>
            <span className="text-xs text-[#64748B] font-medium">{label}</span>
            {sub && <span className="text-[10px] text-[#94A3B8]">{sub}</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Søknader per uke */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="font-semibold text-[#0F172A] mb-1">Søknader per uke</h3>
          <p className="text-xs text-[#64748B] mb-5">Siste {displayWeeks.length} uker</p>
          {total === 0 ? (
            <p className="text-sm text-[#64748B]">Ingen søknader ennå.</p>
          ) : (
            <div aria-hidden="true">
              <div className="flex items-end gap-1.5 h-20">
                {displayWeeks.map((w, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                    <span className="text-[10px] text-[#64748B] tabular-nums leading-none font-medium">
                      {w.count > 0 ? w.count : ''}
                    </span>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${Math.max((w.count / maxWeekCount) * 64, w.count > 0 ? 4 : 2)}px`,
                        background: w.count > 0 ? '#2563EB' : '#E2E8F0',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {displayWeeks.map((w, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-[9px] text-[#94A3B8] leading-none">{w.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pipeline-funnel */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="font-semibold text-[#0F172A] mb-5">Pipeline</h3>
          {total === 0 ? (
            <p className="text-sm text-[#64748B]">Ingen søknader ennå.</p>
          ) : (
            <div className="flex flex-col gap-3" aria-hidden="true">
              {FUNNEL_STAGES.map((stage, i) => {
                const count = funnelCounts[i]
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={stage.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2 text-[#0F172A]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: stage.color }} aria-hidden="true" />
                        {stage.label}
                      </span>
                      <span className="text-[#64748B] tabular-nums">
                        {count} <span className="text-[#94A3B8]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: stage.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div>
        <p className="text-[0.75rem] font-bold tracking-widest uppercase text-[#64748B] mb-3">Kan hjelpe deg videre</p>
        <div className="flex flex-col divide-y divide-[#F1F5F9]">
          {RESOURCES.map(({ href, icon, title, desc }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener sponsored"
              className="flex items-center gap-4 py-3.5 text-inherit no-underline group"
            >
              <span className="text-xl shrink-0" aria-hidden="true">{icon}</span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{title}</span>
                <span className="block text-xs text-[#64748B] truncate">{desc}</span>
              </div>
              <span className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors text-sm shrink-0" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
