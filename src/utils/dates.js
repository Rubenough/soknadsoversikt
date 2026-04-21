export function formatDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function daysUntil(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  const deadline = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((deadline - today) / 86400000)
}

export function formatTime(time) {
  if (!time) return null
  return `kl. ${time}`
}

export function formatDeadline(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / (24 * 3600 * 1000))
  if (diff === 0) return 'I dag'
  if (diff === 1) return 'I morgen'
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export function getUpcomingEvents(applications, daysAhead = 14) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today.getTime() + daysAhead * 24 * 3600 * 1000)
  const events = []

  for (const app of applications) {
    if (app.outcome) continue

    // Søknadsfrist
    if (app.deadline) {
      const d = new Date(app.deadline)
      if (d >= today && d <= limit) {
        events.push({
          type: 'deadline',
          date: app.deadline,
          time: null,
          company: app.company,
          position: app.position,
          round: null,
          application: app,
        })
      }
    }

    // Intervjudatoer
    if (app.interview_details) {
      for (const [round, details] of Object.entries(app.interview_details)) {
        if (!details?.interview_date) continue
        const d = new Date(details.interview_date)
        if (d >= today && d <= limit) {
          events.push({
            type: 'interview',
            date: details.interview_date,
            time: details.interview_time || null,
            company: app.company,
            position: app.position,
            round: Number(round),
            application: app,
          })
        }
      }
    }
  }

  return events.sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date)
    if (dateDiff !== 0) return dateDiff
    // Same day: interviews before deadlines
    if (a.type !== b.type) return a.type === 'interview' ? -1 : 1
    // Same day + same type: sort by time
    if (a.time && b.time) return a.time.localeCompare(b.time)
    return 0
  })
}
