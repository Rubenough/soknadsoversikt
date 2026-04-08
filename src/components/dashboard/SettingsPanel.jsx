export default function SettingsPanel({ hidden, session, onExport, onDeleteAll, onDeleteAccount }) {
  return (
    <section
      id="panel-innstillinger"
      role="tabpanel"
      aria-labelledby="tab-innstillinger"
      hidden={hidden}
      tabIndex={0}
    >
      <h2 className="text-xl font-bold text-[#1E3A6B] mb-6">Innstillinger</h2>
      <div className="flex flex-col gap-4 max-w-2xl">

        <SettingsCard title="Din konto">
          <p className="text-sm text-[#475569]">Innlogget som <strong>{session?.user?.email}</strong></p>
        </SettingsCard>

        <SettingsCard title="Eksporter data">
          <p className="text-sm text-[#475569] mb-3">
            Last ned alle søknadene dine som én JSON-fil.
          </p>
          <button
            onClick={onExport}
            className="h-10 px-5 border-[1.5px] border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
          >
            <span aria-hidden="true">📤</span>
            Last ned mine data (JSON)
          </button>
        </SettingsCard>

        <SettingsCard title="Slett alle søknadsdata" danger>
          <p className="text-sm text-[#475569] mb-3">
            Sletter alle søknadene dine permanent og logger deg ut. Denne handlingen kan ikke angres — last ned data først hvis du vil beholde en kopi.
          </p>
          <button
            onClick={onDeleteAll}
            aria-label="Slett alle søknadsdata permanent og logg ut"
            className="h-10 px-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2"
          >
            <span aria-hidden="true">🗑️</span>
            Slett alle søknadsdata
          </button>
        </SettingsCard>

        <SettingsCard title="Slett konto" danger>
          <p className="text-sm text-[#475569] mb-3">
            Sletter kontoen din og alle tilknyttede data permanent. Du vil ikke lenger kunne logge inn med denne e-postadressen. Handlingen kan ikke angres.
          </p>
          <button
            onClick={onDeleteAccount}
            className="h-11 px-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2"
          >
            <span aria-hidden="true">⚠️</span>
            Slett konto permanent
          </button>
        </SettingsCard>

      </div>
    </section>
  )
}

function SettingsCard({ title, danger, children }) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${danger ? 'border-[#FEE2E2]' : 'border-[#E2E8F0]'}`}>
      <h3 className={`font-semibold mb-2 ${danger ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>{title}</h3>
      {children}
    </div>
  )
}
