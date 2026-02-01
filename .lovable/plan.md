

# Plan: Homepage verkürzen und Business Context / Website-Scanning als Premium-Feature bewerben

## Analyse: Warum wirkt die Homepage überladen?

Die aktuelle Homepage hat **8 Sektionen** nach dem Hero:
1. PainPoints (4 Schmerzpunkte)
2. WhySynoptas (Vergleich)
3. Testimonials (4 Zitate)
4. HowItWorks (4 Schritte)
5. Features (6 Features)
6. Pricing (2 Pläne)
7. FAQ (11 Fragen)
8. CTA

**Zusätzlich** enthält der Hero bereits einen ProductShowcase mit 3 Browser-Mockups und "How It Works" – das wiederholt sich mit der separaten HowItWorks-Sektion.

---

## Teil 1: Homepage verkürzen

### Änderungen an `src/pages/Home.tsx`

**Entfernen:**
- `HowItWorks` Komponente (redundant zum ProductShowcase im Hero)
- `WhySynoptas` Komponente (der Vergleich ist weniger überzeugend als echte Testimonials)

**Neue Sektionsreihenfolge:**
```text
Hero (inkl. ProductShowcase)
  ↓
PainPoints (Problem aufzeigen)
  ↓
Features (Lösung präsentieren) - Hier Business Context + URL-Scan hinzufügen
  ↓
Testimonials (Social Proof)
  ↓
Pricing (nur für nicht-eingeloggte oder Free-User)
  ↓
FAQ (reduziert auf 6-7 wichtigste Fragen)
  ↓
CTA (Abschluss)
```

### Änderungen an `src/components/home/FAQ.tsx`

**Reduzieren von 11 auf 7 FAQs:**
Behalten:
1. "Is this for solo founders?"
2. "How is this different from just asking ChatGPT?"
3. "What do 'consensus' and 'dissent' mean?"
4. "Can I share analyses with my co-founder or team?"
5. "What's the difference between Free and Premium?"
6. "Can I try it before paying?"
7. "Can I cancel anytime?"

Entfernen:
- "Can I use this for hiring decisions?" (zu spezifisch)
- "Will this replace my advisor?" (defensiv)
- "What kinds of decisions should I use this for?" (redundant mit ersten FAQ)
- "What happens to my analyses?" (Details für Privacy Policy)

---

## Teil 2: Business Context + Website URL als Premium-Feature bewerben

### Neue Feature-Karte in `src/components/home/Features.tsx`

**Neues Feature hinzufügen (Position 3 oder 4):**

```typescript
{
  title: "AI That Knows Your Business",
  description: "Set your industry, stage, and team size – the AI adapts every recommendation. Premium: scan your website for even deeper context.",
  isPremium: true
}
```

### Neue Feature in `src/components/home/Pricing.tsx`

**Premium-Liste erweitern:**
```typescript
{ text: "Business Context with Website Scanning", highlight: true }
```

### Änderungen an `src/pages/Pricing.tsx`

**Vergleichstabelle erweitern:**
```typescript
{ name: "Business Context Profile", free: "✓", premium: "✓" },
{ name: "Website Auto-Scan", free: "—", premium: "✓" },
```

**FAQ auf Pricing-Seite hinzufügen:**
```typescript
{
  question: "What is Business Context?",
  answer: "Your business profile (industry, stage, team size, revenue, market, region) that's automatically included in every analysis. All users can set this. Premium subscribers can also add their website URL and we'll automatically scan it for deeper context."
}
```

---

## Zusammenfassung der Änderungen

| Datei | Aktion | Details |
|-------|--------|---------|
| `src/pages/Home.tsx` | Entfernen | `HowItWorks` und `WhySynoptas` Imports und Komponenten |
| `src/components/home/Features.tsx` | Hinzufügen | Neues Feature "AI That Knows Your Business" mit Premium-Badge |
| `src/components/home/Pricing.tsx` | Erweitern | "Business Context with Website Scanning" als Premium-Feature |
| `src/pages/Pricing.tsx` | Erweitern | Vergleichstabelle + neue FAQ |
| `src/components/home/FAQ.tsx` | Reduzieren | Von 11 auf 7 FAQs |

---

## UI-Vorschau: Neue Features-Sektion

```text
┌──────────────────────────────────────────────────────────┐
│  01  6 Perspectives, You Pick 3                          │
│      GPT, Gemini, Claude, Perplexity – each thinks       │
│      differently. Pick 3 that match your decision type.  │
├──────────────────────────────────────────────────────────┤
│  02  Share with Co-Founders and Advisors                 │
│      Not a solo founder? Invite your team...             │
├──────────────────────────────────────────────────────────┤
│  03  AI That Knows Your Business        [Premium Badge]  │ ← NEU
│      Set your industry, stage, and team size – the AI    │
│      adapts. Premium: scan your website for deeper...    │
├──────────────────────────────────────────────────────────┤
│  04  Weight What Matters to You                          │
│      Risk-averse? Growth-focused? Adjust the sliders...  │
├──────────────────────────────────────────────────────────┤
│  05  Know Where to Dig Deeper                            │
│      When perspectives agree, move fast. When they...    │
├──────────────────────────────────────────────────────────┤
│  06  Learn From Your Past Decisions                      │
│      See your decision history. Notice patterns...       │
├──────────────────────────────────────────────────────────┤
│  07  Investor-Ready Documentation                        │
│      Export PDFs that show what you considered...        │
└──────────────────────────────────────────────────────────┘
```

---

## Erwartetes Ergebnis

**Vorher:** 8 Sektionen + redundanter ProductShowcase
**Nachher:** 6 Sektionen, fokussierter, Business Context prominent beworben

**Premium-Differenzierung:**
- Business Context Dropdown-Felder → **Alle Nutzer**
- Website URL + Auto-Scan → **Premium** (klar kommuniziert mit Badge)

