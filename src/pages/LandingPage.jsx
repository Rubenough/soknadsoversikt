import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { RESOURCES } from '../data/resources'


const FEATURES = [
  { icon: '📋', title: 'Full oversikt', desc: 'Se alle søknadene dine på ett sted — med bedrift, stilling, portal og status samlet. Aldri lur på om det var FINN, NAV eller noe annet du søkte via.' },
  { icon: '🔔', title: 'Frister og påminnelser', desc: 'Legg inn søknadsfrister og få en tydelig oversikt over hva som haster. Vet alltid hva som er neste steg.' },
  { icon: '📊', title: 'Statistikk', desc: 'Se din svarprosent, andel intervjuer og hvordan jobbsøkingen går. Bruk tallene til å justere strategien din.' },
  { icon: '📱', title: 'Fungerer overalt', desc: 'Tilgjengelig på mobil, nettbrett og PC. Alt synkroniseres automatisk — logg inn fra hvilken som helst enhet.' },
  { icon: '📤', title: 'Eksporter dataene dine', desc: 'Last ned alle søknadene dine som JSON når du vil. Ingen lock-in, ingen abonnement.' },
  { icon: '🔒', title: 'Ingen sporing', desc: 'Ingen annonser, ingen tracking. Dataene dine er dine.' },
]

const STEPS = [
  { num: '1', title: 'Logg inn', desc: 'Skriv inn e-postadressen din og klikk lenken vi sender deg. Ingen passord — du er i gang på sekunder.' },
  { num: '2', title: 'Legg inn søknadene dine', desc: 'Fyll inn bedrift, stilling, dato og søknadsportal. Ta med frister og eventuelle kontaktpersoner.' },
  { num: '3', title: 'Hold oversikten', desc: 'Oppdater status etter hvert — fra Sendt til Intervju til Tilbud. Alltid ett sted å slå opp: hvilken portal du brukte, hva som er neste steg, og når fristen er.' },
]


const FAQ = [
  { q: 'Trenger jeg en brukerkonto?', a: 'Du logger inn med magic link — skriv inn e-postadressen din og klikk lenken vi sender deg. Ingen passord å huske, ingen skjema å fylle ut.' },
  { q: 'Hvor lagres dataene mine?', a: 'Søknadene dine lagres trygt i EU (Frankfurt) via Supabase. Ingen kan se dataene dine — de er beskyttet av Row Level Security slik at bare du har tilgang.' },
  { q: 'Kan jeg bruke appen på flere enheter?', a: 'Ja. Fordi data lagres i skyen er søknadsoversikten din tilgjengelig på alle enhetene dine. Logg inn på mobil, nettbrett eller PC — alt synkroniseres automatisk.' },
  { q: 'Kan jeg eksportere søknadene mine?', a: 'Ja. Du kan eksportere alle søknadene som JSON fra innstillingssiden. Data er dine — ingen lock-in.' },
  { q: 'Koster det noe?', a: 'Nei. soknadsoversikt.no er gratis. Ingen prøveperiode, ingen betalingsvegg, ingen skjult abonnement.' },
  { q: 'Fungerer det på mobil?', a: 'Ja. Siden er responsiv og tilpasset alle skjermstørrelser — telefon, nettbrett og PC.' },
]


export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { session } = useAuth()

  return (
    <>
      {/* Skip-lenke */}
      <a
        href="#main-content"
        className="absolute -top-full left-4 focus:top-3 z-50 bg-[#1E3A6B] text-white px-5 py-3 rounded-lg font-semibold text-sm no-underline focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
      >
        Hopp til innhold
      </a>

      {/* ===== HEADER / NAV ===== */}
      <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-sm border-b border-[#E2E8F0]" role="banner">
        <nav className="max-w-275 mx-auto px-6 h-16 flex items-center justify-between gap-8" aria-label="Hovednav">
          <a
            href="/"
            className="flex items-center gap-2 text-[#1E3A6B] font-extrabold text-lg tracking-tight hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 rounded"
            aria-label="soknadsoversikt.no — gå til forsiden"
          >
            <span aria-hidden="true" className="text-xl">📋</span>
            soknadsoversikt.no
          </a>

          {/* Mobil-hamburger */}
          <button
            className="sm:hidden p-2 text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            aria-expanded={menuOpen}
            aria-controls="nav-links"
            aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}
            onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect y="3" width="22" height="2" rx="1" fill="currentColor"/>
              <rect y="10" width="22" height="2" rx="1" fill="currentColor"/>
              <rect y="17" width="22" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>

          {/* Nav-lenker */}
          <ul
            id="nav-links"
            role="list"
            className={`${menuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-start sm:items-center gap-1 absolute sm:static top-16 left-0 right-0 bg-white sm:bg-transparent border-b sm:border-0 border-[#E2E8F0] p-4 sm:p-0`}
          >
            {[
              { href: '#fordeler', label: 'Fordeler' },
              { href: '#slik-fungerer', label: 'Slik fungerer det' },
              { href: '#ressurser', label: 'Ressurser' },
              { href: '#stott', label: 'Støtt oss' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2 text-sm font-medium text-[#475569] rounded-lg hover:text-[#1E3A6B] hover:bg-[#EFF6FF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to={session ? '/app' : '/login'}
                className="block px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
              >
                {session ? 'Gå til dashboard →' : 'Start gratis →'}
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main-content">

        {/* ===== HERO ===== */}
        <section className="bg-[#1E3A6B] text-white py-20 px-6 text-center" aria-labelledby="hero-heading">
          <div className="max-w-180 mx-auto">
            <div
              className="inline-flex items-center gap-1.5 bg-white/12 border border-white/25 text-white text-[0.8125rem] font-semibold px-3.5 py-1.5 rounded-full mb-7"
              aria-label="Gratis for alltid"
            >
              <span aria-hidden="true">✓</span>
              100 % gratis · Logg inn med e-post
            </div>

            <h1 id="hero-heading" className="text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.15] text-white mb-5 text-balance">
              Hold styr på jobbsøknadene dine — uten stress
            </h1>

            <p className="text-lg text-white/88 mb-10 max-w-140 mx-auto leading-relaxed">
              Husker du hvilken portal du søkte via? Logg søknadene dine ett sted — med portal, status og frister samlet — og slipp å logge inn overalt for å finne dem igjen.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={session ? '/app' : '/login'}
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg min-h-11 transition-colors hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                <span aria-hidden="true">📋</span>
                {session ? 'Gå til dashboard' : 'Start nå — gratis'}
              </Link>
              <a
                href="#slik-fungerer"
                className="inline-flex items-center px-7 py-3 border-2 border-white/55 text-white font-semibold rounded-lg min-h-11 hover:bg-white/10 hover:border-white/80 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                Se hvordan det fungerer
              </a>
            </div>
          </div>
        </section>

        {/* ===== TRUST BAR ===== */}
        <div className="bg-[#162D54] py-5 px-6" role="region" aria-label="Kortfattet om tjenesten">
          <div className="max-w-225 mx-auto flex justify-center gap-10 flex-wrap">
            {[
              { icon: '🇳🇴', text: 'Laget for norske jobbsøkere' },
              { icon: '✓',  text: '100 % gratis' },
              { icon: '📱', text: 'Fungerer på alle enheter' },
              { icon: '⚡', text: 'Kom i gang på sekunder' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <span aria-hidden="true">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ===== FORDELER ===== */}
        <section className="py-20 px-6 bg-[#F8FAFC]" id="fordeler" aria-labelledby="features-heading">
          <div className="max-w-275 mx-auto">
            <span className="inline-block text-[0.8125rem] font-bold tracking-widest uppercase text-[#2563EB] mb-3">Hva du får</span>
            <h2 id="features-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#1E3A6B] text-balance mb-3">Alt du trenger for å holde oversikten</h2>
            <p className="text-[#475569] text-[1.0625rem] mb-12 max-w-150">Enkelt og effektivt — designet for norske jobbsøkere.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon, title, desc }) => (
                <article key={title} className="bg-white border border-[#E2E8F0] rounded-xl p-7 hover:shadow-lg hover:border-[#7B8FA8] transition-all">
                  <span className="text-[2rem] mb-4 block" aria-hidden="true">{icon}</span>
                  <h3 className="font-semibold text-[#1E3A6B] mb-2">{title}</h3>
                  <p className="text-[#475569] text-[0.9375rem] leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SLIK FUNGERER DET ===== */}
        <section className="py-20 px-6 bg-white" id="slik-fungerer" aria-labelledby="how-heading">
          <div className="max-w-275 mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block text-[0.8125rem] font-bold tracking-widest uppercase text-[#2563EB] mb-3">Kom i gang på 2 minutter</span>
              <h2 id="how-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#1E3A6B] text-balance">Slik fungerer det</h2>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8 list-none">
              {STEPS.map(({ num, title, desc }) => (
                <li key={num} className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E3A6B] text-white flex items-center justify-center text-lg font-bold shrink-0" aria-hidden="true">
                    {num}
                  </div>
                  <h3 className="text-[1.0625rem] font-semibold text-[#1E3A6B]">{title}</h3>
                  <p className="text-[#475569] text-[0.9375rem]">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== RESSURSER ===== */}
        <section className="py-20 px-6 bg-[#F8FAFC]" id="ressurser" aria-labelledby="resources-heading">
          <div className="max-w-275 mx-auto">
            <span className="inline-block text-[0.8125rem] font-bold tracking-widest uppercase text-[#2563EB] mb-3">Nyttige lenker</span>
            <h2 id="resources-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#1E3A6B] text-balance mb-3">Ressurser for jobbsøkere</h2>
            <p className="text-[#475569] text-[1.0625rem] mb-10 max-w-150">Jobbportaler, CV-verktøy og kurs tilpasset det norske arbeidsmarkedet.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
              {RESOURCES.map(({ href, title, icon, desc, badge, rel }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel={rel}
                  className="block bg-white border border-[#E2E8F0] rounded-xl p-6 text-inherit no-underline hover:shadow-lg hover:border-[#7B8FA8] transition-all focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
                >
                  <span className="text-[1.75rem] mb-3 block" aria-hidden="true">{icon}</span>
                  <h3 className="font-semibold text-[#1E3A6B] mb-1.5 text-base">{title}</h3>
                  <p className="text-[#475569] text-sm leading-[1.55] mb-3.5">{desc}</p>
                  <span className="inline-block bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold px-2.5 py-1 rounded-full">{badge}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-20 px-6 bg-white" id="faq" aria-labelledby="faq-heading">
          <div className="max-w-275 mx-auto">
            <div className="mb-10">
              <span className="inline-block text-[0.8125rem] font-bold tracking-widest uppercase text-[#2563EB] mb-3">Vanlige spørsmål</span>
              <h2 id="faq-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#1E3A6B] text-balance">Lurer du på noe?</h2>
            </div>
            <ul className="flex flex-col gap-3 max-w-180 list-none">
              {FAQ.map(({ q, a }) => (
                <li key={q}>
                  <details className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden open:border-[#7B8FA8] group">
                    <summary className="flex justify-between items-center gap-4 px-6 py-5 cursor-pointer font-semibold text-[0.9375rem] text-[#0F172A] hover:text-[#1E3A6B] list-none select-none [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:-outline-offset-2">
                      {q}
                      <span className="shrink-0 text-[#2563EB] text-xl font-light leading-none motion-safe:transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <div className="px-6 pb-5 pt-4 border-t border-[#E2E8F0] text-[#475569] text-[0.9375rem] leading-relaxed">
                      {a}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== STØTT OSS / VIPPS ===== */}
        <section className="py-20 px-6 bg-[#F8FAFC] text-center" id="stott" aria-labelledby="support-heading">
          <div className="max-w-130 mx-auto">
            <span className="text-4xl block mb-4" aria-hidden="true">☕</span>
            <h2 id="support-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#1E3A6B] text-balance mb-4">Kjøp meg en kaffe?</h2>
            <p className="text-[#475569] text-[1.0625rem] mb-8 leading-relaxed">
              soknadsoversikt.no er gratis og reklamefri. Hvis verktøyet hjelper deg i jobbsøkingen setter jeg stor pris på en liten donasjon via Vipps.
            </p>
            <div className="inline-block bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#E2E8F0] mb-4">
              <img
                src="/vipps-qr.png"
                alt="Vipps QR-kode for donasjon"
                width={200}
                height={200}
                className="block"
              />
            </div>
            <p className="text-[0.9375rem] text-[#475569] mb-1">Skann med kameraet eller Vipps-appen</p>
            <p className="text-[0.8125rem] text-[#64748B] mb-4">Frivillig og valgfritt — appen er gratis uansett.</p>
            <p className="text-[0.8125rem] text-[#64748B]">Eller søk på <span className="font-semibold text-[#475569]">#46496</span> i Vipps</p>
          </div>
        </section>

        {/* ===== AVSLUTTENDE CTA ===== */}
        <section className="py-20 px-6 bg-white text-center" aria-labelledby="cta-heading">
          <div className="max-w-160 mx-auto">
            <h2 id="cta-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#1E3A6B] text-balance mb-4">Klar til å ta kontroll over jobbsøkingen?</h2>
            <p className="text-[#475569] text-[1.0625rem] mb-8">
              Kom i gang på sekunder. Ingen installasjon, ingen kredittkort — bare søknadsoversikten du fortjener.
            </p>
            <Link
              to={session ? '/app' : '/login'}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base rounded-lg min-h-11 transition-colors hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              <span aria-hidden="true">📋</span>
              {session ? 'Gå til dashboard' : 'Start gratis nå'}
            </Link>
          </div>
        </section>

      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1E3A6B] text-white/75 pt-12 pb-8 px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-10 mb-8">
          <div>
            <p className="text-base font-extrabold text-white mb-2.5">
              <span aria-hidden="true">📋</span> soknadsoversikt.no
            </p>
            <p className="text-sm leading-relaxed text-white/65 max-w-65">
              Gratis søknadstracker for norske jobbsøkere. Enkel, ryddig og GDPR-trygg.
            </p>
          </div>
          <div>
            <p className="text-[0.8125rem] font-bold tracking-widest uppercase text-white/50 mb-4">Produkt</p>
            <ul className="flex flex-col gap-2.5 list-none">
              {['#fordeler','#slik-fungerer','#faq'].map((href, i) => (
                <li key={href}>
                  <a href={href} className="text-[0.9rem] text-white/75 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded">
                    {['Fordeler','Slik fungerer det','FAQ'][i]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.8125rem] font-bold tracking-widest uppercase text-white/50 mb-4">Juridisk</p>
            <ul className="flex flex-col gap-2.5 list-none">
              <li>
                <Link to="/personvern" className="text-[0.9rem] text-white/75 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded">
                  Personvernerklæring
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[0.9rem] text-white/75 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded">
                  Logg inn
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-275 mx-auto pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-[0.8125rem] text-white/45">
          <span>© {new Date().getFullYear()} soknadsoversikt.no</span>
          <span>Laget med ❤️ for norske jobbsøkere</span>
        </div>
      </footer>
    </>
  )
}

