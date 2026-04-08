import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, titleId = 'modal-title', children, footer }) {
  const overlayRef = useRef(null)
  const firstFocusRef = useRef(null)
  const triggerRef = useRef(null)

  // Lagre utløserknapp og flytt fokus inn ved åpning
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement
      setTimeout(() => firstFocusRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      triggerRef.current?.focus()
    }
  }, [isOpen])

  // Escape-lukking + focus trap
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const modal = overlayRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      {/* Overlay */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 id={titleId} className="text-lg font-semibold text-[#0F172A]">
            {title}
          </h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            aria-label="Lukk dialog"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
