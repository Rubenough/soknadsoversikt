# soknadsoversikt.no — Prosjektplan

Gratis søknadstracker for norske jobbsøkere. React + Vite + Supabase + Tailwind CSS 4.

---

## Nåværende tilstand

### Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend/DB:** Supabase (auth med magic link, PostgreSQL)
- **Hosting:** Vercel
- **Ruter:** `/` landingsside, `/login`, `/app` (beskyttet dashboard), `/personvern`

### Database

```
applications
  id, user_id, company, position, portal, url
  applied_at, deadline, status, outcome, interview_round
  contact, notes, created_at, updated_at
```

### Hva som er bygget

- Landingsside: hero, features, "slik fungerer det", ressurser (affiliatelenker), FAQ, støtt-seksjon (Vipps QR + nummer #46496)
- Innloggede brukere ser "Gå til dashboard"-knapp på landingssiden i stedet for "Start gratis"
- Magic link innlogging
- Dashboard med tre faner: Søknader, Statistikk, Innstillinger (fane-tilstand synkronisert med URL `?tab=…`)
- Søknader: legg til / rediger / slett, søk, statuschips som filter, kortvisning
- Lenke til søknad på hvert kort (åpner eksternt)
- Status (fremgang): Sendt → Til vurdering → Intervju → Tilbud
- Utfall: Avslag / Fått jobben / Trukket søknad (separat fra status)
- Intervjurunde (1–4), vises kun ved Intervju/Tilbud
- Kortet viser utfall-badge + "nådde [status]" når prosessen er avsluttet
- Statistikk: nøkkeltall-tiles (totalt, svarrate, intervjurate, fått jobben), pipeline-funnel (Sendt→Svar→Intervju→Tilbud→Jobb), søknader per uke (siste 8 uker, tomme uker trimmet), kommende frister-widget (neste 14 dager), affiliatetips
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
      ApplicationsPanel.jsx   # søknader-fane: liste, søk, filter, chips
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
  data/
    resources.js              # delt kilde for ressurslenker (LandingPage + StatisticsPanel)
  lib/
    supabase.js
```

---

## Gjennomført (siste runde)

### Tilgjengelighet (WCAG 2.1 AA)

- [x] **Fargekontrast** — alle tekstfarger møter 4.5:1: `#94A3B8`→`#64748B`, `#D97706`→`#B45309`, `#EA580C`→`#C2410C`, `#DC2626`→`#B91C1C`, `#10B981`→`#047857`, `#3B82F6`→`#1D4ED8`, `#059669`→`#065F46`, footer `white/50`→`white/80`
- [x] **W3C HTML-validering** — favicon SVG URL-enkodet, trailing slash på void-elementer fjernet, ugyldig `aria-label` på `<div>` i hero byttet til `<p>`
- [x] **ARIA** — `role="status"` fjernet fra Badge (statisk element), `aria-label` som ikke matchet synlig tekst fjernet fra knapper (2.5.3), `aria-label` på `<span>` erstattet med sr-only tekst
- [x] **Landmarks** — `<h1 class="sr-only">` plassert inne i `<header>` i Dashboard
- [x] **Touch targets (44px)** — alle interaktive elementer har min. 44px klikkbart område (`min-h-11`/`h-11`): modal-lukk, kortknapper, filterpills, nav-tabs, logo-lenker, hamburger
- [x] **Rollestruktur** — mobil-dropdown har `role="tablist"`, unike tab-IDs (`mob-tab-*`), statistikk-div endret til `<section aria-label>`
- [x] **Alternativ tekst for grafer** — sr-only `<table>` for bar chart og pipeline-funnel
- [x] **Statistikkbokser** — sr-only tekst for tall+label, synlig innhold `aria-hidden`

### Landingsside

- [x] Innloggede brukere omdirigeres ikke lenger fra landingssiden — viser "Gå til dashboard" i stedet
- [x] Vipps-nummer `#46496` lagt til under QR-koden for mobilbrukere
- [x] Kopitekst oppdatert — portalsporing fremhevet som kjerneverdi (hero, features, steg 3)
- [x] Ressurslenker flyttet til delt datafil `src/data/resources.js` (deles med StatisticsPanel)
- [x] Arbitrære Tailwind-klasser (`max-w-[720px]` etc.) erstattet med kanoniske verdier

### Filtrering (søknadsliste)

- [x] Aktive søknader vises som standard — avsluttede skjules
- [x] Statusdropdown erstattet med klikkbare chips
- [x] "Avsluttede"-pill bytter til avsluttet-modus — aktive og avsluttede søknader vises aldri blandet

### Statistikk (redesign)

- [x] Svarrate og intervjurate erstatter "aktive"-tile (n-verdi fjernet som overflødig)
- [x] Pipeline-funnel (Sendt → Fikk svar → Intervju → Tilbud → Fått jobben) erstatter donut-chart
- [x] Søknader per uke: tomme ledende uker trimmes, viser alltid minst 4 uker
- [x] Kommende frister-widget — vises øverst ved frister innen 14 dager (rød badge ved ≤2 dager)

---

## Gjennomført (tidligere runder)

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

- [x] **`/personvern`-side** — implementert
- [x] **404-side** — implementert
- [x] **Feilhåndtering ved innlogging** — utløpt/ugyldig magic link viser norsk feilmelding; `emailRedirectTo` peker nå på `/login`
- [x] **Favicon og `<meta>`-tags** — OG-bilde (`/public/og-image.png`), `og:image` og `twitter:image` lagt til
- [x] **Deploy til Vercel**

### Innhold

- [x] **Vipps-lenke** peker på `vipps.no`, ikke et faktisk betalingslink
- [ ] **Affiliate-lenker** — bekreft at alle er aktive og korrekte

### UX / småfeil

- [x] **Donut-chart** erstattet med pipeline-funnel som alltid viser full pipeline
- [x] **Tom `<div />`** i ApplicationForm — løst med `sm:col-start-1` på Utfall-feltet
- [x] **Slett konto** — Edge Function `delete-account` sletter bruker fra `auth.users` + søknadsdata; bekreftelses­modal med laste­tilstand

---

## Forbedringer etter lansering

### Funksjonalitet

- [ ] Påminnelser — varsle om kommende frister (browser notifications eller e-post)
- [ ] Sortering på søknadslisten (dato, bedrift, status) — chips-filtrering er på plass, sortering mangler
- [ ] Bulk-handlinger — merk flere og slett / oppdater status
- [ ] Mørkt modus

### Statistikk

- [x] Tidsbasert statistikk — søknader per uke (siste 8 uker)
- [ ] Snitt intervjurunder før avslag/tilbud (ikke ta med?)
- [ ] Responstid — dager fra søkt til første svar (krever status-endringstidsstempel) (ikke relevant?)

### Teknisk

- [x] Error boundary — `ErrorBoundary`-komponent rundt hele appen; norsk feilmelding, stack trace kun i dev
- [x] Loading skeleton — 6 `CardSkeleton`-kort med `animate-pulse` erstatter "Laster søknader…"
- [x] Suspense fallback — viser spinner ved lazy-load i stedet for `null`
- [x] Fetch-feil synlig — `error` fra `useApplications` vises i `ApplicationsPanel`
- [x] `handleDeleteAll` sikret — `try/catch` rundt `Promise.all` + `signOut`
- [ ] Optimistisk UI — oppdater UI før Supabase-respons
- [ ] PWA / installbar — `manifest.json` og service worker
- [ ] E2E-tester — Playwright for kritiske flyter

---

## Inntektsmuligheter

- Affiliate: LinkedIn Premium, CVpilot, LinkedIn Learning m.fl. — implementert på landingsside og statistikkfane, hentet fra delt `resources.js`
- Vipps-donasjon — implementert
- Fremtidig: Pro-plan med e-postvarsler, CV-lagring, AI-hjelp til søknadsbrev

---

## Domenestatus

- Domene: `soknadsoversikt.no`
- Hosting: Vercel

---

## Nyttige kommandoer

```bash
npm run dev       # lokal utvikling
npm run build     # produksjonsbygg
npm run preview   # forhåndsvis produksjonsbygg
```
