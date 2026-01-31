
# SEO und Google-Beschreibungen aktualisieren

## Analyse

Die aktuelle SEO-Konfiguration enthält veraltete Keywords, die nicht mehr zur neuen "Virtual Advisory Board" Positionierung passen:

**Veraltete Keywords (zu entfernen):**
- "decision documentation"
- "audit trail" 
- "due diligence"
- "decision records"
- "compliance documentation"
- "liability protection"
- "stakeholder reporting"

**Neue Keywords (zu verwenden):**
- "AI advisory board"
- "startup decisions"
- "second opinions"
- "business analysis"
- "founder tools"
- "strategic advice"
- "multi-AI perspectives"

---

## Betroffene Dateien

### 1. src/components/seo/SEOHead.tsx
- Default-Keywords im Komponenten-Interface von "compliance" auf "startup/advisory" umstellen
- Zeile 16: Neue Standard-Keywords definieren

### 2. index.html
- Titel bereits korrekt: "Your AI Advisory Board for Startup Decisions"
- Beschreibung bereits korrekt: "Get structured second opinions..."
- Keywords (Zeile 14) bereits aktualisiert
- Structured Data (Zeile 99-124) bereits passend
- Keine Aenderungen noetig

### 3. src/pages/Home.tsx
- Keywords bereits aktualisiert (Zeile 81)
- Keine Aenderungen noetig

### 4. src/pages/Pricing.tsx
- Keywords bereits passend (Zeile 64-65, 84-85)
- Keine Aenderungen noetig

### 5. src/pages/ValidationPlatform.tsx
- Keywords bereits passend (Zeile 424-425, 446-447)
- Keine Aenderungen noetig

### 6. src/pages/Dashboard.tsx
- Keywords bereits passend (Zeile 48)
- Keine Aenderungen noetig

### 7. src/pages/Contact.tsx
- Keywords sind neutral ("contact, support, help, feedback")
- Keine Aenderungen noetig

### 8. src/pages/Auth.tsx
- SEOHead ohne Keywords (noindex=true)
- Keine Aenderungen noetig

### 9. src/pages/Profile.tsx
- SEOHead ohne Keywords (noindex=true)
- Keine Aenderungen noetig

---

## Technische Umsetzung

### SEOHead.tsx - Zeile 16 anpassen

```text
Vorher:
keywords = "decision documentation, audit trail, due diligence, decision records, compliance documentation, liability protection, stakeholder reporting"

Nachher:
keywords = "AI advisory board, startup decisions, second opinions, business analysis, investor-ready, founder tools, strategic advice"
```

---

## Zusammenfassung

Nur eine Datei muss geaendert werden: **SEOHead.tsx**

Die Default-Keywords werden von "compliance/audit" Terminologie auf "startup/advisory" Terminologie umgestellt. Alle anderen Dateien haben bereits passende Keywords oder ueberschreiben die Defaults mit seitenspezifischen Keywords.
