
# Website-Texte für Team-Funktionen aktualisieren

## Zusammenfassung
Die neue Team/Workspace-Funktionalität muss auf der gesamten Website hervorgehoben werden. Premium-User können Teams erstellen (bis zu 5), Mitglieder einladen (bis zu 5 pro Team), und gemeinsam an Decision Records arbeiten. Dies verändert das Wertversprechen von Synoptas von einem Einzelnutzer-Tool zu einer Kollaborationsplattform.

---

## Betroffene Dateien und Änderungen

### 1. Hero.tsx – Tagline und Trust Indicators aktualisieren

**Aktuelle Texte:**
- Subtitle: "Multi-AI Analysis Platform"
- Headline: "One Question. Six AI Perspectives."
- Subheadline: "Select 3 AI models..."
- Trust Indicators: "6 AI Models • Custom Weighting • Ready in 60 seconds"

**Neue Texte:**
- Subtitle: "Multi-AI Decision Platform"
- Headline bleibt (stark und klar)
- Subheadline: "Select 3 AI models. Weight them by what matters to you. Document, share, and defend your decisions with your team."
- Trust Indicators: "6 AI Models • Team Workspaces • Audit-Ready Exports"

---

### 2. Features.tsx – Neue Feature-Karte für Teams hinzufügen

**Aktuelle Features (5):**
1. 6 AI Models, Your Choice
2. Custom Model Weighting
3. Consensus & Dissent Analysis
4. Personal Analytics Dashboard
5. Stakeholder-Ready Audit Reports

**Neue Features (6) – Team-Feature einfügen:**
1. 6 AI Models, Your Choice
2. Custom Model Weighting
3. Consensus & Dissent Analysis
4. **NEU: Team Workspaces** – "Create shared workspaces for your team. Collaborate on decision records, share analyses, and maintain a unified audit trail across your organization."
5. Personal Analytics Dashboard
6. Stakeholder-Ready Audit Reports

---

### 3. Pricing.tsx (Home-Komponente) – Team-Feature im Premium-Plan hervorheben

**Aktuelle Premium-Features:**
- 10 decision records per day
- Full perspective documentation
- 5-7 prioritized action items
- Strategic alternatives (Plan B, C)
- Competitive context analysis
- Stakeholder-ready PDF exports

**Neue Premium-Features:**
- 10 decision records per day
- Full perspective documentation
- 5-7 prioritized action items
- **NEU: Team Workspaces (up to 5 teams)**
- **NEU: Invite up to 5 members per team**
- Strategic alternatives (Plan B, C)
- Stakeholder-ready PDF exports

---

### 4. WhySynoptas.tsx – Team-Kollaboration als Vorteil hinzufügen

**Aktuelle "With Synoptas"-Punkte:**
1. 6 AI models available
2. Custom weighting
3. Consensus and dissent clearly identified
4. Personal dashboard tracks decision patterns
5. Stakeholder-ready PDF exports

**Neue "With Synoptas"-Punkte:**
1. 6 AI models available (GPT, Gemini, Claude, Perplexity)
2. Custom weighting: you control which perspective matters most
3. Consensus and dissent clearly identified with confidence scores
4. **Collaborate with your team in shared workspaces** (ersetzt Dashboard-Punkt)
5. Personal dashboard tracks your decision patterns over time
6. Stakeholder-ready PDF exports on demand

---

### 5. HowItWorks.tsx – Schritt 4 erweitern

**Aktueller Schritt 4:**
"Confirm ownership and export your audit report – Acknowledge the decision is yours. Export a stakeholder-ready PDF with timestamped reasoning."

**Neuer Schritt 4:**
"Confirm, share, and export – Acknowledge the decision is yours. Share with your team or export a stakeholder-ready PDF with timestamped reasoning."

---

### 6. FAQ.tsx – Neue FAQ für Teams hinzufügen

**Neue FAQ hinzufügen (Position 7):**

**Frage:** "Can I collaborate with my team?"

**Antwort:** "Yes. Premium subscribers can create up to 5 team workspaces with up to 5 members each. Team members can create shared decision records, view analyses, and maintain a unified audit trail. Only the workspace owner needs a Premium subscription."

---

### 7. Pricing.tsx (Seite) – Vergleichstabelle erweitern

**Neue Zeile in Vergleichstabelle:**
| Feature | Free | Premium |
|---------|------|---------|
| ... | ... | ... |
| **Team Workspaces** | — | Up to 5 |
| **Team Members** | — | 5 per team |

---

### 8. CTA.tsx – Text für Teams anpassen

**Aktueller Text (Premium-User):**
"10 daily analyses. Consensus & dissent scores. Personal analytics. PDF exports on demand."

**Neuer Text (Premium-User):**
"10 daily analyses. Team workspaces. Personal analytics. Stakeholder-ready exports."

---

## Technische Details

### Dateien die bearbeitet werden:
1. `src/components/home/Hero.tsx` – Trust Indicators und Subheadline
2. `src/components/home/Features.tsx` – Neue Feature-Karte
3. `src/components/home/Pricing.tsx` – Premium-Features erweitern
4. `src/components/home/WhySynoptas.tsx` – Neue Bullet Points
5. `src/components/home/HowItWorks.tsx` – Schritt 4 Text
6. `src/components/home/FAQ.tsx` – Neue FAQ
7. `src/pages/Pricing.tsx` – Vergleichstabelle
8. `src/components/home/CTA.tsx` – Premium-User Text

### Konsistente Terminologie:
- "Team Workspaces" (nicht "Teams" allein)
- "Shared decision records" (nicht "shared analyses")
- "Unified audit trail" (für Compliance-Fokus)
- "Collaborate" statt "work together"

### Styling-Hinweise:
- Team-Feature in Premium-Preistabelle mit `highlight: true` markieren
- Neue FAQ-Karte im gleichen Stil wie bestehende
- Trust Indicators bleiben im minimalistischen Stil (Bullet-Punkte)

---

## Erwartetes Ergebnis

Nach der Implementierung:
- Besucher sehen sofort, dass Synoptas Team-Kollaboration unterstützt
- Premium-Wert wird durch Team-Features verstärkt
- Konsistente Messaging auf allen Seiten
- FAQ beantwortet häufige Teamfragen proaktiv
