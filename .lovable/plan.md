

## Homepage und Pricing: Inhaltliche Korrektur

Alle Texte, Zahlen und Feature-Listen werden an die tatsaechlichen Produktfunktionen angepasst, die aus dem Code abgeleitet wurden.

---

### Was ist falsch und wie wird es korrigiert

**Credit-System (statt "3 Scans/Monat")**
- Tatsaechlich: Taegliches Credit-System
- Free: 20 Credits/Tag, Premium: 100 Credits/Tag
- Scan-Kosten variieren je nach Modell (5-10 Credits), Chat-Kosten 1-5 Credits
- Darstellung: "20 daily credits" (Free) / "100 daily credits" (Premium)

**Feature-Listen (Free vs Premium)**
Die tatsaechlichen Unterschiede aus dem Code:
- Free: 2 URL-Felder (eigene + 1 Competitor), Standard-Modelle (Gemini Flash, GPT Mini)
- Premium: 4 URL-Felder (eigene + 3 Competitors), Alle AI-Modelle, PDF-Export, Priority Support
- Scoring-Kategorien (beide): Findability, Mobile Usability, Offer Clarity, Trust & Proof, Conversion Readiness
- PageSpeed Insights (beide Tiers)
- AI Chat (beide, aber Premium hat mehr Modelle)

**Stats-Leiste**
- "500+ Websites Scanned" entfernen (nicht belegbar)
- "12 Market Segments" entfernen (nicht belegbar)
- Ersetzen durch verifizierbare Fakten: "5 AI Models", "5 Score Categories", "< 60s Per Scan", "PageSpeed Included"

**Testimonials**
- Komplette Sektion entfernen (fiktive Personen/Firmen sind unserioes)
- Alternativ: Platzhalter-Sektion mit "Join hundreds of businesses..." ohne Fake-Zitate

**FAQ (Homepage)**
- "SimilarWeb traffic data" Referenz entfernen (nicht implementiert)
- "3 free growth reports" korrigieren zu Credit-System-Beschreibung
- Antworten an tatsaechliche Features anpassen

**Comparison Table (Homepage)**
- "Cost per Scan" Zeile: "Free / $26.99/mo unlimited" aendern zu "Free daily credits / $26.99/mo"
- Rest bleibt weitgehend korrekt

**Pricing Page spezifisch**
- Free Card: "3 growth reports per month" aendern zu "20 credits per day"
- Premium Card: "Unlimited growth reports" aendern zu "100 credits per day"
- Feature-Listen komplett ueberarbeiten basierend auf tatsaechlichen Code-Features
- FAQ: "What happens when I hit the free limit?" anpassen an taegliches Reset

**FeatureComparisonTable.tsx**
- "Scans per month: 3 / Unlimited" aendern zu "Daily credits: 20 / 100"
- Feature-Zeilen an tatsaechliche Produkt-Features anpassen
- Neue Zeilen: "AI Models", "Competitor URLs", "Daily Credit Reset"

---

### Geaenderte Dateien

1. `src/pages/Home.tsx` — Stats, Features, Use Cases, Comparison Table, Testimonials, FAQ, CTA-Texte
2. `src/pages/Pricing.tsx` — Feature-Listen (Free/Premium), FAQ-Antworten, Preis-Beschreibungen
3. `src/components/genome/FeatureComparisonTable.tsx` — Alle Feature-Zeilen an tatsaechliche Funktionen anpassen

Keine neuen Abhaengigkeiten. Keine strukturellen Aenderungen, nur inhaltliche Korrekturen.

