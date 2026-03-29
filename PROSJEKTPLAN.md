# soknadsoversikt.no — Prosjektplan

Gratis søknadstracker for norske jobbsøkere. React + Vite + Supabase + Tailwind CSS 4.

---

## Nåværende tilstand

### Stack
- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend/DB:** Supabase (auth med magic link, PostgreSQL)
- **Hosting:** (ikke satt)
- **Ruter:** `/` landingsside, `/login`, `/app` (beskyttet dashboard)

### Database
```
applications
  id, user_id, company, position, portal, url
  applied_at, deadline, status, outcome, interview_round
  contact, notes, created_at, updated_at
```

### Hva som er bygget
- Landingsside: hero, features, "slik fungerer det", ressurser (affiliatelenker), FAQ, støtt-seksjon
- Magic link innlogging
- Dashboard med tre faner: Søknader, Statistikk, Innstillinger (fane-tilstand synkronisert med URL `?tab=…`)
- Søknader: legg til / rediger / slett, søk, filtrering på status og utfall, kortvisning
- Lenke til søknad på hvert kort (åpner eksternt)
- Status (fremgang): Sendt → Til vurdering → Intervju → Tilbud
- Utfall: Avslag / Fått jobben / Trukket søknad (separat fra status)
- Intervjurunde (1–4), vises kun ved Intervju/Tilbud
- Kortet viser utfall-badge + "nådde [status]" når prosessen er avsluttet
- Statistikk: nøkkeltall-tiles (totalt, aktive, avslag, fått jobben), fargede statusbarer med prosent, donut-chart, affiliatetips
- "Til vurdering + utfall" telles under Sendt i statistikken
- Eksport som JSON
- Innstillinger: eksport, slett alle data

### Filstruktur
```
src/
  pages/
    LandingPage.jsx
    LoginPage.jsx
    DashboardPage.jsx         # appskall: auth, data, tabs, modaler
  components/
    dashboard/
      ApplicationsPanel.jsx   # søknader-fane: liste, søk, filter
      StatisticsPanel.jsx     # statistikk-fane: grafer, tips
      SettingsPanel.jsx       # innstillinger-fane: konto, eksport, slett
    ApplicationCard.jsx
    ApplicationForm.jsx
    ProtectedRoute.jsx
    ui/
      Modal.jsx
      Badge.jsx
      StatusMessage.jsx
  hooks/
    useAuth.js
    useApplications.js
  lib/
    supabase.js
```

---

## Gjennomført (siste runde)

### Ytelse (react-best-practices)
- [x] Lazy-loading av alle sider med `React.lazy` + `Suspense`
- [x] Parallell sletting med `Promise.all` i "slett alle data"
- [x] Ubrukt avhengighet `lucide-react` fjernet

### Kodestruktur
- [x] DashboardPage splittet fra 644 → 292 linjer ved å trekke ut tre panelkomponenter
- [x] Søk/filter-tilstand og `filtered`-beregning flyttet inn i `ApplicationsPanel`
- [x] `DonutChart` og `SettingsCard` flyttet til sine respektive panel-filer
- [x] Inline async-handler i "slett alle"-modal erstattet med navngitt funksjon `handleDeleteAll`

### Tilgjengelighet og skjemaer (web-design-guidelines)
- [x] `focus:ring` → `focus-visible:ring` på alle inputfelter
- [x] `spellCheck={false}` og `name="email"` på innloggingsskjema
- [x] `name`-attributt på alle 11 felt i søknadsskjema
- [x] `text-balance` på alle h1/h2-overskrifter i LandingPage
- [x] `transition-all` → spesifikke egenskaper (`transition-[width]`, `transition-[transform,box-shadow]`)
- [x] `motion-safe:` lagt til på animasjoner (respekterer `prefers-reduced-motion`)

### Navigasjon
- [x] Fane-tilstand synkronisert med URL (`?tab=statistikk`) — støtter dyplenking

### Innhold
- [x] "Slik ser det ut"-seksjonen fjernet (utdatert mockup)
- [x] `StatusPill`-komponent fjernet (eksisterte kun for slettede seksjonen)

### Agent Skills
- [x] `CLAUDE.md` opprettet med fire skills: `react-best-practices`, `composition-patterns`, `deploy-to-vercel`, `web-design-guidelines`

---

## Før lansering — må fikses

### Kritisk
- [ ] **Mangler `/personvern`-side** — lenket til i footer, eksisterer ikke som route/komponent
- [ ] **Ingen 404-side** — catch-all redirecter til `/`, bør ha en egen side
- [ ] **Feilhåndtering ved innlogging** — hva skjer hvis magic link utløper eller feiler?
- [ ] **Favicon og `<meta>`-tags** — OG-bilde, description, title per side
- [ ] **Deploy til Vercel**

### Innhold
- [ ] **Vipps-lenke** peker på `vipps.no`, ikke et faktisk betalingslink
- [ ] **Affiliate-lenker** — bekreft at alle er aktive og korrekte

### UX / småfeil
- [ ] **Donut-chart tom** når alle søknader har utfall — bør vise noe nyttig
- [ ] **Tom `<div />`** i ApplicationForm for grid-alignment ved intervjurunde — litt hacky
- [ ] **Slett konto** sletter bare søknader, selve brukeren slettes ikke fra Supabase auth

---

## Forbedringer etter lansering

### Funksjonalitet
- [ ] Påminnelser — varsle om kommende frister (browser notifications eller e-post)
- [ ] Sortering på søknadslisten (dato, bedrift, status)
- [ ] Bulk-handlinger — merk flere og slett / oppdater status
- [ ] Mørkt modus

### Statistikk
- [ ] Tidsbasert statistikk — søknader per uke/måned, trend over tid
- [ ] Snitt intervjurunder før avslag/tilbud
- [ ] Responstid — dager fra søkt til første svar

### Teknisk
- [ ] Error boundary — React-feil bør ikke kræsje hele appen
- [ ] Loading skeleton — i stedet for "Laster søknader…"-tekst
- [ ] Optimistisk UI — oppdater UI før Supabase-respons
- [ ] PWA / installbar — `manifest.json` og service worker
- [ ] E2E-tester — Playwright for kritiske flyter

---

## Inntektsmuligheter
- Affiliate: LinkedIn Premium, Kickresume, Udemy — implementert på landingsside og statistikkfane
- Vipps-donasjon — implementert
- Fremtidig: Pro-plan med e-postvarsler, CV-lagring, AI-hjelp til søknadsbrev

---

## Domenestatus
- Domene: `soknadsoversikt.no` (nevnt i kode, ikke bekreftet registrert)
- Hosting: ikke satt opp

---

## Nyttige kommandoer
```bash
npm run dev       # lokal utvikling
npm run build     # produksjonsbygg
npm run preview   # forhåndsvis produksjonsbygg
```
