---
name: UI-mønster analyse for intervjurunde-notater
description: WCAG-vurdering av collapsible, tabs, tidslinje-expand og alltid-synlig for intervjurunde-notater (2026-04-25)
type: project
---

Analyse gjort 2026-04-25 i forbindelse med utvidelse av intervjurunde-funksjonalitet.

Anbefalt mønster: alltid-synlig tekst er enklest å implementere korrekt. Tidslinje med inline-expand (disclosure) er nest best fordi infrastrukturen allerede eksisterer.

Tabs er mest risikabelt pga. krav til arrow-key-navigasjon og roving tabindex.

Accordion (collapsible) er trygt hvis aria-expanded og aria-controls implementeres riktig, og knappen er ekte <button>.

**Why:** Minimerer risiko for WCAG 2.1 AA-brudd som kan utløse tvangsmulkt under norsk forskrift 2013-06-21-732.
**How to apply:** Ved implementering, prioriter alltid-synlig eller disclosure-mønster fremfor tabs.
