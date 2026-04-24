# soknadsoversikt.no

Gratis jobbsøknadstracker for norske jobbsøkere. Logg søknader, følg statusen din og hold oversikt over frister — alt på ett sted.

**Live:** [soknadsoversikt.no](https://soknadsoversikt.no)

## Funksjonalitet

- Magic link-innlogging (ingen passord)
- Legg til, rediger og slett søknader
- Status-tracking: Sendt → Til vurdering → Intervju → Tilbud
- Utfall: Avslag / Fått jobben / Trukket søknad med dato
- Intervjurunde (1–4) med kontaktperson, dato/tid og møtelenke per runde
- Søk og filtrering på status/utfall, sortering på dato/bedrift/frist
- Kommende frister og intervjuer (neste 14 dager)
- Statistikk: nøkkeltall, pipeline-funnel, søknader per uke (siste 8 uker)
- Eksporter alle søknader som JSON
- Slett konto (fjerner bruker + data via Edge Function)
- Personvernerklæring og 404-side
- Tilgjengelig (WCAG 2.1 AA), responsivt design

## Stack

| Lag | Teknologi |
|-----|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase (PostgreSQL, EU/Frankfurt) |
| Routing | React Router v7 |
| Deploy | Vercel |

## Arkitektur

```
src/
├── components/
│   ├── ApplicationCard.jsx         søknadskort med status og utfallsbadge
│   ├── ApplicationForm.jsx         skjema med validering
│   ├── ApplicationDetailModal.jsx  detaljvisning med rediger/slett
│   ├── ProtectedRoute.jsx          videresender uinnloggede til /login
│   └── ui/
│       ├── Badge.jsx               statusbadger (WCAG AA-kontrast)
│       ├── Modal.jsx               tilgjengelig modal med focus trap
│       ├── StatusMessage.jsx       aria-live region for skjermlesere
│       └── ErrorBoundary.jsx       error boundary med norsk feilmelding
├── components/dashboard/
│   ├── ApplicationsPanel.jsx       søknadsliste med søk, filter og sortering
│   ├── StatisticsPanel.jsx         statistikk og grafer
│   ├── SettingsPanel.jsx           eksport og sletting
│   └── UpcomingEvents.jsx          frister og intervjuer neste 14 dager
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── PrivacyPage.jsx
│   └── NotFoundPage.jsx
├── hooks/
│   ├── useApplications.js          Supabase CRUD
│   └── useAuth.js                  session-state + magic link
├── lib/
│   └── supabase.js
├── utils/
│   └── dates.js                    datoformatering og fristberegning
└── data/
    └── resources.js                affiliatelenker (delt mellom LandingPage og StatisticsPanel)

supabase/
└── functions/
    └── delete-account/             Edge Function: slett bruker fra auth + all søknadsdata
```

## Ruter

| Rute | Side | Tilgang |
|------|------|---------|
| `/` | Landingsside | Offentlig |
| `/login` | Magic Link-innlogging | Offentlig |
| `/app` | Dashboard | Krever innlogging |
| `/personvern` | Personvernerklæring | Offentlig |

## Kjøre lokalt

```bash
npm install
npm run dev
```

Krever en Supabase-instans med `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` i `.env.local`.

## Personvern og GDPR

- Data lagres i EU (Frankfurt) via Supabase
- Row Level Security sikrer at brukere kun ser egne data
- Ingen tracking-cookies eller analyseverktøy
- JSON-eksport og slett-funksjon er implementert (GDPR art. 17 og 20)
