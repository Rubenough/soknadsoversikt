# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# soknadsoversikt

Gratis søknadstracker for norske jobbsøkere. Live på [soknadsoversikt.no](https://soknadsoversikt.no).

**Stack:** React 19 · Vite · Tailwind CSS v4 · Supabase (PostgreSQL + Auth, EU/Frankfurt) · React Router v7 · Vercel

## Skills

@agent-skills/skills/react-best-practices/SKILL.md
@agent-skills/skills/composition-patterns/SKILL.md
@agent-skills/skills/deploy-to-vercel/SKILL.md
@agent-skills/skills/web-design-guidelines/SKILL.md

---

## Utvikling

```bash
npm run dev      # lokal dev-server
npm run build    # produksjonsbygg
npm run lint     # ESLint
```

Krever `.env.local` med `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY`.

**Testing:** Bruk Vercel preview-deployments, ikke lokal dev-server.

---

## Arkitektur

```
src/
  pages/           LandingPage, LoginPage, DashboardPage, PrivacyPage, NotFoundPage
  components/
    dashboard/     ApplicationsPanel, StatisticsPanel, SettingsPanel, UpcomingEvents
    ui/            Badge, Modal, StatusMessage, ErrorBoundary
    ApplicationCard, ApplicationForm, ApplicationDetailModal, ProtectedRoute
  hooks/           useAuth.js, useApplications.js
  lib/             supabase.js
  utils/           dates.js, url.js
  data/            resources.js (delt kilde for affiliatelenker)
supabase/
  functions/
    delete-account/  Edge Function: slett bruker + søknadsdata
```

Alle sider er lazy-lastet med `React.lazy` + `Suspense`.

**Ruter:** `/` (LandingPage) · `/login` (LoginPage) · `/personvern` (PrivacyPage) · `/app` (DashboardPage, krever auth) · `*` (NotFoundPage)

### Dataflyt

`DashboardPage` er eneste sted med state og handlers. `useApplications(userId)` holder all søknadsdata og eksponerer `addApplication`, `updateApplication`, `deleteApplication` — alle utfører optimistiske lokale oppdateringer etter vellykket Supabase-kall.

`useAuth` bruker `onAuthStateChange` (ikke `getSession`) — session er alltid synkronisert via subscription.

### Viktige mønstre

**Dashboard-paneler** (`ApplicationsPanel`, `StatisticsPanel`, `SettingsPanel`) bruker `hidden`-prop for å forbli montert men visuelt skjult. Dette bevarer intern state (f.eks. filtervalg) ved fanebytte. Aktiv fane lagres i URL search params (`?tab=statistikk`).

**StatusMessage / useStatusMessage** — aria-live region for skjermleservarsler. Alltid i DOM. Bruk `announce(message)` fra `useStatusMessage`-hooken etter CRUD-operasjoner. Meldingen tømmes først, deretter settes på nytt i `requestAnimationFrame` for å sikre at like meldinger utløses på nytt.

**Modal** — har innebygd fokusfelle (Tab/Shift+Tab), Escape-lukking og returnerer fokus til utløserknappen ved lukking.

**`cleanInterviewDetails`** i `useApplications` stripper intervjurunder med alle tomme felt før lagring til Supabase.

**`isSafeUrl`** i `utils/url.js` — validerer at URL-protokoll er `http:` eller `https:`. Bruk denne som guard rundt alle `<a href={userValue}>` i stedet for å rendre lenken direkte. Render-siden i `ApplicationDetailModal` er den reelle sikkerhetsgrensen; skjemavalidering er et ekstra lag.

---

## Database (Supabase PostgreSQL)

Tabell: `applications`

| Kolonne                     | Type      |                                                                                                                    |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`                        | UUID      | PK                                                                                                                 |
| `user_id`                   | UUID      | FK → auth.users (RLS)                                                                                              |
| `company`                   | TEXT      |                                                                                                                    |
| `position`                  | TEXT      |                                                                                                                    |
| `portal`                    | TEXT      | Kilde/jobbportal (NB: feltet heter `portal` i koden, ikke `source`)                                                |
| `url`                       | TEXT      | Lenke til søknadsportal                                                                                            |
| `applied_at`                | DATE      |                                                                                                                    |
| `deadline`                  | DATE      | Nullable                                                                                                           |
| `status`                    | TEXT      | Sendt / Til vurdering / Intervju / Tilbud                                                                          |
| `outcome`                   | TEXT      | Nullable: Avslag / Fått jobben / Trukket søknad                                                                    |
| `outcome_date`              | DATE      | Nullable                                                                                                           |
| `interview_round`           | INT       | Nullable: 1–4                                                                                                      |
| `interview_details`         | JSONB     | Nullable: `{ "1": { contact_person, interview_date, interview_time, meeting_link, meeting_id, passcode, notes } }` |
| `contact`                   | TEXT      | Nullable                                                                                                           |
| `notes`                     | TEXT      | Nullable                                                                                                           |
| `created_at` / `updated_at` | TIMESTAMP | Auto-satt                                                                                                          |

Row Level Security: brukere ser kun egne rader. `delete-account` Edge Function kjøres med service role og bruker Authorization-headeren for å verifisere bruker.

`interview_details` bruker string-nøkler (`"1"`, `"2"`, ...) ikke tall — viktig ved iterasjon (`Object.entries`).

---

## Konvensjoner

- **Språk:** all UI-tekst på norsk
- **Farger:** hardkodede hex-verdier i Tailwind arbitrary-klasser (f.eks. `bg-[#1E3A6B]`, `text-[#475569]`). Primærblå: `#1E3A6B` (header) / `#2563EB` (interaktiv). Bakgrunn: `#F8FAFC`. Bruk eksisterende verdier konsekvent.
- **Tilgjengelighet:** WCAG 2.1 AA er et krav — kontrast ≥4.5:1, touch targets ≥44px, `motion-safe:` på animasjoner, ARIA-etiketter
- **Autentisering:** magic link kun (ingen passord)
- **Personvern:** ingen tracking-cookies, ingen analyseverktøy (kun Vercel Analytics)

---

## TypeScript-migrering

Kodebasen er JavaScript. En komplett trinn-for-trinn migrasjonsplan ligger i `TSprosjektplan.md`.  
Migrering skjer på branch `dev/typescript` — `main` forblir stabil under hele prosessen.
