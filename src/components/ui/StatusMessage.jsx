// aria-live region — alltid i DOM, varsler skjermlesere om statusendringer
import { useEffect, useRef } from 'react'

export function useStatusMessage() {
  const ref = useRef(null)

  function announce(message) {
    if (!ref.current) return
    // Tøm først slik at like meldinger utløses på nytt
    ref.current.textContent = ''
    requestAnimationFrame(() => {
      ref.current.textContent = message
    })
  }

  return { ref, announce }
}

export default function StatusMessage({ liveRef }) {
  return (
    <div
      ref={liveRef}
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className="sr-only"
    />
  )
}
