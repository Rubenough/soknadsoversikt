---
name: Eksisterende designmønstre i kodebasen
description: Nøkkelmønstre, farge-tokens og komponentstruktur for konsistent UX-utvikling
type: project
---

Designmønstre observert på tvers av ApplicationCard, ApplicationDetailModal og ApplicationForm:

**Fargesystem (hardkodet hex, ikke Tailwind-semantikk):**
- Primær handling: #2563EB (blå)
- Tekst primær: #0F172A, sekundær: #475569, dempet: #64748B
- Bakgrunn subdued: #F8FAFC, border: #E2E8F0
- Status-grønn (intervju): #10B981
- Status-gul (til vurdering): #D97706
- Status-rød (avslag/slett): #DC2626 / #B91C1C
- Status-grønn mørk (tilbud/fått jobben): #059669

**Progressiv disclosure — etablert mønster:**
ApplicationForm bruker betinget rendering: intervjudetaljer vises kun når status = Intervju/Tilbud OG runde er valgt. Dette er mønsteret å følge for notat-feltet.

**InterviewDetailsCard (ApplicationDetailModal linje 225–264):**
Viser logistikk per runde som sub-card under hvert tidslinjesteg. Her skal notat-feltet legges til. Komponenten er allerede en naturlig utvidelsespunkt.

**Tidslinje-struktur:**
Bygges i ApplicationDetailModal fra `interview_details` JSONB. Støtter allerede flere runder (loop over 1..interview_round). Notat per runde bør lagres som `interview_details["1"].notes`, `interview_details["2"].notes` osv. — ingen skjemaendring nødvendig.

**ApplicationCard:**
Viser kun `notes` (generelle) via `line-clamp-2`. Intervjunotat per runde skal ikke vises på kortet — for mye info.

**Touch targets og tilgjengelighet:**
Knapper er konsekvent h-11 (44px). ARIA-labels satt på interaktive elementer.
