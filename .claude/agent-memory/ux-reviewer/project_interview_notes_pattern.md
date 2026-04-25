---
name: Intervju-UI analyse — notat per runde
description: Anbefalt UI-mønster for å legge til notat per intervjurunde i soknadsoversikt
type: project
---

Anbefalt mønster: inline expand (accordion) i tidslinjen i ApplicationDetailModal, ikke tabs, ikke separat modal.

**Why:** Tidslinjen er allerede ankerstedet for intervjurunder. Notater er kontekstuelt knyttet til en spesifikk runde — å legge dem inline bevarer den mentale koblingen. Brukere i jobbsøkerstress trenger rask skanning og minimal navigasjon.

**How to apply:** Utvid InterviewDetailsCard med et notatfelt (textarea, collapsible). Vis kun de første ~60 tegnene av et eksisterende notat som sammendrag — full tekst vises ved expand. I ApplicationForm: legg `interview_notes` som felt i JSONB-strukturen under hver runde (samme mønster som eksisterende `interview_details`).

Forkastede mønstre og hvorfor:
- Tabs per runde: krever ekstra navigasjon, skjuler oversikt over alle runder
- Separat notat-modal: bryter kontekst, øker kognitiv belastning
- Globalt notater-felt per søknad (eksisterende `notes`): mister kobling til hvilken runde notatet gjelder

---

**Auto-kollaps av logistikk — etablerte UX-beslutninger (2026-04-25):**

- Logistikk (meeting_link, meeting_id, passcode, contact_person) kollapses automatisk når `interview_date` er passert. Notat alltid synlig.
- Manglende `interview_date` → logistikk alltid synlig (sikker fallback).
- Knappetekst: «Vis møtedetaljer» / «Skjul møtedetaljer» — ikke «Vis logistikk» (internt ord).
- ARIA-label må inkludere rundenummer: `aria-label="Vis møtedetaljer for runde 1"` — nødvendig når flere runder finnes i samme modal.
- Ingen localStorage-persistens — reset ved hver modal-åpning. Lokal `useState` i InterviewDetailsCard er tilstrekkelig.
- Hele sub-card kollapses (inkl. contact_person), ikke bare tekniske felt — enklere mental modell, contact_person er uansett tilgjengelig i søknadens generelle `contact`-felt.
