import Modal from './ui/Modal'
import Badge from './ui/Badge'
import { formatDate, daysUntil, formatTime } from '../utils/dates'

const STATUS_ORDER = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']

function statusIndex(status) {
  return STATUS_ORDER.indexOf(status)
}

export default function ApplicationDetailModal({ application, isOpen, onClose, onEdit, onDelete }) {
  if (!application) return null

  const { company, position, status, outcome, interview_round, portal, url, applied_at, deadline, contact, notes, interview_details } = application
  const days = daysUntil(deadline)
  const deadlineUrgent = days !== null && days <= 3 && days >= 0
  const deadlinePassed = days !== null && days < 0
  const si = statusIndex(status)

  // Build timeline steps
  const steps = []

  // 1. Søknad sendt — always
  steps.push({ label: 'Søknad sendt', date: formatDate(applied_at), color: '#2563EB' })

  // 2. Til vurdering
  if (si >= 1) {
    steps.push({ label: 'Til vurdering', color: '#D97706' })
  }

  // 3. Interview rounds
  if (interview_round) {
    for (let r = 1; r <= interview_round; r++) {
      const details = interview_details?.[String(r)]
      steps.push({
        label: `Intervju — runde ${r}`,
        color: '#10B981',
        details,
      })
    }
  }

  // 4. Tilbud
  if (si >= 3) {
    steps.push({ label: 'Tilbud', color: '#059669' })
  }

  // 5. Outcome
  if (outcome) {
    const outcomeColor = outcome === 'Fått jobben' ? '#059669' : outcome === 'Avslag' ? '#DC2626' : '#64748B'
    steps.push({ label: outcome, color: outcomeColor })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company}
      titleId="detail-modal-title"
      footer={
        <>
          <button
            onClick={() => onDelete(application)}
            aria-label={`Slett søknad hos ${company}`}
            className="h-11 px-5 text-[#DC2626] font-semibold text-sm rounded-lg hover:bg-[#FEE2E2] transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2 mr-auto"
          >
            Slett
          </button>
          <button
            onClick={onClose}
            className="h-11 px-5 border-[1.5px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            Lukk
          </button>
          <button
            onClick={() => onEdit(application)}
            className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            Rediger
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <p className="text-sm text-[#475569] mb-2">{position}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={outcome || status} />
            {outcome && (
              <span className="text-xs text-[#64748B]">nådde {status.toLowerCase()}</span>
            )}
            {interview_round && (
              <span className="text-xs font-medium text-[#10B981]">
                Runde {interview_round}
              </span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {applied_at && (
            <div>
              <dt className="text-[#64748B] text-xs font-medium">Søkt dato</dt>
              <dd className="text-[#0F172A]">{formatDate(applied_at)}</dd>
            </div>
          )}
          {portal && (
            <div>
              <dt className="text-[#64748B] text-xs font-medium">Kilde</dt>
              <dd className="text-[#0F172A]">{portal}</dd>
            </div>
          )}
          {contact && (
            <div className="col-span-2">
              <dt className="text-[#64748B] text-xs font-medium">Kontakt</dt>
              <dd className="text-[#0F172A]">{contact}</dd>
            </div>
          )}
          {deadline && (
            <div>
              <dt className="text-[#64748B] text-xs font-medium">Frist</dt>
              <dd className={`font-medium ${deadlinePassed ? 'text-[#B91C1C]' : deadlineUrgent ? 'text-[#B45309]' : 'text-[#0F172A]'}`}>
                {formatDate(deadline)}
                {deadlinePassed && ' — utløpt'}
                {deadlineUrgent && !deadlinePassed && ` — ${days === 0 ? 'i dag!' : `om ${days} dag${days !== 1 ? 'er' : ''}`}`}
              </dd>
            </div>
          )}
          {url && (
            <div>
              <dt className="text-[#64748B] text-xs font-medium">Lenke</dt>
              <dd>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Åpne søknadsportal for ${company} (åpnes i ny fane)`}
                  className="text-[#2563EB] hover:underline inline-flex items-center gap-1"
                >
                  Åpne søknadsportal
                  <span aria-hidden="true" className="text-xs">↗</span>
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* Notes */}
        {notes && (
          <div>
            <h4 className="text-xs font-medium text-[#64748B] mb-1">Notater</h4>
            <p className="text-sm text-[#475569] bg-[#F8FAFC] rounded-lg px-3 py-2 whitespace-pre-wrap">
              {notes}
            </p>
          </div>
        )}

        {/* Timeline */}
        {steps.length > 1 && (
          <div>
            <h4 className="text-xs font-medium text-[#64748B] mb-3">Tidslinje</h4>
            <ol aria-label="Tidslinje for søknadsprosessen" className="relative ml-3">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1
                return (
                  <li key={i} className="relative pb-5 last:pb-0">
                    {/* Vertical line */}
                    {!isLast && (
                      <span
                        className="absolute left-0 top-2.5 w-px h-full"
                        style={{ backgroundColor: '#E2E8F0' }}
                        aria-hidden="true"
                      />
                    )}
                    {/* Dot */}
                    <span
                      className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full -translate-x-1/2 ring-2 ring-white"
                      style={{ backgroundColor: step.color }}
                      aria-hidden="true"
                    />
                    {/* Content */}
                    <div className="ml-5">
                      <p className="text-sm font-medium text-[#0F172A]">
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-[#64748B]">{step.date}</p>
                      )}
                      {/* Interview details sub-card */}
                      {step.details && (
                        <InterviewDetailsCard details={step.details} />
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </Modal>
  )
}

function InterviewDetailsCard({ details }) {
  const { contact_person, interview_date, interview_time, meeting_link, meeting_id, passcode } = details
  const hasContent = contact_person || interview_date || interview_time || meeting_link || meeting_id || passcode

  if (!hasContent) return null

  return (
    <div className="mt-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs space-y-1">
      {contact_person && (
        <p className="text-[#475569]">
          <span className="font-medium text-[#64748B]">Kontakt:</span> {contact_person}
        </p>
      )}
      {(interview_date || interview_time) && (
        <p className="text-[#475569]">
          <span className="font-medium text-[#64748B]">Tidspunkt:</span>{' '}
          {interview_date ? formatDate(interview_date) : ''}{' '}
          {interview_time ? formatTime(interview_time) : ''}
        </p>
      )}
      {meeting_link && (
        <p>
          <a
            href={meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Åpne møtelenke (åpnes i ny fane)"
            className="text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            Bli med i møtet
            <span aria-hidden="true">↗</span>
          </a>
        </p>
      )}
      {meeting_id && (
        <p className="text-[#475569]">
          <span className="font-medium text-[#64748B]">Møte-ID:</span> {meeting_id}
        </p>
      )}
      {passcode && (
        <p className="text-[#475569]">
          <span className="font-medium text-[#64748B]">Kode:</span> {passcode}
        </p>
      )}
    </div>
  )
}
