---
name: Kodebase ARIA-mønstre
description: Etablerte og manglende tilgjengelighetsmønstre i Modal, ApplicationCard, ApplicationDetailModal per 2026-04-25
type: project
---

Modal.jsx har solid WCAG-dekning: role="dialog", aria-modal="true", aria-labelledby, focus trap, Escape-lukking, fokusretur til utløser via triggerRef. Første fokus settes på lukkeknappen (ikke ideelt — første interaktive element i innholdet er bedre).

ApplicationCard.jsx bruker usynlig absolutt-posisjonert knapp over hele kortet med aria-label. Dette gir tastaturtilgang men skjuler annet innhold fra skjermlesere fordi knappen overlapper alt. Ingen aria-hidden på dekorativt innhold i kortet.

ApplicationDetailModal.jsx: dl/dt/dd for metadata er korrekt semantikk. Timeline er ol med aria-label. Dekorative prikker og linjer har aria-hidden="true". Ekstern lenke har aria-label med "(åpnes i ny fane)". Ingen dynamisk aria-live for statusoppdateringer.

**Why:** Disse mønstrene er etablert og bør videreføres ved ny funksjonalitet.
**How to apply:** Ny intervjurunde-notat-UI skal bygge på samme aria-labelledby/describedby-konvensjon og bruke aria-expanded på toggle-knapper.
