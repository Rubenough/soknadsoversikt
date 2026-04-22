# TypeScript-migrering — Prosjektplan

## Hvorfor TypeScript?

| Fordel | Konkret nytte i dette prosjektet |
|---|---|
| **Typesikre Supabase-kall** | Feil på kolonnenavn eller feil datastruktur fanges i editoren, ikke i prod |
| **Prop-validering** | Komponentene (`ApplicationCard`, `Modal` osv.) dokumenterer selv hva de forventer |
| **Bedre autocomplete** | Editoren vet hva et `Application`-objekt inneholder — ingen gjetning |
| **Refaktorering med trygghet** | Rename/move gir compile-feil der noe er galt, ikke silent bugs |
| **Supabase type-generering** | Supabase CLI kan generere typer direkte fra databaseskjemaet (`supabase gen types`) |
| **Færre runtime-feil** | Typefeil oppdages ved bygging, ikke av brukeren |

---

## Branch-strategi

> **All TypeScript-migrering skjer på en egen branch: `dev/typescript`**
> `main` forblir uberørt og deploybar under hele migreringen.

```
main                  ← produksjon, alltid stabil
└── dev/typescript    ← all TS-migrering skjer her
```

Opprett branchen:
```bash
git checkout -b dev/typescript
```

Merge til `main` først når alle filer er migrert og bygget uten feil.

---

## Forberedelser

- [ ] Installer TypeScript og nødvendige typer:
  ```bash
  npm install -D typescript @types/react @types/react-dom @types/node
  ```
- [ ] Generer `tsconfig.json`:
  ```bash
  npx tsc --init
  ```
  Viktige innstillinger i `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "jsx": "react-jsx",
      "strict": true,
      "noEmit": true
    },
    "include": ["src"]
  }
  ```
- [ ] Oppdater `vite.config.js` → `vite.config.ts`
- [ ] Generer Supabase-typer fra databaseskjema:
  ```bash
  npx supabase gen types typescript --local > src/lib/database.types.ts
  ```

---

## Migreringssteg

Anbefalt rekkefølge: bygg nedenfra og opp (utilities → hooks → komponenter → sider).

### Steg 1 — Typer og konfig
- [ ] `src/lib/supabase.js` → `supabase.ts` (bruk genererte Supabase-typer)
- [ ] Opprett `src/types/index.ts` med domenetype `Application` og andre delte typer

### Steg 2 — Utilities og data
- [ ] `src/utils/dates.js` → `dates.ts`
- [ ] `src/data/resources.js` → `resources.ts`

### Steg 3 — Hooks
- [ ] `src/hooks/useAuth.js` → `useAuth.ts`
- [ ] `src/hooks/useApplications.js` → `useApplications.ts`

### Steg 4 — UI-komponenter
- [ ] `src/components/ui/Badge.jsx` → `Badge.tsx`
- [ ] `src/components/ui/Modal.jsx` → `Modal.tsx`
- [ ] `src/components/ui/StatusMessage.jsx` → `StatusMessage.tsx`
- [ ] `src/components/ui/ErrorBoundary.jsx` → `ErrorBoundary.tsx`

### Steg 5 — Hovedkomponenter
- [ ] `src/components/ProtectedRoute.jsx` → `ProtectedRoute.tsx`
- [ ] `src/components/ApplicationCard.jsx` → `ApplicationCard.tsx`
- [ ] `src/components/ApplicationForm.jsx` → `ApplicationForm.tsx`
- [ ] `src/components/ApplicationDetailModal.jsx` → `ApplicationDetailModal.tsx`

### Steg 6 — Dashboard-komponenter
- [ ] `src/components/dashboard/UpcomingEvents.jsx` → `UpcomingEvents.tsx`
- [ ] `src/components/dashboard/StatisticsPanel.jsx` → `StatisticsPanel.tsx`
- [ ] `src/components/dashboard/ApplicationsPanel.jsx` → `ApplicationsPanel.tsx`
- [ ] `src/components/dashboard/SettingsPanel.jsx` → `SettingsPanel.tsx`

### Steg 7 — Sider og root
- [ ] `src/pages/NotFoundPage.jsx` → `NotFoundPage.tsx`
- [ ] `src/pages/PrivacyPage.jsx` → `PrivacyPage.tsx`
- [ ] `src/pages/LandingPage.jsx` → `LandingPage.tsx`
- [ ] `src/pages/LoginPage.jsx` → `LoginPage.tsx`
- [ ] `src/pages/DashboardPage.jsx` → `DashboardPage.tsx`
- [ ] `src/main.jsx` → `main.tsx`
- [ ] `src/App.jsx` → `App.tsx`

---

## Ferdigkriterier

- [ ] `npx tsc --noEmit` kjører uten feil
- [ ] `npm run build` kjører uten feil
- [ ] Ingen `any`-typer uten eksplisitt begrunnelse
- [ ] `dev/typescript` merges til `main`
