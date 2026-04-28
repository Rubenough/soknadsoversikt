import { useState } from 'react'
import Modal from './ui/Modal'
import Badge from './ui/Badge'
import { formatDate, daysUntil, formatTime, isPastDate } from '../utils/dates'
import { isSafeUrl } from '../utils/url'

const STATUS_ORDER = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']

function statusIndex(status) {
  return STATUS_ORDER.indexOf(status)
}

export default function ApplicationDetailModal({ application, isOpen, onClose, onEdit, onDelete }) {
  if (!application) return null

  const { company, position, status, outcome, outcome_date, interview_round, portal, url, applied_at, deadline, contact, notes, interview_details } = application
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
      const interviewDate = details?.interview_date ? formatDate(details.interview_date) : null
      const interviewTime = details?.interview_time ? formatTime(details.interview_time) : null
      const dateStr = [interviewDate, interviewTime].filter(Boolean).join(' ')
      steps.push({
        label: `Intervju — runde ${r}`,
        date: dateStr || null,
        color: '#10B981',
        details,
        roundNumber: r,
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
    steps.push({ label: outcome, date: outcome_date ? formatDate(outcome_date) : null, color: outcomeColor })
  }

  // Determine which step is the "current" active one (last step = current position)
  const currentStepIndex = steps.length - 1

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
          {url && isSafeUrl(url) && (
            <div>
              <dt className="text-[#64748B] text-xs font-medium">Lenke</dt>
              <dd>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Åpne søknadsportal for ${company} (åpnes i ny fane)`}
                  className="text-sm text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Åpne søknadsportal
                  <span aria-hidden="true">↗</span>
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
                const isCurrent = i === currentStepIndex
                return (
                  <li key={i} className={`relative ${isLast ? 'pb-0' : 'pb-5'}`}>
                    {/* Vertical line */}
                    {!isLast && (
                      <span
                        className="absolute left-0 top-3 w-px"
                        style={{
                          backgroundColor: '#E2E8F0',
                          height: 'calc(100% - 4px)',
                        }}
                        aria-hidden="true"
                      />
                    )}
                    {/* Dot — current step is larger with pulse ring */}
                    <span
                      className={`absolute left-0 -translate-x-1/2 rounded-full ring-2 ring-white ${
                        isCurrent ? 'top-0.5 w-3 h-3 ring-[3px]' : 'top-1 w-2.5 h-2.5'
                      }`}
                      style={{ backgroundColor: step.color }}
                      aria-hidden="true"
                    />
                    {/* Content */}
                    <div className="ml-5">
                      <p className={`text-sm text-[#0F172A] ${isCurrent ? 'font-semibold' : 'font-medium'}`}>
                        {step.label}
                        {isCurrent && !outcome && (
                          <span className="text-xs font-normal text-[#64748B] ml-1.5">
                            (nåværende)
                          </span>
                        )}
                      </p>
                      {step.date && (
                        <p className="text-xs text-[#64748B] mt-0.5">{step.date}</p>
                      )}
                      {/* Interview details sub-card */}
                      {step.details && (
                        <InterviewDetailsCard details={step.details} roundNumber={step.roundNumber} />
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

function InterviewDetailsCard({ details, roundNumber }) {
  const { contact_person, meeting_link, meeting_id, passcode, notes } = details
  const hasLogistics = contact_person || meeting_link || meeting_id || passcode
  const isPast = isPastDate(details.interview_date)
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false)
  const logisticsHidden = isPast && !isLogisticsOpen

  if (!hasLogistics && !notes) return null

  return (
    <div className="mt-2 text-xs space-y-1.5">
      {notes && (
        <p className="text-[#475569]">
          <span className="font-medium text-[#64748B]">Notat:</span> {notes}
        </p>
      )}
      {hasLogistics && isPast && (
        <button
          onClick={() => setIsLogisticsOpen(v => !v)}
          aria-expanded={isLogisticsOpen}
          aria-controls={`intervju-logistikk-runde-${roundNumber}`}
          className="min-h-11 text-xs text-[#2563EB] hover:underline font-medium"
        >
          {isLogisticsOpen
            ? `Skjul møtedetaljer for runde ${roundNumber}`
            : `Vis møtedetaljer for runde ${roundNumber}`}
        </button>
      )}
      {hasLogistics && (
        <div
          id={`intervju-logistikk-runde-${roundNumber}`}
          hidden={logisticsHidden}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 space-y-1.5"
        >
          {contact_person && (
            <p className="text-[#475569]">
              <span className="font-medium text-[#64748B]">Kontakt:</span> {contact_person}
            </p>
          )}
          {meeting_link && isSafeUrl(meeting_link) && (
            <p>
              <a
                href={meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Åpne møtelenke (åpnes i ny fane)"
                className="text-sm text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
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
      )}
    </div>
  )
}
