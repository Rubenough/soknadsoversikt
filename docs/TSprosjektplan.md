# TypeScript-migrering — Prosjektplan

## Hvorfor TypeScript?

| Fordel | Konkret nytte i dette prosjektet |
|---|---|
| **Typesikre Supabase-kall** | Feil på kolonnenavn eller feil datastruktur fanges i editoren, ikke i prod |
| **Prop-validering** | Komponentene (`ApplicationCard`, `Modal` osv.) dokumenterer selv hva de forventer |
| **Bedre autocomplete** | Editoren vet hva et `Application`-objekt inneholder — ingen gjetning |
| **Refaktorering med trygghet** | Rename/move gir compile-feil der noe er galt, ikke silent bugs |
| **Supabase type-generering** | Supabase CLI genererer typer direkte fra databaseskjemaet — ingen manuell duplisering |
| **Færre runtime-feil** | Typefeil oppdages ved bygging, ikke av brukeren |

---

## Mental modell — les dette først

Vite bruker `esbuild` til å transpilere TypeScript. **TypeScript-feil stopper ikke dev-server eller build som standard.** Typesjekking er et separat verktøy:

```bash
npx tsc --noEmit   ← kjør dette manuelt etter hvert steg
```

Dette betyr at du kan migrere én fil om gangen uten å brekke appen. Editor-feil (rød strek) og `tsc`-feil er det faktiske feedback-signalet — ikke build-output.

---

## Branch-strategi

> **All TypeScript-migrering skjer på en egen branch: `dev/typescript`**
> `main` forblir uberørt og deploybar under hele migreringen.

```
main                  ← produksjon, alltid stabil
└── dev/typescript    ← all TS-migrering skjer her
```

```bash
git checkout -b dev/typescript
```

Merge til `main` først når alle filer er migrert og `npx tsc --noEmit` er uten feil.

---

## Forberedelser (Setup)

- [ ] Installer TypeScript (`@types/react` og `@types/react-dom` er allerede installert):
  ```bash
  npm install -D typescript @types/node typescript-eslint
  ```

- [ ] Lag `tsconfig.json` direkte — **ikke** bruk `npx tsc --init` (gir 80 linjer med kommentarer):
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": false,
      "noUnusedParameters": false,
      "noFallthroughCasesInSwitch": true,
      "noEmit": true,
      "skipLibCheck": true,
      "isolatedModules": true,
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "paths": { "@/*": ["./src/*"] }
    },
    "include": ["src"],
    "exclude": ["node_modules", "dist"]
  }
  ```

  Nøkkelinnstillinger forklart:
  - `"strict": true` — slår på 7 strengere sjekker, inkl. `strictNullChecks` (klager på mulig `null`/`undefined`) og `noImplicitAny` (tvinger eksplisitte typer)
  - `"noEmit": true` — `tsc` sjekker kun typer, Vite håndterer selve kompileringen
  - `"moduleResolution": "bundler"` — løser moduler slik Vite 5+ gjør det
  - `"paths": { "@/*": ... }` — path alias: skriv `@/types` i stedet for `../../types`
  - `"noUnusedLocals/Parameters": false` — hold disse av under migrering, aktiver til slutt

- [ ] Oppdater `vite.config.js` → `vite.config.ts` med path alias (matcher tsconfig):
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'
  import path from 'path'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  })
  ```

- [ ] Oppdater `eslint.config.js` — endre glob til `'**/*.{js,jsx,ts,tsx}'` og legg til `@typescript-eslint/no-explicit-any: 'warn'` (warn, ikke error — `any` er ok som midlertidig escape hatch)

- [ ] Generer Supabase-typer:
  ```bash
  npx supabase gen types typescript --linked > src/types/database.types.ts
  # eller lokalt:
  npx supabase gen types typescript --local > src/types/database.types.ts
  ```

- [ ] Verifiser: `npx tsc --noEmit` → 0 feil (finner ingen `.ts`-filer ennå)

---

## Migreringssteg

Rekkefølge: bygg nedenfra og opp (utilities → hooks → komponenter → sider).

### Steg 1 — Typer og konfig

**Konsepter:** union types, `interface` vs `type`, `import type`, Supabase-genererte typer

- [ ] Opprett `src/types/index.ts`

  Moderne best practice: hent `Application` direkte fra den genererte databasetypen — ikke dupliker manuelt:
  ```typescript
  import type { Database } from './database.types'

  // Row = full rad fra databasen (med id, user_id osv.)
  export type Application = Database['public']['Tables']['applications']['Row']
  // Insert = payload ved ny rad (id/user_id er auto-generert av Supabase)
  export type NewApplication = Database['public']['Tables']['applications']['Insert']
  // Update = partial payload ved oppdatering (alle felt valgfrie)
  export type ApplicationUpdate = Database['public']['Tables']['applications']['Update']

  // Utled status/outcome fra Application hvis Supabase genererer dem som enum,
  // ellers definer manuelt:
  export type StatusType = 'Sendt' | 'Til vurdering' | 'Intervju' | 'Tilbud'
  export type OutcomeType = 'Avslag' | 'Fått jobben' | 'Trukket søknad'
  export type SortOrder = 'date-desc' | 'date-asc' | 'company' | 'deadline'

  export interface InterviewRoundDetails {
    contact_person?: string   // ? = feltet er valgfritt
    interview_date?: string
    interview_time?: string
    meeting_link?: string
    meeting_id?: string
    passcode?: string
  }

  export interface UpcomingEvent {
    type: 'deadline' | 'interview'
    date: string
    time: string | null
    company: string
    position: string
    round: number | null
    application: Application
  }

  export interface ApplicationCounts {
    total: number
    active: number
    [key: string]: number
  }
  ```

  > `interface` vs `type`: Bruk `interface` for objektformer (props, datamodeller). Bruk `type` for union-kombinasjoner med `|` og for aliaser til genererte typer. Bruk aldri `React.FC` — type props-argumentet direkte.

  > `import type`: Skriv `import type { ... }` for type-only imports — sikrer at importen forsvinner ved kompilering, ingen runtime-kostnad.

- [ ] `src/lib/supabase.js` → `supabase.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  import type { Database } from '@/types/database.types'

  export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  )
  ```
  Med `createClient<Database>` gir editoren autocomplete på kolonnenavn i alle Supabase-kall.

---

### Steg 2 — Utilities og data

**Konsepter:** funksjonssignaturer, `string | null`, `satisfies`, `as const`

- [ ] `src/utils/dates.js` → `dates.ts`
  ```typescript
  import type { Application, UpcomingEvent } from '@/types'

  export function formatDate(iso: string | null | undefined): string | null
  export function daysUntil(iso: string | null | undefined): number | null
  export function formatTime(time: string | null | undefined): string | null
  export function formatDeadline(dateStr: string): string
  export function getUpcomingEvents(applications: Application[], daysAhead?: number): UpcomingEvent[]
  ```

- [ ] `src/data/resources.js` → `resources.ts` — bruk `satisfies` for presis typing:
  ```typescript
  export const RESOURCES = [
    { href: '...', title: '...', badge: 'Jobbportal', ... },
  ] as const satisfies readonly { href: string; title: string; badge: string; rel: string; icon: string; desc: string }[]
  ```
  > `satisfies` (TS 4.9+): validerer mot en type uten å utvide den. `badge` beholder typen `'Jobbportal'` (literal) i stedet for å bli utvidet til `string`. Mer presist enn `const RESOURCES: Resource[] = [...]`.

- [ ] Verifisering: `npx tsc --noEmit` → fortsatt 0 feil

---

### Steg 3 — Hooks

**Konsepter:** `useState<T>`, `Promise<T>`, generiske funksjoner `<K extends keyof T>`, utility types

- [ ] `src/hooks/useAuth.js` → `useAuth.ts`
  ```typescript
  import type { Session } from '@supabase/supabase-js'

  // Uten <Session | null> infererer TS useState(null) som useState<null>
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)  // boolean infereres fra false — ingen generics nødvendig
  ```

- [ ] `src/hooks/useApplications.js` → `useApplications.ts`

  Bruk Supabase-genererte typer for funksjonsargumenter:
  ```typescript
  import type { Application, NewApplication, ApplicationUpdate } from '@/types'

  // userId er string | undefined fordi session?.user?.id kan være undefined
  export function useApplications(userId: string | undefined) {
    const [applications, setApplications] = useState<Application[]>([])
    const [error, setError] = useState<string | null>(null)

    async function addApplication(fields: NewApplication): Promise<Application> { ... }
    async function updateApplication(id: string, fields: ApplicationUpdate): Promise<Application> { ... }
    async function deleteApplication(id: string): Promise<void> { ... }
  }
  ```

  Generisk setter-funksjon for skjema-state:
  ```typescript
  // K extends keyof Application: K må være et gyldig feltnavn
  // Application[K]: verditypen som korresponderer med nøkkelen
  function set<K extends keyof Application>(key: K, value: Application[K]): void {
    setFields(prev => ({ ...prev, [key]: value }))
  }
  // Nå gir set('company', 42) kompileringsfeil — TypeScript vet at company er string
  ```

  Utility types oppsummert:
  | Type | Effekt | Brukssted |
  |---|---|---|
  | `Partial<T>` | alle felt valgfrie | update-payloads |
  | `Omit<T, 'id'>` | fjerner felt | manuell ny-record type |
  | `Pick<T, 'company'>` | beholder kun spesifikke felt | delvise visninger |
  | `Record<K, V>` | objekt med nøkler K og verdier V | errors-state |

- [ ] Verifisering: `npx tsc --noEmit` → første gang du ser faktiske feil. Jobb gjennom dem én om gangen.

---

### Steg 4 — UI-komponenter

**Konsepter:** `ReactNode`, React 19 `useRef<T>(null)`, klassekomponent-generics

- [ ] `src/components/ui/Badge.jsx` → `Badge.tsx`
  ```typescript
  interface BadgeProps { status: StatusType | OutcomeType | string }
  export default function Badge({ status }: BadgeProps) { ... }
  // Aldri: const Badge: React.FC<BadgeProps> = ... (utdatert mønster)
  ```

- [ ] `src/components/ui/StatusMessage.jsx` → `StatusMessage.tsx`
  ```typescript
  // React 19: useRef<HTMLDivElement>(null) — ikke useRef<HTMLDivElement | null>(null)
  // React 19 håndterer null korrekt uten den ekstra union-typen
  const ref = useRef<HTMLDivElement>(null)
  ```

- [ ] `src/components/ui/ErrorBoundary.jsx` → `ErrorBoundary.tsx` — eneste klassekomponent:
  ```typescript
  import { Component, type ReactNode, type ErrorInfo } from 'react'

  interface Props { children: ReactNode }  // ReactNode = alt React kan rendre (JSX, strenger, null, arrays)
  interface State { error: Error | null }

  class ErrorBoundary extends Component<Props, State> {
    static getDerivedStateFromError(error: Error): State { return { error } }
    componentDidCatch(error: Error, info: ErrorInfo): void { ... }
    render(): ReactNode { ... }
  }
  ```

- [ ] `src/components/ui/Modal.jsx` → `Modal.tsx` — ref-typing og events:
  ```typescript
  // React 19 DOM-refs
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)
  // document.activeElement returnerer Element | null, men Element har ikke .focus()
  // HTMLElement er riktig fordi vi kaller .focus()
  const triggerRef = useRef<HTMLElement | null>(null)

  // DOM addEventListener → KeyboardEvent (DOM-type)
  document.addEventListener('keydown', (e: KeyboardEvent) => { ... })
  // React onKeyDown={} → React.KeyboardEvent<HTMLElement> (React-type)
  // Disse er to forskjellige typer — TypeScript sier fra om du blander dem
  ```

- [ ] Verifisering: `npx tsc --noEmit`

---

### Steg 5 — Hovedkomponenter

**Konsepter:** type narrowing, `satisfies` for konstanter, callback-typer

- [ ] `src/components/ProtectedRoute.jsx` → `ProtectedRoute.tsx`
  ```typescript
  interface ProtectedRouteProps { children: ReactNode }
  ```

- [ ] `src/components/ApplicationCard.jsx` → `ApplicationCard.tsx`
  ```typescript
  interface ApplicationCardProps {
    application: Application
    onClick: () => void  // void = returverdi ignoreres, ikke "returnerer ingenting"
  }
  ```

- [ ] `src/components/ApplicationForm.jsx` → `ApplicationForm.tsx`
  ```typescript
  // satisfies validerer mot Application uten å utvide typene (beholder literal typer)
  const EMPTY = {
    company: '', position: '', status: 'Sendt', ...
  } satisfies Partial<Application>

  // Generisk setter (samme mønster som i useApplications)
  function set<K extends keyof Application>(key: K, value: Application[K]): void { ... }

  // errors-state
  const [errors, setErrors] = useState<Partial<Record<keyof Application, string>>>({})

  interface ApplicationFormProps {
    initial?: Application | null
    onSubmit: (fields: Application) => void | Promise<void>
    onCancel?: () => void
    saving?: boolean
  }
  ```

- [ ] `src/components/ApplicationDetailModal.jsx` → `ApplicationDetailModal.tsx`
  ```typescript
  interface ApplicationDetailModalProps {
    application: Application | null
    isOpen: boolean
    onClose: () => void
    onEdit: (app: Application) => void
    onDelete: (app: Application) => void
  }
  ```
  > **Type narrowing:** Etter `if (!application) return null` vet TypeScript at `application` er `Application` (ikke `null`) for resten av komponenten. TypeScript sporer hva du vet om en variabel på hvert punkt i koden.

- [ ] Verifisering: `npx tsc --noEmit` → forvent 10–20 feil. Jobb fil for fil.

---

### Steg 6 — Dashboard-komponenter

**Konsepter:** `Session`-type fra Supabase, `unknown` vs `any`, `.getTime()` for Date-aritmetikk

- [ ] `src/components/dashboard/UpcomingEvents.jsx` → `UpcomingEvents.tsx`
- [ ] `src/components/dashboard/StatisticsPanel.jsx` → `StatisticsPanel.tsx`
- [ ] `src/components/dashboard/ApplicationsPanel.jsx` → `ApplicationsPanel.tsx`

  TypeScript avdekker en skjult bug her:
  ```typescript
  // FEIL — TypeScript: "left-hand side of arithmetic must be of type number"
  new Date(a.applied_at) - new Date(b.applied_at)
  // RIKTIG:
  new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
  ```
  Sort-state med union type:
  ```typescript
  const [sort, setSort] = useState<SortOrder>('date-desc')
  // setSort('ugyldig-verdi') gir nå kompileringsfeil
  ```

- [ ] `src/components/dashboard/SettingsPanel.jsx` → `SettingsPanel.tsx`
  ```typescript
  import type { Session } from '@supabase/supabase-js'
  interface SettingsPanelProps {
    hidden: boolean
    session: Session | null
    onExport: () => void
    onDeleteAll: () => void
    onDeleteAccount: () => void
  }
  ```

- [ ] Verifisering: `npx tsc --noEmit`

---

### Steg 7 — Sider og root

**Konsepter:** `unknown` fra react-router, null-guard for DOM-elementer

- [ ] `src/pages/NotFoundPage.jsx` → `NotFoundPage.tsx`
- [ ] `src/pages/PrivacyPage.jsx` → `PrivacyPage.tsx`
- [ ] `src/pages/LandingPage.jsx` → `LandingPage.tsx`
- [ ] `src/pages/LoginPage.jsx` → `LoginPage.tsx`
  ```typescript
  // useLocation().state er unknown i react-router v7 — tvinger deg til å validere
  const state = useLocation().state as { authError?: string } | null
  ```
  > `unknown` vs `any`: `any` slår av typesjekk helt. `unknown` tvinger deg til å sjekke typen før du bruker verdien. `location.state` er `unknown` nettopp fordi react-router ikke kan vite hva du lagret der.

- [ ] `src/pages/DashboardPage.jsx` → `DashboardPage.tsx`
  ```typescript
  const [editing, setEditing] = useState<Application | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null)
  const [detailTarget, setDetailTarget] = useState<Application | null>(null)
  ```

- [ ] `src/main.jsx` → `main.tsx`
  ```typescript
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element not found')
  createRoot(rootElement).render(...)
  ```

- [ ] `src/App.jsx` → `App.tsx`

- [ ] Oppdater `index.html`:
  ```html
  <script type="module" src="/src/main.tsx"></script>
  ```

---

## Avsluttende steg

- [ ] Aktiver resterende strictness-sjekker i `tsconfig.json`:
  ```json
  "noUnusedLocals": true,
  "noUnusedParameters": true
  ```
- [ ] `npx tsc --noEmit` → 0 feil
- [ ] `npm run lint` → ingen feil
- [ ] `npm run build` → bygger uten feil
- [ ] `dev/typescript` merges til `main`

---

## Ferdigkriterier

- [ ] `npx tsc --noEmit` kjører uten feil
- [ ] `npm run build` kjører uten feil
- [ ] Ingen `any`-typer uten eksplisitt kommentar (`// TODO: remove any`)
- [ ] `dev/typescript` merges til `main`

---

## Vanlige feil å unngå

| Feil | Hva du gjør i stedet |
|---|---|
| Bruker `any` for å stilne en feil | Les feilmeldingen — den forteller deg hva typen faktisk er |
| `x!.foo` overalt | Legg til `if (!x) return` eller bruk `x?.foo` |
| `useState<boolean>(false)` | Redundant — TS infererer `boolean` fra `false`. Bruk generics kun når startverdien ikke beskriver full type: `useState<Application \| null>(null)` |
| `React.FC<Props>` | Utdatert. Type props-argumentet direkte: `function Foo({ bar }: FooProps)` |
| `useRef<T \| null>(null)` i React 19 | Bruk `useRef<T>(null)` — React 19 håndterer null uten ekstra union |
| `new Date(a) - new Date(b)` | `new Date(a).getTime() - new Date(b).getTime()` |
| Glemmer å oppdatere `index.html` | Endre `main.jsx` → `main.tsx` i script-src |
| Manuelt duplisere `Application`-typen | Bruk `Database['public']['Tables']['applications']['Row']` fra generert fil |

---

## TypeScript-konsepter per steg

| Steg | Konsepter |
|---|---|
| Setup | tsconfig, `noEmit`, `strict`, path aliases med `@/` |
| 1 | `Database['...']['Row/Insert/Update']`, `import type`, `interface` vs `type` |
| 2 | Funksjonssignaturer, `string \| null`, `satisfies`, `as const` |
| 3 | `useState<T>`, `Promise<T>`, generiske funksjoner `<K extends keyof T>`, utility types |
| 4 | `ReactNode`, React 19 `useRef<T>(null)`, klassekomponent-generics |
| 5 | Type narrowing, `satisfies` for konstanter, callback-typer |
| 6 | `Session`-type, `.getTime()` for Date-aritmetikk, `SortOrder` union |
| 7 | `unknown` vs `any`, type assertions `as`, null-guards for DOM |
