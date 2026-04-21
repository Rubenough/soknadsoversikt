import { formatDeadline, daysUntil } from '../../utils/dates'

export default function UpcomingEvents({ events, onEventClick }) {
  if (!events.length) return null

  return (
    <section className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 mb-5" aria-label="Kommende hendelser">
      <p className="text-xs font-bold tracking-widest uppercase text-[#C2410C] mb-3">
        Kommende hendelser
      </p>
      <div className="flex flex-col gap-2">
        {events.map((event, i) => {
          const days = daysUntil(event.date)
          const isInterview = event.type === 'interview'
          const label = isInterview
            ? `Intervju runde ${event.round}`
            : 'Søknadsfrist'
          const ariaLabel = `${label} hos ${event.company}${event.time ? `, ${event.time}` : ''} — ${formatDeadline(event.date)}`

          let badgeClass
          if (days <= 2) badgeClass = 'bg-[#FEE2E2] text-[#B91C1C]'
          else if (days <= 7) badgeClass = 'bg-[#FED7AA] text-[#C2410C]'
          else badgeClass = 'bg-[#E2E8F0] text-[#475569]'

          return (
            <button
              key={`${event.application.id}-${event.type}-${event.round ?? 'd'}-${i}`}
              onClick={() => onEventClick(event.application)}
              aria-label={ariaLabel}
              className="flex items-center justify-between gap-3 w-full text-left rounded-lg px-2 py-1.5 -mx-2 hover:bg-[#FED7AA]/30 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-base shrink-0" aria-hidden="true">
                  {isInterview ? '🤝' : '📅'}
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-[#0F172A] truncate block">
                    {event.company}
                  </span>
                  <span className="text-xs text-[#475569] truncate block">
                    {label}
                    {event.time && (
                      <span className="ml-1.5">kl. {event.time}</span>
                    )}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full ${badgeClass}`}>
                {formatDeadline(event.date)}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
