import Badge from './ui/Badge'
import { formatDate, daysUntil } from '../utils/dates'

export default function ApplicationCard({ application, onClick }) {
  const { company, position, status, outcome, interview_round, applied_at, deadline, portal, contact, notes, interview_details } = application
  const hasClosed = Boolean(outcome)
  const days = daysUntil(deadline)
  const deadlineUrgent = !hasClosed && days !== null && days <= 3 && days >= 0
  const deadlinePassed = !hasClosed && days !== null && days < 0

  // Get interview date/time for current round
  const roundDetails = interview_round ? interview_details?.[String(interview_round)] : null
  const interviewDate = roundDetails?.interview_date ? formatDate(roundDetails.interview_date) : null
  const interviewTime = roundDetails?.interview_time ? `kl. ${roundDetails.interview_time}` : null
  const interviewDateStr = [interviewDate, interviewTime].filter(Boolean).join(' ')

  return (
    <article
      className="relative bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg hover:border-[#CBD5E1] transition-[box-shadow,border-color] duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:ring-offset-2 focus-within:rounded-xl"
      aria-label={`Søknad hos ${company}`}
    >
      {/* Invisible button covering entire card */}
      <button
        onClick={onClick}
        aria-label={`Vis detaljer for søknad hos ${company}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none"
        tabIndex={0}
      />

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

      {/* Intervjurunde + dato */}
      {interview_round && (
        <p className="text-xs font-medium text-[#10B981]">
          Intervju runde {interview_round}
          {interviewDateStr && (
            <span className="text-[#64748B] font-normal ml-1.5">— {interviewDateStr}</span>
          )}
        </p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
        {applied_at && <span>Søkt: {formatDate(applied_at)}</span>}
        {portal && <span>via {portal}</span>}
        {contact && <span>Kontakt: {contact}</span>}
      </div>

      {/* Frist — skjul for avsluttede søknader */}
      {deadline && !hasClosed && (
        <p className={`text-xs font-medium ${deadlinePassed ? 'text-[#B91C1C]' : deadlineUrgent ? 'text-[#B45309]' : 'text-[#475569]'}`}>
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
    </article>
  )
}
