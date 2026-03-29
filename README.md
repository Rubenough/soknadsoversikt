# soknadsoversikt.no

Gratis søknadstracker for norske jobbsøkere. Logg søknader, følg status og aldri glem en frist.

## Stack

| Lag | Teknologi |
|-----|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase (EU/Frankfurt) |
| Routing | React Router v7 |
| Ikoner | Lucide React |

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Sett opp miljøvariabler

Kopier `.env.local.example` til `.env` og fyll inn Supabase-credentials:

```bash
cp .env.local.example .env
```

```env
VITE_SUPABASE_URL=https://din-prosjekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=din-anon-key-her
```

Finn disse under **Supabase → Settings → API**.

### 3. Opprett databasetabell

Kjør dette i **Supabase → SQL Editor**:

```sql
CREATE TABLE applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Sendt',
  portal text,
  date_applied date NOT NULL,
  deadline date,
  contact text,
  salary text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brukere ser kun egne søknader"
ON applications FOR ALL
USING (auth.uid() = user_id);
```

### 4. Legg til redirect URL i Supabase

Gå til **Supabase → Authentication → URL Configuration** og legg til:

- `http://localhost:5173` (lokalt)
- `https://ditt-domene.no` (produksjon)

### 5. Start utviklingsserver

```bash
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173).

## Ruter

| Rute | Side | Tilgang |
|------|------|---------|
| `/` | Landingsside | Offentlig |
| `/login` | Magic Link-innlogging | Offentlig |
| `/app` | Dashboard | Krever innlogging |
| `/personvern` | Personvernerklæring | Offentlig |

## Mappestruktur

```
src/
├── components/
│   ├── ApplicationCard.jsx     søknadskort med fristindikator
│   ├── ApplicationForm.jsx     skjema med validering
│   ├── ProtectedRoute.jsx      videresender uinnloggede til /login
│   └── ui/
│       ├── Badge.jsx           statusbadger (WCAG AA-kontrast)
│       ├── Modal.jsx           tilgjengelig modal med focus trap
│       └── StatusMessage.jsx   aria-live region for skjermlesere
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   └── PrivacyPage.jsx         (ikke laget ennå)
├── hooks/
│   ├── useApplications.js      Supabase CRUD
│   └── useAuth.js              session-state + magic link
├── lib/
│   └── supabase.js
├── App.jsx                     React Router-oppsett
└── main.jsx
```

## Bygge for produksjon

```bash
npm run build
```

Output ligger i `dist/`.

## Tilgjengelighet

Appen er bygget etter WCAG 2.1 AA som påkrevd av norsk lov (likestillings- og diskrimineringsloven § 17). Se `ekstraresources/UX-UI-designspesifikasjon.md` for fullstendig sjekkliste.

## Personvern og GDPR

- Data lagres i EU (Frankfurt) via Supabase
- Row Level Security sikrer at brukere kun ser egne data
- Ingen tracking-cookies eller analyseverktøy
- JSON-eksport og slett-konto er implementert (GDPR art. 17 og 20)

## Miljøvariabler

| Variabel | Beskrivelse |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase-prosjektets URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

`.env` er lagt til i `.gitignore` og skal aldri committes.
