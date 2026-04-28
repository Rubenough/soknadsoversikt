import { useState, useEffect } from 'react'
import { isSafeUrl } from '../utils/url'

const STATUSES = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']
const OUTCOMES = ['Avslag', 'Fått jobben', 'Trukket søknad']

const EMPTY = {
  company: '',
  position: '',
  status: 'Sendt',
  outcome: '',
  outcome_date: '',
  interview_round: '',
  portal: '',
  url: '',
  applied_at: new Date().toISOString().slice(0, 10),
  deadline: '',
  contact: '',
  notes: '',
  interview_details: {},
}

export default function ApplicationForm({ initial, onSubmit, onCancel, saving }) {
  const [fields, setFields] = useState(initial ?? EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const init = initial ? { ...initial, interview_details: initial.interview_details ?? {} } : EMPTY
    setFields(init)
    setErrors({})
  }, [initial])

  function set(key, value) {
    setFields(prev => {
      const next = { ...prev, [key]: value }
      // Rens intervjudetaljer når status endres bort fra Intervju/Tilbud
      if (key === 'status' && value !== 'Intervju' && value !== 'Tilbud') {
        next.interview_round = ''
        next.interview_details = {}
      }
      // Sett dagens dato automatisk når utfall velges første gang, rens når utfall fjernes
      if (key === 'outcome') {
        if (!value) {
          next.outcome_date = ''
        } else if (!prev.outcome_date) {
          next.outcome_date = new Date().toISOString().slice(0, 10)
        }
      }
      return next
    })
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!fields.company.trim())  e.company    = 'Bedriftsnavnet mangler — fyll det inn for å fortsette'
    if (!fields.position.trim()) e.position   = 'Stillingstittel mangler — fyll den inn for å fortsette'
    if (!fields.applied_at)      e.applied_at = 'Dato søkt mangler — velg en dato for å fortsette'
    if (fields.url && !isSafeUrl(fields.url)) e.url = 'Lenken må starte med http:// eller https://'
    const meetingLink = currentRoundDetails?.meeting_link
    if (meetingLink && !isSafeUrl(meetingLink)) e['iv-link'] = 'Møtelenken må starte med http:// eller https://'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) {
      setErrors(e2)
      document.getElementById(`field-${Object.keys(e2)[0]}`)?.focus()
      return
    }
    onSubmit(fields)
  }

  const showInterviewRound = fields.status === 'Intervju' || fields.status === 'Tilbud'
  const showInterviewDetails = showInterviewRound && fields.interview_round
  const currentRoundDetails = fields.interview_details?.[String(fields.interview_round)] || {}

  function setInterviewDetail(key, value) {
    const round = String(fields.interview_round)
    setFields(prev => ({
      ...prev,
      interview_details: {
        ...prev.interview_details,
        [round]: {
          ...(prev.interview_details?.[round] || {}),
          [key]: value,
        },
      },
    }))
  }

  return (
    <form id="application-form" noValidate onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Bedrift */}
        <FieldGroup label="Bedrift" required htmlFor="field-company" error={errors.company}>
          <input
            id="field-company"
            name="company"
            type="text"
            value={fields.company}
            onChange={e => set('company', e.target.value)}
            autoComplete="organization"
            aria-required="true"
            aria-describedby={errors.company ? 'err-company' : undefined}
            placeholder="f.eks. Equinor ASA"
            className={inputClass(errors.company)}
          />
          {errors.company && <ErrorMsg id="err-company" msg={errors.company} />}
        </FieldGroup>

        {/* Stillingstittel */}
        <FieldGroup label="Stillingstittel" required htmlFor="field-position" error={errors.position}>
          <input
            id="field-position"
            name="position"
            type="text"
            value={fields.position}
            onChange={e => set('position', e.target.value)}
            aria-required="true"
            aria-describedby={errors.position ? 'err-position' : undefined}
            placeholder="f.eks. UX-designer"
            className={inputClass(errors.position)}
          />
          {errors.position && <ErrorMsg id="err-position" msg={errors.position} />}
        </FieldGroup>

        {/* Status */}
        <FieldGroup label="Status" htmlFor="field-status">
          <select
            id="field-status"
            name="status"
            value={fields.status}
            onChange={e => set('status', e.target.value)}
            className={inputClass()}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FieldGroup>

        {/* Intervjurunde — vises kun ved Intervju/Tilbud */}
        {showInterviewRound && (
          <FieldGroup label="Intervjurunde" htmlFor="field-interview_round">
            <select
              id="field-interview_round"
              name="interview_round"
              value={fields.interview_round ?? ''}
              onChange={e => set('interview_round', e.target.value ? Number(e.target.value) : '')}
              className={inputClass()}
            >
              <option value="">Ikke satt</option>
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>Runde {n}</option>
              ))}
            </select>
          </FieldGroup>
        )}

        {/* Intervjudetaljer — vises når runde er valgt */}
        {showInterviewDetails && (
          <fieldset className="sm:col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
            <legend className="text-sm font-semibold text-[#0F172A] px-1">
              Intervjudetaljer — Runde {fields.interview_round}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <FieldGroup label="Kontakt for intervjuet" htmlFor="field-iv-contact">
                <input
                  id="field-iv-contact"
                  type="text"
                  value={currentRoundDetails.contact_person || ''}
                  onChange={e => setInterviewDetail('contact_person', e.target.value)}
                  placeholder="f.eks. Ola Nordmann"
                  className={inputClass()}
                />
              </FieldGroup>
              <FieldGroup label="Dato" htmlFor="field-iv-date">
                <input
                  id="field-iv-date"
                  type="date"
                  value={currentRoundDetails.interview_date || ''}
                  onChange={e => setInterviewDetail('interview_date', e.target.value)}
                  className={inputClass()}
                />
              </FieldGroup>
              <FieldGroup label="Klokkeslett" htmlFor="field-iv-time">
                <input
                  id="field-iv-time"
                  type="time"
                  value={currentRoundDetails.interview_time || ''}
                  onChange={e => setInterviewDetail('interview_time', e.target.value)}
                  className={inputClass()}
                />
              </FieldGroup>
              <FieldGroup label="Møtelenke" htmlFor="field-iv-link" error={errors['iv-link']}>
                <input
                  id="field-iv-link"
                  type="url"
                  value={currentRoundDetails.meeting_link || ''}
                  onChange={e => setInterviewDetail('meeting_link', e.target.value)}
                  placeholder="https://teams.microsoft.com/meet/..."
                  aria-describedby={errors['iv-link'] ? 'err-iv-link' : undefined}
                  className={inputClass(errors['iv-link'])}
                />
                {errors['iv-link'] && <ErrorMsg id="err-iv-link" msg={errors['iv-link']} />}
              </FieldGroup>
              <FieldGroup label="Møte-ID" htmlFor="field-iv-meeting-id">
                <input
                  id="field-iv-meeting-id"
                  type="text"
                  value={currentRoundDetails.meeting_id || ''}
                  onChange={e => setInterviewDetail('meeting_id', e.target.value)}
                  placeholder="f.eks. 123 456 789"
                  className={inputClass()}
                />
              </FieldGroup>
              <FieldGroup label="Passord/kode" htmlFor="field-iv-passcode">
                <input
                  id="field-iv-passcode"
                  type="text"
                  value={currentRoundDetails.passcode || ''}
                  onChange={e => setInterviewDetail('passcode', e.target.value)}
                  placeholder="f.eks. abc123"
                  className={inputClass()}
                />
              </FieldGroup>
              <div className="sm:col-span-2">
                <FieldGroup label="Notat om runden" htmlFor="field-iv-notes">
                  <textarea
                    id="field-iv-notes"
                    value={currentRoundDetails.notes || ''}
                    onChange={e => setInterviewDetail('notes', e.target.value)}
                    rows={2}
                    placeholder="Hvordan gikk runden? Egne notater og refleksjoner…"
                    className={`${inputClass()} resize-y min-h-20`}
                  />
                </FieldGroup>
              </div>
            </div>
          </fieldset>
        )}

        {/* Utfall — alltid i venstre kolonne */}
        <div className={showInterviewRound ? undefined : 'sm:col-start-1'}>
          <FieldGroup label="Utfall" htmlFor="field-outcome">
            <select
              id="field-outcome"
              name="outcome"
              value={fields.outcome ?? ''}
              onChange={e => set('outcome', e.target.value)}
              className={inputClass()}
            >
              <option value="">Aktiv / ikke avgjort</option>
              {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FieldGroup>
        </div>

        {/* Dato for utfall — vises kun når utfall er valgt */}
        {fields.outcome && (
          <FieldGroup label="Dato for utfall" htmlFor="field-outcome_date">
            <input
              id="field-outcome_date"
              name="outcome_date"
              type="date"
              value={fields.outcome_date ?? ''}
              onChange={e => set('outcome_date', e.target.value)}
              className={inputClass()}
            />
          </FieldGroup>
        )}

        {/* Kilde */}
        <FieldGroup label="Kilde" htmlFor="field-portal">
          <input
            id="field-portal"
            name="portal"
            type="text"
            value={fields.portal}
            onChange={e => set('portal', e.target.value)}
            placeholder="f.eks. finn.no, LinkedIn, bekjent…"
            className={inputClass()}
          />
        </FieldGroup>

        {/* Lenke */}
        <FieldGroup label="Lenke til søknadsportal" htmlFor="field-url" error={errors.url}>
          <input
            id="field-url"
            name="url"
            type="url"
            value={fields.url}
            onChange={e => set('url', e.target.value)}
            placeholder="https://..."
            aria-describedby={errors.url ? 'err-url' : undefined}
            className={inputClass(errors.url)}
          />
          {errors.url && <ErrorMsg id="err-url" msg={errors.url} />}
        </FieldGroup>

        {/* Dato søkt */}
        <FieldGroup label="Dato søkt" required htmlFor="field-applied_at" error={errors.applied_at}>
          <input
            id="field-applied_at"
            name="applied_at"
            type="date"
            value={fields.applied_at}
            onChange={e => set('applied_at', e.target.value)}
            aria-required="true"
            aria-describedby={errors.applied_at ? 'err-applied_at' : undefined}
            className={inputClass(errors.applied_at)}
          />
          {errors.applied_at && <ErrorMsg id="err-applied_at" msg={errors.applied_at} />}
        </FieldGroup>

        {/* Søknadsfrist */}
        <FieldGroup label="Søknadsfrist" htmlFor="field-deadline">
          <input
            id="field-deadline"
            name="deadline"
            type="date"
            value={fields.deadline}
            onChange={e => set('deadline', e.target.value)}
            className={inputClass()}
          />
        </FieldGroup>

        {/* Kontaktperson */}
        <div className="sm:col-span-2">
          <FieldGroup label="Kontaktperson hos bedriften" htmlFor="field-contact">
            <input
              id="field-contact"
              name="contact"
              type="text"
              value={fields.contact}
              onChange={e => set('contact', e.target.value)}
              placeholder="Navn og e-post/tlf."
              className={inputClass()}
            />
          </FieldGroup>
        </div>

        {/* Notater */}
        <div className="sm:col-span-2">
          <FieldGroup label="Notater" htmlFor="field-notes">
            <textarea
              id="field-notes"
              name="notes"
              value={fields.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Egne notater, tips, oppfølgingspunkter…"
              className={`${inputClass()} resize-y min-h-20`}
            />
          </FieldGroup>
        </div>

      </div>

      <button type="submit" className="sr-only">Lagre</button>
    </form>
  )
}

function FieldGroup({ label, required, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#0F172A]">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-[#DC2626] ml-0.5">*</span>
            <span className="sr-only"> (obligatorisk)</span>
          </>
        )}
      </label>
      {children}
      {error && <ErrorMsg id={`err-${htmlFor?.replace('field-', '')}`} msg={error} />}
    </div>
  )
}

function ErrorMsg({ id, msg }) {
  return (
    <span id={id} role="alert" className="text-xs text-[#DC2626] mt-1">
      {msg}
    </span>
  )
}

function inputClass(error) {
  const base = 'w-full h-10 px-3 border rounded-lg font-[inherit] text-sm text-[#0F172A] bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]'
  return error
    ? `${base} border-[#DC2626]`
    : `${base} border-[#7B8FA8] hover:border-[#2563EB]`
}
