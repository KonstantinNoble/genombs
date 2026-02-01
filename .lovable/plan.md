

# Plan: Datenschutzerklärung für Business Context Feature aktualisieren

## Zusammenfassung der notwendigen Ergänzungen

Das Business Context Feature erfordert Ergänzungen in der Privacy Policy, da:
1. **Neue Datenkategorien** gespeichert werden (Geschäftskontextdaten)
2. **Neuer Drittanbieter** (Firecrawl) für Website-Scraping genutzt wird
3. **Daten an KI-Modelle** übergeben werden (als zusätzlicher Kontext)

---

## Abschnitt 1: Neuer Abschnitt "5.9 Business Context" (Premium Feature)

**Position:** Nach Abschnitt 5.8 (Team Workspaces), vor Abschnitt 6

**Inhalt:**

### 5.9 Business Context (Premium)

Premium-Nutzer können einen Geschäftskontext erstellen, der automatisch in alle KI-Analysen einfließt, um personalisierte und relevantere Empfehlungen zu erhalten.

#### Erfasste und gespeicherte Daten

Folgende Daten werden in der Datenbank gespeichert und können von Ihnen jederzeit bearbeitet oder gelöscht werden:

| Datenfeld | Beschreibung |
|-----------|--------------|
| Branche | Ihre Branche (z.B. SaaS, E-Commerce, FinTech) |
| Unternehmensphase | Entwicklungsstand (Idee bis Wachstumsphase) |
| Teamgröße | Anzahl der Mitarbeiter |
| Umsatzbereich | Monatlicher Umsatzbereich |
| Zielmarkt | B2B, B2C, B2B2C, D2C |
| Geografischer Fokus | Lokal, National, EU, US, Global |
| Website-URL | Ihre Unternehmenswebsite (optional) |
| Website-Zusammenfassung | Automatisch generierte Zusammenfassung Ihrer Website (max. 1000 Zeichen) |

#### Website-Scanning (Firecrawl)

Wenn Sie eine Website-URL angeben und den Scan-Button klicken, wird Ihre Website über den Dienst Firecrawl gescrapt:

**Anbieter:** Firecrawl, Inc.
**Standort:** Vereinigte Staaten
**Datenschutzrichtlinie:** https://www.firecrawl.dev/privacy

**Daten, die an Firecrawl übermittelt werden:**
- Die von Ihnen eingegebene Website-URL

**Daten, die von Firecrawl zurückgegeben und gespeichert werden:**
- Markdown-Textinhalt der Hauptseite (ohne JavaScript, Tracking-Skripte, etc.)
- Eine gekürzte Zusammenfassung (max. 1000 Zeichen) wird in unserer Datenbank gespeichert

**Nutzungslimit:** Maximal 3 Website-Scans pro 24-Stunden-Zeitfenster (rollendes Fenster)

#### Übergabe an KI-Modelle

Der gespeicherte Business Context (einschließlich Website-Zusammenfassung) wird automatisch als zusätzlicher Kontext an die von Ihnen ausgewählten KI-Modelle übermittelt (siehe Abschnitt 5.1), um personalisierte Empfehlungen zu ermöglichen.

**Wichtig:** 
- Die KI-Modelle erhalten Ihren Business Context zusätzlich zu Ihrer Validierungsanfrage
- Dadurch können OpenAI, Google, Anthropic und Perplexity Ihren Geschäftskontext verarbeiten
- Die Datenschutzrichtlinien dieser Anbieter gelten entsprechend (siehe Abschnitt 5.1)

#### Datenspeicherung und Löschung

- Der Business Context wird dauerhaft gespeichert, bis Sie ihn manuell löschen
- Sie können den gesamten Context über den "Clear Context" Button in der Anwendung löschen
- Bei Löschung Ihres Benutzerkontos wird der Business Context automatisch gelöscht (CASCADE)

#### Rechtsgrundlage

- **Art. 6(1)(b) DSGVO:** Verarbeitung ist für die Vertragserfüllung erforderlich (Bereitstellung personalisierter KI-Analysen als Teil des Premium-Dienstes)
- **Art. 6(1)(a) DSGVO:** Einwilligung durch aktive Nutzung des Features (Sie wählen selbst, ob Sie den Business Context ausfüllen und einen Website-Scan durchführen)

---

## Abschnitt 2: Tabelle "Recipients of Personal Data" (Abschnitt 12) erweitern

**Neue Zeile hinzufügen:**

| Empfänger | Zweck | Übermittelte Daten | Übermittlungsgrundlage |
|-----------|-------|-------------------|----------------------|
| **Firecrawl, Inc.** | Website-Scraping für Business Context | Website-URL | Art. 46(2)(c) DSGVO (Standardvertragsklauseln) |

---

## Abschnitt 3: Tabelle "Categories of Personal Data" (Abschnitt 11) erweitern

**Neue Zeile hinzufügen:**

| Kategorie | Beispiele | Zweck |
|-----------|-----------|-------|
| **Business Context** (Premium) | Branche, Unternehmensphase, Teamgröße, Umsatz, Zielmarkt, Geo-Fokus, Website-URL, Website-Zusammenfassung | Personalisierte KI-Analysen |

---

## Abschnitt 4: Third-Party Service Cookies Tabelle (falls zutreffend)

Firecrawl setzt keine Cookies auf Ihrer Website, da:
- Die API-Anfrage serverseitig über eine Edge Function erfolgt
- Keine Client-seitige Integration stattfindet

Daher ist keine Aktualisierung der Cookie-Tabelle erforderlich.

---

## Abschnitt 5: Versionsverlauf aktualisieren

**Neue Zeile am Anfang:**

```
Version 5.7 (1. Februar 2026): 
- Hinzufügung von Abschnitt 5.9 "Business Context" 
- Dokumentation der Firecrawl-Integration für Website-Scraping
- Aktualisierung der Datenempfänger-Tabelle
- Aktualisierung der Datenkategorien-Tabelle
```

---

## Dateiänderungen

| Datei | Änderung |
|-------|----------|
| `src/pages/PrivacyPolicy.tsx` | Neuer Abschnitt 5.9 einfügen (nach Zeile ~765), Tabelle Abschnitt 11 erweitern (Zeile ~1109), Tabelle Abschnitt 12 erweitern (Zeile ~1175), Versionsverlauf aktualisieren |

---

## Rechtliche Hinweise

1. **Firecrawl DPA:** Prüfe, ob Firecrawl einen Auftragsverarbeitungsvertrag (DPA) per Art. 28 DSGVO anbietet. Falls ja, sollte dieser abgeschlossen werden.

2. **Standardvertragsklauseln (SCCs):** Da Firecrawl in den USA sitzt und wahrscheinlich nicht unter das EU-US Data Privacy Framework fällt, sind SCCs die richtige Übermittlungsgrundlage.

3. **Transparenz:** Die Nutzer müssen vor dem ersten Scan darüber informiert werden, dass ihre URL an Firecrawl übermittelt wird. Dies könnte auch als Info-Tooltip neben dem Scan-Button ergänzt werden.

