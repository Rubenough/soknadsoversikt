# Analyse: Intervjunotat per runde

**Dato:** 2026-04-25  
**Agenter brukt:** ux-reviewer, code-reviewer, wcag-reviewer

---

## Funksjonsønske

Hver intervjurunde skal kunne ha sitt eget notat om hvordan runden gikk (ikke bare logistikk som dato, kontaktperson, møtelenke). Etter at intervjuet er gjennomført trenger brukeren ikke se Teams-detaljer, men fortsatt se notatet.

---

## 1. Foretrukket datastruktur: Alt A — `notes` i eksisterende JSONB

Legg `notes` direkte inn i `interview_details` per runde:

```json
{ "1": { "contact_person": "...", "interview_date": "...", "notes": "Gikk bra, snakket om React-erfaring" } }
```

**Hvorfor:**
- `setInterviewDetail('notes', value)` fungerer allerede i `ApplicationForm.jsx`
- `cleanInterviewDetails()` i `useApplications.js` bevarer runder med notat (sjekker `Object.values(fields).some(v => v && v.trim?.())`)
- Ingen databasemigrering, ingen N+1-queries, ingen ny RLS-logikk
- Ingen endringer i `delete-account` Edge Function
- Fremtidig utvidbarhet (timestamps, score) er trivielt i JSONB

**Vurderte alternativer:**
- **Alt B** (separat `interview_notes` JSONB-kolonne): dobling av state-logikk, synkroniseringsproblem
- **Alt C** (ny tabell): overkill nå, krever radikale endringer i `useApplications.js` og N+1-risiko

---

## 2. Foretrukket UI-mønster

### Tre nivåer

| Sted | Notat-visning |
|---|---|
| `ApplicationCard` | Ingen endring — for kompakt |
| `ApplicationDetailModal` | Notatet alltid synlig under logistikken i `InterviewDetailsCard`, `line-clamp-2` + inline expand |
| `ApplicationForm` | Full `textarea` under logistikkfeltene per runde, `rows={2}`, `resize-y` |

### Auto-kollaps av logistikk etter intervjuet

Møtedetaljer (lenke, ID, passord, kontaktperson) er kun nyttige *før* møtet. Etter at `interview_date` er passert auto-kollapses logistikken — notatet forblir alltid synlig.

| Situasjon | Logistikk | Notat |
|---|---|---|
| `interview_date` i fremtiden | Alltid synlig | Alltid synlig |
| `interview_date` passert | Kollapset (standard) | Alltid synlig |
| Ingen `interview_date` | Alltid synlig | Alltid synlig |

En "Vis møtedetaljer"-knapp lar brukeren ekspandere ved behov.

**Viktig:** Notat kommer *etter* logistikk — brukeren som skal i møte om 10 min scanner etter møtelenken, ikke refleksjonstekst.

---

## 3. Viktigste tilgjengelighetshensyn (WCAG 2.1 AA)

| Krav | WCAG | Konkret |
|---|---|---|
| Toggle er `<button>` | 4.1.2 | Aldri `<div onClick>` |
| `aria-expanded` på toggle | 4.1.2 | `true`/`false` boolean |
| `aria-controls` → panel-ID | 4.1.2 | Unik ID per runde |
| Skjult innhold fjernes fra a11y-tre | 1.3.1 | Bruk `hidden`-attributt, ikke CSS-klasse alene |
| Fokus forblir på knappen ved åpning | 2.4.3 | Ikke flytt fokus inn i panelet |
| `role="status"` ved lagring | 4.1.3 | Skjermlesere annonserer suksess |
| Norsk i alle `aria-label` | 3.1.1 | "Vis møtedetaljer", "Skjul møtedetaljer" |

**Tabs er feil valg** — intervjurunder er sekvensielle steg, ikke sidestilte alternativer. Bruk disclosure-mønster i eksisterende `<ol>`-tidslinje.

---

## Konkrete kodeendringer

1. **`ApplicationForm.jsx`** — legg til `textarea` for notat i intervjudetaljer-seksjonen (etter passord-felt)
2. **`ApplicationDetailModal.jsx`** — utvid `InterviewDetailsCard` med:
   - Notat alltid synlig under logistikk
   - Auto-kollaps av logistikk når `interview_date < today`
   - `<button aria-expanded aria-controls>` for "Vis møtedetaljer"
3. **`useApplications.js`** — ingen endringer nødvendig
4. **Database** — ingen migrering nødvendig

---

## Oppfølging: auto-kollaps av logistikk — Kode

**Vurdert av code-reviewer, 2026-04-25**

### 1. Implementeringsenkelthet

**Lokal `useState` i `InterviewDetailsCard` — ja, dette er enkelt:**

```javascript
function InterviewDetailsCard({ details }) {
  const [showLogistics, setShowLogistics] = useState(false)
  // ...
  return (
    <>
      {/* Notatet — alltid synlig */}
      {details.notes && (
        <p className="text-sm text-[#475569]">
          <span className="font-medium text-[#64748B]">Notat:</span> {details.notes}
        </p>
      )}
      
      {/* Logistikkknapp — synlig bare hvis interview_date er passert */}
      {isPastDate(details.interview_date) && (
        <button
          onClick={() => setShowLogistics(!showLogistics)}
          aria-expanded={showLogistics}
          aria-controls={`logistics-${details.interview_date}`}
          className="text-xs text-[#2563EB] hover:underline font-medium"
        >
          {showLogistics ? 'Skjul møtedetaljer' : 'Vis møtedetaljer'}
        </button>
      )}
      
      {/* Logistikk — kollapsbar hvis interview_date < today */}
      {(!isPastDate(details.interview_date) || showLogistics) && (
        <div id={`logistics-${details.interview_date}`} className="mt-2 bg-[#F8FAFC] ...">
          {/* contact_person, meeting_link, meeting_id, passcode — som før */}
        </div>
      )}
    </>
  )
}
```

**Oppsummering:** Ingen komplekst — ett `useState` for toggle, betinget rendering, og ARIA-attributter. Ingen prop-drilling fra parent.

---

### 2. Datosammenligning — sikreste tilnærming

**Eksisterer allerede:** `daysUntil(iso)` i `dates.js` — men vi trenger en eksplisitt `isPastDate()` for lesbarhet.

**Anbefalt implementering — legg til i `src/utils/dates.js`:**

```javascript
export function isPastDate(iso) {
  if (!iso) return false
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)  // Normaliser til midnatt lokal tid
  return date < today
}
```

**Hvorfor dette er sikkert:**
- ISO-string `"2026-04-20"` representerer en dato *uten tid*. Konstruering via `new Date(year, month, day)` tolker som lokal midnatt (ikke UTC)
- `setHours(0, 0, 0, 0)` normaliserer "i dag" til lokal midnatt — unngår tidssoneproblemer ved sammenlikning
- Samme mønster som eksisterende `daysUntil()` → konsistent med codebasen
- Returnerer `false` hvis `interview_date` er tom — logistikk vises alltid (sikkert)

**Aldri gjør:** Ikke parse som UTC-midnatt (`new Date('2026-04-20T00:00:00Z')`) — kan gi dag-skjøer på tvers av tidssoner.

---

### 3. Prop-drilling: Ikke nødvendig

`InterviewDetailsCard` mottar `details` som prop — den har allerede alt den trenger:
```javascript
const isPast = isPastDate(details.interview_date)
```

Ingen behov for ekstra props fra `ApplicationDetailModal`. `InterviewDetailsCard` beregner selv.

---

### 4. Kanttilfeller — ingen blokkere

| Tilfelle | Håndtering | Status |
|---|---|---|
| `details` er `null/undefined` | Returneres allerede (`if (!hasContent) return null`) | ✓ OK |
| `interview_date` mangler | `isPastDate()` returnerer `false` → logistikk alltid synlig | ✓ OK |
| `notes` mangler | Vises ikke (betinget render) | ✓ OK |
| Notat ikke ennå i JSONB | Legges til som del av samme PR (Alt A-struktur fra avsnitt 1) | ✓ Planlagt |

**Oppsummering:** Ingen nye kanttilfeller. Eksisterende sikkerhetsnett holder.

---

### Neste steg

1. Legg til `isPastDate()` i `src/utils/dates.js`
2. Import i `ApplicationDetailModal.jsx`
3. Oppdater `InterviewDetailsCard` med lokal `useState` og betinget rendering
4. Legg til `notes`-felt i `ApplicationForm.jsx` (samme PR)
5. Test: WCAG-sjekk (ARIA-attriBUTTER, fokusordre, skjermleserannonsering)

*Denne filen kan slettes når funksjonen er implementert — beslutningene lever videre i `memory/`.*

---

## Oppfølging: auto-kollaps av logistikk — UX

**Vurdert av ux-reviewer, 2026-04-25**

### 1. Er auto-kollaps riktig valg?

**Ja — med en viktig betingelse:** auto-kollaps er riktig standardatferd, men kun dersom ekspander-knappen er lett tilgjengelig og alltid synlig.

Etter at et intervju er gjennomført er møtelenken og passord-koden meningsløse felt. De skaper visuell støy og trekker oppmerksomhet fra det som faktisk er verdifullt — notatet om hvordan runden gikk. Brukeren scanner tidslinjen for å forstå status i søknadsprosessen, ikke for å gjenfinne informasjon de allerede har brukt.

Manuell-knapp som alternativ overfører beslutningsbyrden til brukeren: «Bør jeg kollapse dette?» Det er friksjon uten gevinst. Auto-kollaps er progressiv disclosure i praksis — det samme mønsteret kodebasen allerede bruker konsekvent (intervjudetaljene i `ApplicationForm` vises bare når status og runde er valgt).

---

### 2. Kantsaker der brukeren kan trenge logistikken etter datoen

Tre reelle scenarioer:

**A. Møtet ble utsatt, men dato ble ikke oppdatert i appen.**
Brukeren trenger møtelenken igjen. Ekspander-knappen er alltid tilgjengelig — ett klikk for å hente frem logistikken. Byrden er akseptabel.

**B. Ingen `interview_date` er registrert.**
Her vet vi ikke om møtet er gjennomført. Auto-kollaps aktiveres ikke — logistikken vises alltid. Dette er allerede korrekt i tabellen fra avsnitt 2 og i `isPastDate()`-implementeringen fra code-reviewer (returnerer `false` ved tom dato).

**C. Brukeren registrerte dato, men møtte ikke opp / fulgte ikke opp.**
Brukeren trenger sannsynligvis kontaktpersonen for å sende oppfølgingsmail — ikke møte-ID og passord. Det er et argument for å *alltid* vise `contact_person` og kun kollapse de tekniske feltene (`meeting_link`, `meeting_id`, `passcode`). Imidlertid øker dette kompleksiteten i `InterviewDetailsCard` uten stor gevinst: kontaktpersonen er også lagret i det generelle `contact`-feltet på søknaden (synlig i metadata-seksjonen øverst i modalen). Anbefalingen er å kollapse hele sub-card og la brukeren ekspandere om nødvendig — enklere implementasjon, enklere mental modell.

**Konklusjon:** Ingen av kantskaene er blokkere. Ekspander-knappen løser alle scenarioer. Fallback til alltid-synlig ved manglende dato er det eneste kritiske sikkerhetsnett — og det er allerede håndtert.

---

### 3. Beste tekst på ekspander-knappen

**Anbefaling: «Vis møtedetaljer» / «Skjul møtedetaljer»**

| Kandidat | Vurdering |
|---|---|
| «Vis møtedetaljer» | Konkret, forstås umiddelbart, speiler innholdet |
| «Vis logistikk» | Internt/teknisk ord — brukerens perspektiv, ikke systemets |
| «Vis møteinformasjon» | Akseptabelt, men bredere og vagere |
| «Detaljer» | For generisk — hva slags detaljer? |

Symmetri er viktig: kollaps-teksten bør alltid speile ekspander-teksten. «Vis møtedetaljer» → «Skjul møtedetaljer». Forutsigbart disclosure-mønster.

**ARIA-label må inkludere rundenummer** for skjermlesere. Dersom en søknad har tre intervjurunder vil det finnes tre knapper med samme synlige tekst — det er unyansert i skjermlesernavigasjon. Bruk:

```
aria-label="Vis møtedetaljer for runde 1"
aria-label="Skjul møtedetaljer for runde 1"
```

Dette er en WCAG 2.4.6-sak (overskrifter og etiketter) og gjøres enkelt ved å sende `round`-prop ned i `InterviewDetailsCard`.

---

### 4. Skal kollapset-tilstand huskes mellom sidebesøk?

**Nei — reset ved hver modal-åpning er riktig.**

Auto-kollaps gjør allerede den riktige vurderingen basert på dato. Hver gang brukeren åpner modalen er konteksten den samme: datoen er passert, logistikken er sekundær. Det er ingen grunn til at tilstanden fra forrige besøk skal carry over.

Å huske tilstanden i `localStorage` introduserer et subtilt problem: brukeren ekspanderer logistikken én gang for å finne noe, lukker modalen, åpner den igjen neste dag — og befinner seg nå i en «manuelt utvidet» tilstand som ikke ble valgt i den nye konteksten. Det er uventet oppførsel.

Teknisk kostnad er heller ikke triviell: en stabil nøkkel per søknad per runde (`logistics_expanded_${applicationId}_${round}`) betyr at UI-tilstand lever utenfor React-state, med tilhørende cleanup-behov når søknader slettes.

**Konklusjon:** Lokal `useState` i `InterviewDetailsCard` (som code-reviewer har skissert) er riktig og tilstrekkelig. Ingen `localStorage`.

---

### Sammendrag av UX-beslutninger

| Spørsmål | Beslutning |
|---|---|
| Auto-kollaps eller manuell? | Auto-kollaps som standard, alltid ekspanderbar |
| Kantsaker | Ingen blokkere — manglende dato = alltid synlig er tilstrekkelig sikkerhetsnett |
| Knappetekst | «Vis møtedetaljer» / «Skjul møtedetaljer» |
| ARIA | `aria-label` må inkludere rundenummer |
| Persistens | Ingen — reset ved hver modal-åpning |

---

## Oppfølging: auto-kollaps av logistikk — WCAG

**Vurdert av wcag-reviewer, 2026-04-25**

---

### 1. Er disclosure-mønsteret tilgjengelig?

Ja. `<button aria-expanded aria-controls>` er det kanoniske WCAG-godkjente mønsteret for disclosure/show-hide (ARIA Authoring Practices Guide, "Disclosure (Show/Hide)"). Det kreves ingen ekstra `role`-attributt på knappen — `<button>` er implisitt `role="button"`. Panelet som styres trenger en stabil `id` som matcher verdien i `aria-controls`.

Minimumskrav som må oppfylles (WCAG 4.1.2):

- Knappen er `<button>` — aldri `<div onClick>` eller `<span onClick>`
- `aria-expanded="true"` / `aria-expanded="false"` reflekterer faktisk tilstand synkront
- `aria-controls="intervju-logistikk-runde-{r}"` peker på panel-elementets `id`
- Panelet bruker HTML-attributtet `hidden` (ikke bare Tailwind-klasse) når kollapset — da fjernes innholdet fra tilgjengelighetstre og det er ikke fokuserbart

---

### 2. Auto-kollaps basert på dato — tilgjengelighetshensyn

Ingen WCAG-krav brytes av selve automatikken. Auto-kollaps skjer ved lasting av modalen, ikke som respons på brukerhandling. Det er ingen "uventet kontekstendring" (WCAG 3.2.2) fordi ingen brukerhandling utløser endringen — brukeren åpner modalen og møter innholdet slik det er fra start.

**Ikke bruk `aria-live` for å annonsere initialtilstanden.** `aria-live` er riktig for dynamiske endringer etter at innhold er lastet (f.eks. etter lagring). En kollapset initialtilstand er ikke en dynamisk endring og skal ikke annonseres — det ville skapt støy ved hver modal-åpning.

**Det som er kritisk:** Knappens tekst og `aria-expanded="false"` må tydelig kommunisere at det finnes skjult innhold, slik at en skjermleserbruker ikke tror logistikken mangler.

---

### 3. Knapp-tekst og `aria-label`

Fordi `InterviewDetailsCard` kan rendres for flere runder i samme modal, må knapp-teksten identifisere hvilken runde den tilhører. Generisk "Vis møtedetaljer" er ikke tilstrekkelig — to identisk navngitte knapper i samme modal bryter WCAG 2.4.6 (Overskrifter og etiketter) i praksis og skaper forvirring for skjermleserbrukere som navigerer via knapp-liste.

| Tilstand | Anbefalt synlig tekst | `aria-label` |
|---|---|---|
| Kollapset | `Vis møtedetaljer for runde {r}` | Ikke nødvendig — synlig tekst er tilstrekkelig |
| Ekspandert | `Skjul møtedetaljer for runde {r}` | Ikke nødvendig — synlig tekst er tilstrekkelig |

Synlig tekst og annonsert tekst bør sammenfalle (WCAG 2.5.3 Label in Name). Bruk derfor ikke `aria-label` i tillegg til en synlig tekst som allerede er dekkende.

Eksempel på korrekt implementering (roundNumber sendes som prop fra tidslinjeløkken):

```jsx
<button
  aria-expanded={isExpanded}
  aria-controls={`intervju-logistikk-runde-${roundNumber}`}
  onClick={() => setIsExpanded(v => !v)}
  className="min-h-11 ..."
>
  {isExpanded
    ? `Skjul møtedetaljer for runde ${roundNumber}`
    : `Vis møtedetaljer for runde ${roundNumber}`}
</button>

<div id={`intervju-logistikk-runde-${roundNumber}`} hidden={!isExpanded}>
  {/* kontaktperson, møtelenke, møte-ID, passord */}
</div>
```

---

### 4. Notatet er alltid synlig — ARIA-krav

Notatet er ikke interaktivt og trenger ingen spesielle ARIA-attributter for synlighet. To krav gjelder likevel:

**Semantisk plassering:** Notatet skal ligge innenfor `<li>`-elementet for den aktuelle runden i `<ol>`-tidslinjen. Det gjør det allerede siden `InterviewDetailsCard` rendres under `step.details` inne i `<li>`. Plasseres notatet utenfor `<li>`, mister skjermlesere sammenhengen mellom notat og runde.

**Ledetekst:** En enkel `<p>` med `<span class="font-medium">Notat:</span>` er tilstrekkelig semantikk og konsistent med eksisterende stil i `InterviewDetailsCard`. Notatet skal aldri ha `aria-hidden="true"` utilsiktet — sjekk at ingen overordnet wrapper skjuler det fra tilgjengelighetstre.

---

### 5. Fallgruver å unngå

| Fallgruve | Konsekvens | Løsning |
|---|---|---|
| Tailwind-klasse (`hidden` / `display:none`) i stedet for HTML `hidden`-attributt | Innholdet kan forbli i tilgjengelighetstre og er fokuserbart via Tab | Bruk `hidden={!isExpanded}` som JSX-prop — React rendrer det som HTML-attributt |
| Flytte tastaturfokus inn i panelet ved åpning | Bryter forventet disclosure-interaksjon | Fokus skal forbli på knappen — brukeren navigerer selv inn med Tab |
| Ikke oppdatere `aria-expanded` synkront med state | Skjermlesere rapporterer feil tilstand | Bruk `aria-expanded={isExpanded}` direkte fra React state |
| Generisk panel-ID (`id="logistikk"`) | Duplikat-ID-er hvis flere runder vises — ugyldig HTML, bryter WCAG 4.1.1 | Alltid `id={\`intervju-logistikk-runde-${r}\`}` |
| Knapp-tekst uten rundenummer | Skjermleserbruker kan ikke skille knappene fra hverandre i knapp-liste | Se punkt 3 over |
| `aria-live` på initialtilstand | Unødvendig støy i skjermleser ved modal-åpning | `aria-live` kun for dynamiske endringer etter brukerhandling |
| Touch target under 44px på knappen | Bryter WCAG 2.5.5 og norsk krav om touch targets ≥ 44px | Sett `min-h-11` på knappen (Tailwind = 44px) |
| code-reviewer-eksemplet bruker `logistics-${details.interview_date}` som ID | Dato er ikke nødvendigvis unik og sier ikke hvilken runde det gjelder | Bruk `intervju-logistikk-runde-${roundNumber}` med `roundNumber` som prop |
