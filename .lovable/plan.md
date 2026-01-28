
# Team-Kollaboration stärker hervorheben

## Zusammenfassung
Die Team-Zusammenarbeit ist ein Kernfeature von Synoptas Premium und muss prominenter auf der gesamten Website kommuniziert werden. Aktuell wird es erwähnt, aber nicht als zentrales Wertversprechen positioniert.

---

## Änderungen im Detail

### 1. Hero.tsx – Team-Fokus in der Subheadline verstärken

**Aktuell (Zeile 87-90):**
```
"Select 3 AI models. Weight them by what matters to you. 
Document, share, and defend your decisions with your team."
```

**Neu:**
```
"Select 3 AI models. Weight them by what matters to you.
Collaborate with your team. Document decisions together. Defend them with confidence."
```

**Begründung:** "Collaborate with your team" wird als eigenständiger Satz stärker betont.

---

### 2. Features.tsx – Team Workspaces als erstes Premium-Feature positionieren

**Aktuell:** Team Workspaces ist Feature Nr. 4 (von 6)

**Neu:** Team Workspaces auf Position 2 verschieben (nach "6 AI Models") und Beschreibung erweitern:

```
{
  title: "Team Workspaces",
  description: "Create up to 5 shared workspaces with 5 members each. Collaborate on decision records in real-time, share analyses across your organization, and maintain a unified audit trail. Only one Premium subscription required per team."
}
```

**Neue Reihenfolge:**
1. 6 AI Models, Your Choice
2. Team Workspaces (erweitert)
3. Custom Model Weighting
4. Consensus & Dissent Analysis
5. Personal Analytics Dashboard
6. Stakeholder-Ready Audit Reports

---

### 3. Features.tsx – Section Header erweitern

**Aktuell (Zeile 87):**
```
"Professional decision documentation for high-stakes choices"
```

**Neu:**
```
"Professional decision documentation for teams making high-stakes choices"
```

---

### 4. WhySynoptas.tsx – Team-Punkt prominenter und detaillierter

**Aktuell (Zeile 42):**
```
"Collaborate with your team in shared workspaces"
```

**Neu (auf Position 2 verschieben und erweitern):**
```
"Team workspaces: invite up to 5 members, share decisions, one subscription"
```

**Neue Reihenfolge "With Synoptas":**
1. 6 AI models available (GPT, Gemini, Claude, Perplexity)
2. Team workspaces: invite up to 5 members, share decisions, one subscription
3. Custom weighting: you control which perspective matters most
4. Consensus and dissent clearly identified with confidence scores
5. Personal dashboard tracks your decision patterns over time
6. Stakeholder-ready PDF exports on demand

---

### 5. HowItWorks.tsx – Schritt 4 Team-Fokus verstärken

**Aktuell (Zeile 7):**
```
"Acknowledge the decision is yours. Share with your team or export a stakeholder-ready PDF with timestamped reasoning."
```

**Neu:**
```
"Acknowledge the decision is yours. Share instantly with your team workspace. Export stakeholder-ready PDFs with full audit trails."
```

---

### 6. Pricing.tsx (Home) – Team-Features visuell hervorheben

**Aktuell:** Team-Features sind in der Liste, aber ohne besondere Hervorhebung

**Neu:** Gruppierte Darstellung mit Team-Überschrift:

Die Premium-Features in zwei Gruppen aufteilen:
- **Analyse-Features** (10 records, perspectives, alternatives, PDF)
- **Kollaboration** (Team Workspaces, Team Members) – mit eigenem Label "Team Collaboration"

---

### 7. Pricing.tsx (Seite) – Team-spezifische FAQ hinzufügen

**Neue FAQ hinzufügen:**

```
{
  question: "How does team collaboration work?",
  answer: "Premium subscribers can create up to 5 team workspaces with 5 members each. Team members can view and create shared decision records without needing their own Premium subscription – only the workspace owner needs Premium. Perfect for small teams, investment committees, or advisory boards."
}
```

---

### 8. CTA.tsx – Team-Messaging für alle User

**Aktuell (Zeile 82-83):**
- Premium: "10 daily analyses. Team workspaces. Personal analytics. Stakeholder-ready exports."
- Free: "Two free analyses daily. No credit card required. Results in 60 seconds."

**Neu:**
- Premium: "10 daily analyses. Collaborate with your team. Track patterns. Export audit-ready reports."
- Free: "Two free analyses daily. No credit card required. Upgrade for team collaboration."

---

### 9. CTA.tsx – Trust Indicators Team-Fokus

**Aktuell (Zeilen 113-117):**
```
<span>Consensus & Dissent Scores</span>
<span>No credit card needed</span>
<span>Results in 60 seconds</span>
```

**Neu:**
```
<span>Team Collaboration</span>
<span>Consensus & Dissent Scores</span>
<span>Results in 60 seconds</span>
```

---

## Technische Umsetzung

### Betroffene Dateien:
1. `src/components/home/Hero.tsx` – Subheadline
2. `src/components/home/Features.tsx` – Reihenfolge, Header, Beschreibung
3. `src/components/home/WhySynoptas.tsx` – Reihenfolge und Text
4. `src/components/home/HowItWorks.tsx` – Schritt 4
5. `src/components/home/Pricing.tsx` – Gruppierung der Features
6. `src/pages/Pricing.tsx` – Neue FAQ
7. `src/components/home/CTA.tsx` – Text und Trust Indicators

### Konsistente Terminologie:
- "Team Workspaces" (immer mit "Team" davor)
- "Collaborate" / "Collaboration" (aktive Sprache)
- "Share decisions" / "Shared decision records"
- "One subscription per team" (Kostenklarheit)
- "Up to 5 teams, 5 members each" (klare Limits)

---

## Erwartetes Ergebnis

Nach der Implementierung:
- Team-Kollaboration ist eines der ersten Features, die Besucher sehen
- Der Wert für Teams wird klar kommuniziert (ein Abo für alle)
- Konsistente Team-Messaging auf allen Seiten
- Premium-Upgrade wird für Teams attraktiver
