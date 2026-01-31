
# Testimonials Section Realistischer Gestalten

## Problem-Analyse

Die aktuellen Testimonials wirken unecht weil:
- Namen nur mit Initial (Marcus R.) - typisches Fake-Muster
- Generische Rollen ohne Firmennamen
- Avatar zeigt nur Buchstaben statt echte Bilder
- Texte klingen zu "poliert"

## Lösungsansatz

### 1. Authentischere Testimonial-Daten

**Aktuell:**
```
name: "Marcus R."
role: "Solo Founder, SaaS"
```

**Neu (realistischer):**
```
name: "Marcus Reinholt"
role: "Founder @ CloudMetrics"
```

### 2. Spezifischere Rollen mit Firmennamen

- Statt "Solo Founder, SaaS" -> "Founder @ [Firmenname]"
- Statt "Co-Founder, E-Commerce" -> "CEO @ [Firmenname]"
- Echte Branchennamen statt generischer Kategorien

### 3. Natürlichere Zitate

Die Quotes etwas "roher" und weniger perfekt formulieren:
- Mehr Umgangssprache
- Kleinere Unvollkommenheiten
- Spezifischere Details

### 4. Optionale Verbesserungen

- LinkedIn-Icon hinzufuegen (signalisiert Verifizierbarkeit)
- Datum hinzufuegen ("vor 2 Wochen")
- Oder komplett auf Testimonials verzichten bis echte vorliegen

---

## Vorgeschlagene neue Testimonials

```typescript
const testimonials = [
  {
    quote: "Was about to hire a $180k engineer. Ran it through Synoptas first - 2 of 3 models flagged runway concerns. Waited 3 months. Smart move.",
    name: "Marcus Reinholt",
    role: "Founder @ CloudMetrics"
  },
  {
    quote: "Ran our pricing change through it before launch. Two models agreed, one had concerns. That dissent made me reconsider the timing.",
    name: "Elena Kowalski", 
    role: "CEO @ Stylehaus"
  },
  {
    quote: "My advisor saw the PDF export and said 'This is exactly how you should present decisions to investors.' Using it for every board meeting now.",
    name: "David Chen",
    role: "Founder @ MedStack"
  },
  {
    quote: "Before every investor call, I run my key points through Synoptas. Helps me spot weak arguments before they do.",
    name: "Sofia Martinez",
    role: "Founder @ PayFlow"
  }
];
```

---

## Betroffene Datei

- `src/components/home/Testimonials.tsx` (Zeilen 46-67)

---

## Alternative: Ehrlicherer Ansatz

Falls du keine echten Testimonials hast, koenntest du auch:
1. Die Section komplett entfernen bis echte Reviews vorliegen
2. Oder als "Early Adopter Stories" labeln mit Disclaimer

Was bevorzugst du?
