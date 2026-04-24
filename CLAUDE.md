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
  utils/           dates.js
  data/            resources.js (delt kilde for affiliatelenker)
supabase/
  functions/
    delete-account/  Edge Function: slett bruker + søknadsdata
```

Alle sider er lazy-lastet med `React.lazy` + `Suspense`.

---

## Database (Supabase PostgreSQL)

Tabell: `applications`

| Kolonne | Type | |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → auth.users (RLS) |
| `company` | TEXT | |
| `position` | TEXT | |
| `source` | TEXT | Hvor stillingen ble funnet |
| `url` | TEXT | Lenke til søknadsportal |
| `applied_at` | DATE | |
| `deadline` | DATE | Nullable |
| `status` | TEXT | Sendt / Til vurdering / Intervju / Tilbud |
| `outcome` | TEXT | Nullable: Avslag / Fått jobben / Trukket søknad |
| `outcome_date` | DATE | Nullable |
| `interview_round` | INT | Nullable: 1–4 |
| `interview_details` | JSONB | Nullable: `{ "1": { contact_person, interview_date, interview_time, meeting_link, meeting_id, passcode } }` |
| `contact` | TEXT | Nullable |
| `notes` | TEXT | Nullable |
| `created_at` / `updated_at` | TIMESTAMP | Auto-satt |

Row Level Security: brukere ser kun egne rader.

---

## Konvensjoner

- **Språk:** all UI-tekst på norsk
- **Tilgjengelighet:** WCAG 2.1 AA er et krav — kontrast ≥4.5:1, touch targets ≥44px, `motion-safe:` på animasjoner, ARIA-etiketter
- **Autentisering:** magic link kun (ingen passord)
- **Personvern:** ingen tracking-cookies, ingen analyseverktøy (kun Vercel Analytics)

---

## TypeScript-migrering

Kodebasen er JavaScript. En komplett trinn-for-trinn migrasjonsplan ligger i `TSprosjektplan.md`.  
Migrering skjer på branch `dev/typescript` — `main` forblir stabil under hele prosessen.
