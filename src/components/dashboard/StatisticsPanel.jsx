import { useMemo } from 'react'

const OUTCOME_COLOR = {
  'Avslag':         '#EF4444',
  'Fått jobben':    '#059669',
  'Trukket søknad': '#94A3B8',
}
const OUTCOMES = ['Avslag', 'Fått jobben', 'Trukket søknad']

const TIPS = [
  { href: 'https://www.kickresume.com/', icon: '📄', title: 'Kickresume', desc: 'Profesjonelle CV-maler som skiller seg ut og kommer gjennom ATS-filtre.' },
  { href: 'https://www.linkedin.com/premium/', icon: '💼', title: 'LinkedIn Premium', desc: 'Se hvem som har sett profilen din og ta kontakt med rekrutterere direkte.' },
  { href: 'https://www.udemy.com/', icon: '🎓', title: 'Udemy', desc: 'Lær nye ferdigheter som styrker søknaden — over 200 000 kurs tilgjengelig.' },
]

function getISOWeek(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

export default function StatisticsPanel({ hidden, counts, applications }) {
  const { svarrate, intervjurate } = useMemo(() => {
    const total = applications.length
    if (total === 0) return { svarrate: null, intervjurate: null }
    const responded = applications.filter(a => a.status !== 'Sendt' || a.outcome).length
    const hadInterview = applications.filter(a =>
      a.status === 'Intervju' || a.status === 'Tilbud' || a.outcome === 'Fått jobben'
    ).length
    return {
      svarrate: Math.round((responded / total) * 100),
      intervjurate: Math.round((hadInterview / total) * 100),
    }
  }, [applications])

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

  const maxWeekCount = Math.max(...weeklyData.map(w => w.count), 1)
  const hasOutcomes = OUTCOMES.some(o => counts[o] > 0)
  const empty = counts.total === 0

  return (
    <section
      id="panel-statistikk"
      role="tabpanel"
      aria-labelledby="tab-statistikk"
      hidden={hidden}
      tabIndex={0}
    >
      <h2 className="text-xl font-bold text-[#1E3A6B] mb-6">Statistikk</h2>

      {/* Nøkkeltall */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Totalt sendt',  value: counts.total,         suffix: '',                              color: '#1E3A6B', icon: '📋' },
          { label: 'Svarrate',      value: svarrate  ?? '—',     suffix: svarrate  !== null ? '%' : '',   color: '#3B82F6', icon: '📬' },
          { label: 'Intervjurate',  value: intervjurate ?? '—',  suffix: intervjurate !== null ? '%' : '', color: '#10B981', icon: '🤝' },
          { label: 'Fått jobben',   value: counts['Fått jobben'], suffix: '',                             color: '#059669', icon: '🏆' },
        ].map(({ label, value, suffix, color, icon }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-1">
            <span className="text-base" aria-hidden="true">{icon}</span>
            <span className="text-2xl font-bold tabular-nums" style={{ color }}>
              {value}{suffix}
            </span>
            <span className="text-xs text-[#64748B] font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Søknader per uke */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="font-semibold text-[#0F172A] mb-1">Søknader per uke</h3>
          <p className="text-xs text-[#94A3B8] mb-5">Siste 8 uker</p>
          {empty ? (
            <p className="text-sm text-[#64748B]">Ingen søknader ennå.</p>
          ) : (
            <div aria-hidden="true">
              <div className="flex items-end gap-1.5 h-20">
                {weeklyData.map((w, i) => (
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
                {weeklyData.map((w, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-[9px] text-[#94A3B8] leading-none">{w.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Utfall */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="font-semibold text-[#0F172A] mb-5">Utfall</h3>
          {hasOutcomes ? (
            <OutcomeChart counts={counts} />
          ) : (
            <p className="text-sm text-[#64748B]">Ingen avgjorte søknader ennå.</p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div>
        <p className="text-[0.75rem] font-bold tracking-widest uppercase text-[#94A3B8] mb-3">Kan hjelpe deg videre</p>
        <div className="flex flex-col divide-y divide-[#F1F5F9]">
          {TIPS.map(({ href, icon, title, desc }) => (
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
        <p className="text-[0.7rem] text-[#94A3B8] mt-2">Affiliatelenker — vi mottar en liten provisjon uten kostnad for deg.</p>
      </div>
    </section>
  )
}

function OutcomeChart({ counts }) {
  const r = 58
  const strokeWidth = 20
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const total = OUTCOMES.reduce((sum, o) => sum + (counts[o] ?? 0), 0)
  const segments = OUTCOMES.filter(o => counts[o] > 0).map(o => ({ label: o, value: counts[o], color: OUTCOME_COLOR[o] }))

  let priorLength = 0
  const slices = segments.map(seg => {
    const dashLength = (seg.value / total) * circumference
    const dashOffset = -priorLength
    priorLength += dashLength
    return { ...seg, dashLength, dashOffset }
  })

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
            {slices.map(slice => (
              <circle
                key={slice.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${slice.dashLength} ${circumference}`}
                strokeDashoffset={slice.dashOffset}
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#1E3A6B] tabular-nums">{total}</span>
          <span className="text-xs text-[#64748B]">avgjort</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
        {slices.map(slice => (
          <div key={slice.label} className="flex items-center gap-1.5 text-xs text-[#475569]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: slice.color }} />
            {slice.label} <span className="font-semibold tabular-nums text-[#0F172A]">{slice.value}</span>
          </div>
        ))}
      </div>
      <table className="sr-only" aria-label="Utfall per kategori">
        <thead><tr><th>Utfall</th><th>Antall</th></tr></thead>
        <tbody>{slices.map(s => <tr key={s.label}><td>{s.label}</td><td>{s.value}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
