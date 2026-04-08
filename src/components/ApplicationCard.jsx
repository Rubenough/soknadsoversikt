import Badge from './ui/Badge'

function formatDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function daysUntil(iso) {
  if (!iso) return null
  return Math.ceil((new Date(iso) - new Date()) / 86400000)
}

export default function ApplicationCard({ application, onEdit, onDelete }) {
  const { company, position, status, outcome, interview_round, portal, url, applied_at, deadline, contact, notes } = application
  const days = daysUntil(deadline)
  const deadlineUrgent = days !== null && days <= 3 && days >= 0
  const deadlinePassed = days !== null && days < 0

  return (
    <article
      className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg hover:border-[#CBD5E1] hover:-translate-y-0.5 transition-all duration-200"
      aria-label={`Søknad hos ${company}`}
    >
      {/* Topp: bedrift + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-[#0F172A] truncate">{company}</h3>
          <p className="text-sm text-[#475569] truncate">{position}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge status={outcome || status} />
          {outcome && (
            <span className="text-xs text-[#64748B]">nådde {status.toLowerCase()}</span>
          )}
        </div>
      </div>

      {/* Intervjurunde */}
      {interview_round && (
        <p className="text-xs font-medium text-[#10B981]">
          Intervju runde {interview_round}
        </p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
        {applied_at && <span>Søkt: {formatDate(applied_at)}</span>}
        {portal && <span>via {portal}</span>}
        {contact && <span>Kontakt: {contact}</span>}
      </div>

      {/* Frist */}
      {deadline && (
        <p className={`text-xs font-medium ${deadlinePassed ? 'text-[#DC2626]' : deadlineUrgent ? 'text-[#D97706]' : 'text-[#475569]'}`}>
          Frist: {formatDate(deadline)}
          {deadlinePassed && ' — utløpt'}
          {deadlineUrgent && !deadlinePassed && ` — ${days === 0 ? 'i dag!' : `om ${days} dag${days !== 1 ? 'er' : ''}`}`}
        </p>
      )}

      {/* Notater */}
      {notes && (
        <p className="text-xs text-[#475569] bg-[#F8FAFC] rounded-lg px-3 py-2 line-clamp-2">
          {notes}
        </p>
      )}

      {/* Handlinger */}
      <div className="flex gap-2 pt-1 border-t border-[#F1F5F9]">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Åpne søknad hos ${company}`}
            className="flex-1 h-8 text-xs font-medium text-[#2563EB] rounded-lg hover:bg-[#EFF6FF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 flex items-center justify-center"
          >
            Åpne →
          </a>
        )}
        <button
          onClick={() => onEdit(application)}
          aria-label={`Rediger søknad hos ${company}`}
          className="flex-1 h-8 text-xs font-medium text-[#2563EB] rounded-lg hover:bg-[#EFF6FF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
        >
          Rediger
        </button>
        <button
          onClick={() => onDelete(application)}
          aria-label={`Slett søknad hos ${company}`}
          className="flex-1 h-8 text-xs font-medium text-[#DC2626] rounded-lg hover:bg-[#FEE2E2] transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2"
        >
          Slett
        </button>
      </div>
    </article>
  )
}
