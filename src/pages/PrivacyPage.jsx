import { Link } from 'react-router-dom'

const LAST_UPDATED = '29. mars 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#1E3A6B] font-bold text-lg hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded"
          >
            <span aria-hidden="true">📋</span>
            soknadsoversikt.no
          </Link>
          <Link
            to="/"
            className="text-sm text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded"
          >
            ← Tilbake til forsiden
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-balance text-[#0F172A] mb-2">Personvernerklæring</h1>
        <p className="text-sm text-[#64748B] mb-10">Sist oppdatert: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-10 text-[#334155]">

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">1. Hvem er ansvarlig for dataene?</h2>
            <p className="leading-relaxed">
              soknadsoversikt.no drives av Ruben Vareide (enkeltpersonforetak). Kontaktinformasjon kommer snart.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">2. Hvilke data samler vi inn?</h2>
            <p className="leading-relaxed mb-3">Vi samler kun inn det du selv legger inn:</p>
            <ul className="flex flex-col gap-1.5 list-disc list-inside text-sm leading-relaxed">
              <li><strong>E-postadresse</strong> — for å opprette konto og sende innloggingslenke.</li>
              <li><strong>Søknadsdata</strong> — bedrift, stilling, portal, søknadsdato, frist, status, utfall, intervjurunde, kontaktperson og notater.</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Vi samler <strong>ikke</strong> inn informasjonskapsler (cookies), IP-adresser for sporing,
              enhetsdata eller atferdsdata. Det finnes ingen analyseverktøy, annonsenettverk eller tredjeparts
              sporingspiksler på tjenesten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">3. Hvorfor behandler vi dataene?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9]">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#0F172A] border border-[#E2E8F0]">Formål</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#0F172A] border border-[#E2E8F0]">Rettslig grunnlag</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2.5 border border-[#E2E8F0]">Autentisering (magic link-innlogging)</td>
                    <td className="px-4 py-2.5 border border-[#E2E8F0]">Avtale (levering av tjenesten)</td>
                  </tr>
                  <tr className="bg-[#F8FAFC]">
                    <td className="px-4 py-2.5 border border-[#E2E8F0]">Lagring og visning av dine søknadsdata</td>
                    <td className="px-4 py-2.5 border border-[#E2E8F0]">Avtale (levering av tjenesten)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">4. Hvor lagres dataene?</h2>
            <p className="leading-relaxed">
              Dataene lagres i{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded"
              >
                Supabase
              </a>{' '}
              sin infrastruktur i <strong>EU (Frankfurt, Tyskland)</strong>. Ingen data overføres til land utenfor EØS.
              Supabase er SOC 2 Type II-sertifisert og følger GDPR-kravene som databehandler.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">5. Deling med tredjeparter</h2>
            <p className="leading-relaxed">
              Vi deler <strong>ikke</strong> dataene dine med tredjeparter for kommersielle formål.
              Supabase har tilgang som teknisk databehandler for å drifte tjenesten.
              Affiliate-lenkene på siden (LinkedIn, Kickresume, Udemy) åpner eksterne nettsteder i ny fane —
              vi sender ikke personopplysninger til disse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">6. Dine rettigheter</h2>
            <p className="leading-relaxed mb-3">
              Etter GDPR har du rett til å:
            </p>
            <ul className="flex flex-col gap-1.5 list-disc list-inside text-sm leading-relaxed">
              <li><strong>Innsyn</strong> — be om en kopi av dataene vi har om deg.</li>
              <li><strong>Retting</strong> — korrigere feil i egne data (direkte i appen).</li>
              <li><strong>Sletting</strong> — slette alle søknadsdata under Innstillinger i appen, eller be oss slette hele kontoen.</li>
              <li><strong>Dataportabilitet</strong> — eksportere alle søknadene dine som JSON fra Innstillinger-fanen.</li>
              <li><strong>Klage</strong> — klage til Datatilsynet (<a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded">datatilsynet.no</a>) om du mener vi behandler dataene dine feil.</li>
            </ul>
            <p className="leading-relaxed mt-3">
                Kontaktinformasjon for forespørsler kommer snart.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">7. Lagringstid</h2>
            <p className="leading-relaxed">
              Dataene dine lagres så lenge kontoen din er aktiv. Du kan slette all data når som helst fra
              Innstillinger-fanen i appen. Kontoer som ikke har vært i bruk på over 24 måneder kan bli slettet
              etter forhåndsvarsel på e-post.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">8. Informasjonskapsler (cookies)</h2>
            <p className="leading-relaxed">
              Tjenesten bruker kun teknisk nødvendige informasjonskapsler for å holde deg innlogget (sesjonstoken
              fra Supabase). Det brukes ingen analyse-, markedsførings- eller sporingsbaserte informasjonskapsler.
              Det vises derfor ikke noe cookie-banner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-balance text-[#1E3A6B] mb-3">9. Endringer i erklæringen</h2>
            <p className="leading-relaxed">
              Vi kan oppdatere denne erklæringen. Dato øverst på siden viser siste revisjon.
              Vesentlige endringer varsles per e-post til registrerte brukere.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-6 mt-8">
        <div className="max-w-[800px] mx-auto flex flex-wrap justify-between items-center gap-4 text-xs text-[#64748B]">
          <span>© {new Date().getFullYear()} soknadsoversikt.no</span>
          <Link to="/" className="text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded text-sm">
            Tilbake til forsiden
          </Link>
        </div>
      </footer>
    </div>
  )
}
