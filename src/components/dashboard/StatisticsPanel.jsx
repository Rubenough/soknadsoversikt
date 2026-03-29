const STATUSES = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']

const STATUS_COLOR = {
  'Sendt':         '#3B82F6',
  'Til vurdering': '#F59E0B',
  'Intervju':      '#10B981',
  'Tilbud':        '#059669',
}

const OUTCOME_COLOR = {
  'Avslag':         '#EF4444',
  'Fått jobben':    '#059669',
  'Trukket søknad': '#94A3B8',
}

const TIPS = [
  { href: 'https://www.kickresume.com/', icon: '📄', title: 'Kickresume', desc: 'Profesjonelle CV-maler som skiller seg ut og kommer gjennom ATS-filtre.' },
  { href: 'https://www.linkedin.com/premium/', icon: '💼', title: 'LinkedIn Premium', desc: 'Se hvem som har sett profilen din og ta kontakt med rekrutterere direkte.' },
  { href: 'https://www.udemy.com/', icon: '🎓', title: 'Udemy', desc: 'Lær nye ferdigheter som styrker søknaden — over 200 000 kurs tilgjengelig.' },
]

export default function StatisticsPanel({ hidden, counts }) {
  return (
    <section
      id="panel-statistikk"
      role="tabpanel"
      aria-labelledby="tab-statistikk"
      hidden={hidden}
      tabIndex={0}
    >
      <h2 className="text-xl font-bold text-[#1E3A6B] mb-6">Statistikk</h2>

      {/* Nøkkeltall-tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Totalt sendt', value: counts.total,          color: '#1E3A6B', icon: '📋' },
          { label: 'Aktive',       value: counts.active,         color: '#3B82F6', icon: '⏳' },
          { label: 'Avslag',       value: counts['Avslag'],      color: '#EF4444', icon: '❌' },
          { label: 'Fått jobben',  value: counts['Fått jobben'], color: '#059669', icon: '🏆' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-1">
            <span className="text-base" aria-hidden="true">{icon}</span>
            <span className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</span>
            <span className="text-xs text-[#64748B] font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Statusoversikt */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="font-semibold text-[#0F172A] mb-5">Søknader per status</h3>
          {counts.total === 0 ? (
            <p className="text-sm text-[#64748B]">Ingen søknader ennå.</p>
          ) : (
            <>
              <div className="flex flex-col gap-3.5" aria-hidden="true">
                {STATUSES.map(s => {
                  const pct = counts.total ? Math.round((counts[s] / counts.total) * 100) : 0
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-[#0F172A]">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[s] }} aria-hidden="true" />
                          {s}
                        </span>
                        <span className="text-[#64748B] tabular-nums">{counts[s]} <span className="text-[#94A3B8]">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full motion-safe:transition-[width] duration-500"
                          style={{ width: `${pct}%`, background: STATUS_COLOR[s] }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <table className="sr-only" aria-label="Søknader per status">
                <thead><tr><th>Status</th><th>Antall</th><th>Prosent</th></tr></thead>
                <tbody>
                  {STATUSES.map(s => (
                    <tr key={s}>
                      <td>{s}</td><td>{counts[s]}</td>
                      <td>{counts.total ? Math.round((counts[s] / counts.total) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Donut-chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          {counts.total === 0 ? (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-5">Fordeling</h3>
              <p className="text-sm text-[#64748B]">Ingen søknader ennå.</p>
            </>
          ) : counts.active === 0 ? (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-5">Utfall</h3>
              <OutcomeChart counts={counts} />
            </>
          ) : (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-5">Aktive søknader</h3>
              <DonutChart counts={counts} />
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8">
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

const OUTCOMES = ['Avslag', 'Fått jobben', 'Trukket søknad']

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

function DonutChart({ counts }) {
  const r = 58
  const strokeWidth = 20
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const segments = STATUSES.filter(s => counts[s] > 0).map(s => ({ label: s, value: counts[s], color: STATUS_COLOR[s] }))

  let priorLength = 0
  const slices = segments.map(seg => {
    const dashLength = (seg.value / counts.total) * circumference
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
          <span className="text-2xl font-bold text-[#1E3A6B] tabular-nums">{counts.total}</span>
          <span className="text-xs text-[#64748B]">totalt</span>
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
    </div>
  )
}
