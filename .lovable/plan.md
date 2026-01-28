
# Datenschutzerklärung Update: Rechtliche Korrektur

## Zusammenfassung

Die aktuelle Datenschutzerklärung (v5.5) enthält mehrere rechtlich inkorrekte Aussagen, da sie noch die alte Architektur (Lovable Cloud + AI Gateway) beschreibt, obwohl du jetzt:
- **Externes Supabase** direkt nutzt (mit DPA/AVV)
- **Direkte API-Keys** für OpenAI, Google, Anthropic, Perplexity verwendest

---

## Erforderliche Änderungen

### 1. Version und Datum
**Zeile 17**

Aktuell:
```
Effective Date: January 26, 2026 | Version 5.5
```

Neu:
```
Effective Date: January 28, 2026 | Version 5.6
```

---

### 2. Sektion 5.1 - AI Provider Tabellen
**Zeilen 511-537 (Base Models) und 551-565 (Premium Models)**

Alle "(via Lovable AI Gateway)" Referenzen entfernen:

| Provider | Aktuell | Neu |
|----------|---------|-----|
| OpenAI | "(via Lovable AI Gateway)" | "(Direct API)" |
| Google LLC | "(via Lovable AI Gateway)" | "(Direct API)" |

---

### 3. Sektion 5.1 - API Gateway Services ENTFERNEN
**Zeilen 568-588**

Diese gesamte Untersektion wird gelöscht, da kein Lovable AI Gateway mehr verwendet wird:
- Tabelle mit "Lovable AI Gateway" als Provider
- Beschreibung "API routing for OpenAI and Google models"

---

### 4. Sektion 8.1 - Hosting aktualisieren
**Zeilen 987-1002**

Aktuell:
```
Our website is hosted on infrastructure provided by Lovable (Lovable Cloud), which utilizes 
Supabase for backend services...

Provider: Supabase, Inc. (via Lovable Cloud)
```

Neu:
```
Our website frontend is hosted on infrastructure provided by Lovable. Backend services including 
database, authentication, and edge functions are provided directly by Supabase, Inc.

Provider: Supabase, Inc. (Direct Integration)
```

---

### 5. Sektion 8.1 - DPA/AVV hinzufügen (NEUE Untersektion)
**Nach Zeile 1008**

Neue Untersektion einfügen:

```text
8.2 Data Processing Agreement

We have concluded a Data Processing Agreement (DPA / Auftragsverarbeitungsvertrag) with Supabase, Inc. 
in accordance with Art. 28 GDPR. This agreement ensures that Supabase processes personal data 
exclusively on our behalf and in compliance with our instructions.

The DPA covers:
- Technical and organizational measures for data security
- Sub-processor management and notification obligations  
- Data subject rights assistance
- Data deletion upon contract termination
- Audit rights and compliance verification

Supabase's DPA is available at: https://supabase.com/legal/dpa
```

---

### 6. Sektion 12 - Recipients Tabelle aktualisieren
**Zeilen 1129-1180**

**Zeile entfernen:**
- Lovable AI Gateway (komplette Tabellenzeile)

**Zeilen aktualisieren:**

| Recipient | Aktuell | Neu |
|-----------|---------|-----|
| OpenAI | "(via Lovable AI Gateway)" | "(Direct API)" |
| Google LLC | "(via Lovable AI Gateway)" | "(Direct API)" |
| Supabase | "Hosting, database" | "Hosting, database, authentication (with DPA per Art. 28 GDPR)" |

---

## Rechtliche Begründung

### Art. 28 DSGVO - Auftragsverarbeitung
Da Supabase als Auftragsverarbeiter fungiert (nicht als eigenständiger Verantwortlicher), ist die Dokumentation des AVV rechtlich erforderlich. Die DPA muss folgende Mindestanforderungen erfüllen:
- Gegenstand und Dauer der Verarbeitung
- Art und Zweck der Verarbeitung
- Kategorien betroffener Personen und Daten
- Pflichten und Rechte des Verantwortlichen

### Art. 46(2)(c) und Art. 45 DSGVO
Die Rechtsgrundlagen für Drittlandtransfers bleiben unverändert:
- **SCCs** für OpenAI, Anthropic, Perplexity, Resend
- **EU-US DPF Adequacy Decision** für Google und Supabase

### Transparenzpflicht (Art. 13/14 DSGVO)
Die Korrektur von "via Lovable AI Gateway" zu "Direct API" ist notwendig, um die tatsächlichen Datenflüsse korrekt abzubilden.

---

## Zusammenfassung der Dateien

| Datei | Änderungstyp |
|-------|--------------|
| `src/pages/PrivacyPolicy.tsx` | Update |

## Geschätzter Umfang

- ~10 gezielte Änderungen in einer Datei
- Keine strukturellen Änderungen am Rest der Anwendung
- Alle rechtlichen Grundlagen (DSGVO-Artikel) bleiben gültig
