const STYLES = {
  // Fremgang
  'Sendt':           'bg-[#DBEAFE] text-[#1E3A8A]',
  'Til vurdering':   'bg-[#FEF3C7] text-[#78350F]',
  'Intervju':        'bg-[#DCFCE7] text-[#14532D]',
  'Tilbud':          'bg-[#D1FAE5] text-[#065F46]',
  // Utfall
  'Avslag':          'bg-[#FEE2E2] text-[#7F1D1D]',
  'Fått jobben':     'bg-[#ECFDF5] text-[#065F46] ring-1 ring-[#059669]',
  'Trukket søknad':  'bg-[#F1F5F9] text-[#475569]',
}

export default function Badge({ status }) {
  const style = STYLES[status] ?? 'bg-[#E2E8F0] text-[#475569]'
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  )
}
