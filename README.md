# soknadsoversikt.no

Gratis jobbsøknadstracker for norske jobbsøkere. Logg søknader, følg statusen din og hold oversikt over frister — alt på ett sted.

**Live:** [soknadsoversikt.no](https://soknadsoversikt.no)

## Funksjonalitet

- Magic link-innlogging (ingen passord)
- Legg til, rediger og slett søknader
- Status-tracking: Sendt → Til vurdering → Intervju → Tilbud
- Utfall: Avslag / Fått jobben / Trukket søknad
- Intervjurunde (1–4)
- Søk og filtrering på status og utfall
- Statistikk: nøkkeltall, statusoversikt og donut-chart
- Eksporter alle søknader som JSON
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
│   ├── ApplicationCard.jsx       søknadskort med status og utfallsbadge
│   ├── ApplicationForm.jsx       skjema med validering
│   ├── ProtectedRoute.jsx        videresender uinnloggede til /login
│   └── ui/
│       ├── Badge.jsx             statusbadger (WCAG AA-kontrast)
│       ├── Modal.jsx             tilgjengelig modal med focus trap
│       └── StatusMessage.jsx     aria-live region for skjermlesere
├── components/dashboard/
│   ├── ApplicationsPanel.jsx     søknadsliste med søk og filter
│   ├── StatisticsPanel.jsx       statistikk og grafer
│   └── SettingsPanel.jsx         eksport og sletting
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── PrivacyPage.jsx
│   └── NotFoundPage.jsx
├── hooks/
│   ├── useApplications.js        Supabase CRUD
│   └── useAuth.js                session-state + magic link
└── lib/
    └── supabase.js
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
