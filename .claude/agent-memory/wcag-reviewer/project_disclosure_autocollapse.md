---
name: Disclosure auto-kollaps — WCAG-regler
description: WCAG-krav og fallgruver for disclosure-mønster med auto-kollaps basert på dato, spesifikt for InterviewDetailsCard (2026-04-25)
type: project
---

Besluttet 2026-04-25 for InterviewDetailsCard i ApplicationDetailModal.

Auto-kollaps av logistikk basert på `interview_date < today` bryter ingen WCAG-krav. Initialtilstand er ikke en dynamisk endring — `aria-live` skal ikke brukes for å annonsere den.

Kritiske regler for implementeringen:

1. Panel skjules med HTML `hidden`-attributt (`hidden={!isExpanded}` i JSX), ikke Tailwind-klasse alene. CSS-klasse alene kan la innholdet forbli i tilgjengelighetstre og fokuserbart.

2. Knapp-tekst MÅ inkludere rundenummer fordi flere runder vises i samme modal. Generisk "Vis møtedetaljer" bryter WCAG 2.4.6. Riktig: "Vis møtedetaljer for runde {r}" / "Skjul møtedetaljer for runde {r}".

3. Panel-ID MÅ inneholde rundenummer: `intervju-logistikk-runde-${r}`. Dato alene er ikke unik nok og røper ikke hvilken runde det gjelder. Duplikat-ID-er bryter WCAG 4.1.1.

4. `roundNumber` må sendes som prop til InterviewDetailsCard — det er ikke tilgjengelig i `details`-objektet.

5. Touch target på knappen: `min-h-11` (44px) er påkrevd.

6. Fokus forblir på knappen ved ekspansjon — flytt ikke fokus inn i panelet.

**Why:** Kodebase har allerede etablert mønster for aria-expanded/aria-controls — dette er videreføring av samme konvensjon.
**How to apply:** Sjekk alltid disse seks punktene ved review av enhver disclosure-komponent i kodebasen.
