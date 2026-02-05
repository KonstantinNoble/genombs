
## Ziel
Sicherstellen, dass bei URL-Änderungen **keine alten Website-Scans/alte Website-Inhalte** mehr in die KI-Anfragen und die Meta-Evaluation “durchrutschen” und dass die Website-Infos **konsistent** von allen Modellen und im finalen Ergebnis berücksichtigt werden.

---

## Was sehr wahrscheinlich passiert (Root Cause)
Aktuell werden beim Ändern der Website-URL nur diese Daten aktualisiert:

- `website_url` wird per Auto-Save (upsert) gespeichert ✅  
- **Aber** `website_summary` und `website_scraped_at` bleiben im Datensatz **stehen** ❌

Das führt zu einer “Anomalie”:

- Du gibst eine **neue URL** ein
- In der Datenbank steht dann:
  - `website_url = neu`
  - `website_summary = alt` (vom vorherigen Scan)
  - `website_scraped_at = alt` (Zeitpunkt vom alten Scan)
- Die KI bekommt anschließend **beides** im Prompt:
  - “Company Website: neue URL”
  - “Website Analysis: alter Inhalt”
- Je nach Modell wird mal eher die URL, mal eher die Summary “geglaubt” → **Inkonsistenz** (genau dein Symptom)
- Zusätzlich zeigt dein UI nach URL-Wechsel ggf. fälschlich “bereits gescannt”/keinen Scan-Button, weil `website_scraped_at` noch gesetzt ist.

Wichtig: Dein zuletzt implementierter Fix (frischen Context vor `validate()` laden) sorgt zwar dafür, dass die **neueste DB-Version** genutzt wird – aber wenn die DB-Version selbst widersprüchlich ist (neue URL + alte Summary), bleibt das Problem.

---

## Umsetzung: Fix auf 2 Ebenen (Frontend + optional Backend-Härtung)

### A) Frontend-Fix (Pflicht): Alte Scan-Daten beim URL-Wechsel invalidieren
**Datei:** `src/hooks/useBusinessContext.ts`  
**Stelle:** `autoSaveField("website_url", ...)`

**Änderung:**
- Wenn `field === "website_url"` und sich die URL **wirklich geändert** hat (neuer Wert ≠ alter Wert), dann beim Upsert zusätzlich setzen:
  - `website_summary: null`
  - `website_scraped_at: null`
  - optional auch `scan_count`/`scan_window_start` **nicht** anfassen (das sind Limits, die sollten bleiben)

**Warum das wirkt:**
- Damit gibt es nach URL-Wechsel keinen Zustand mehr “neue URL + alter Website-Scan”.
- Das UI erkennt wieder korrekt: “Scan nötig”.
- Alle Modelle erhalten im Prompt keinen alten Website-Inhalt mehr.

**Zusätzlich im lokalen React-State:**
- `setContext(...)` muss beim URL-Wechsel ebenfalls `website_summary` und `website_scraped_at` auf `null` setzen, damit die UI sofort konsistent ist.

**Edge Case (erste Nutzung / context noch null):**
- Wenn `prev` in `setContext` `null` ist, sollte `autoSaveField` nach erfolgreichem Upsert einmal `await loadContext()` ausführen oder einen Minimal-Context setzen, damit die UI nicht “context bleibt null” ist. (Das ist nicht zwingend für den Bug, macht aber das Verhalten sauber.)

---

### B) UI-Logik-Fix (Pflicht): “Scan notwendig” korrekt anzeigen
**Datei:** `src/components/validation/BusinessContextPanel.tsx`  
**Stelle:** `needsWebsiteScan()`

**Erweiterung der Logik:**
- Scan-Button soll erscheinen, wenn:
  - Premium, URL gültig, und
  - entweder `website_scraped_at` fehlt **oder** `website_summary` fehlt  
  - (nach Fix A ist das automatisch gegeben, sobald URL geändert wurde)

**Zusätzlich:**
- Wenn `website_summary` null ist, im Panel ein klarer Hinweis:
  - “Website wurde für diese URL noch nicht gescannt – Scan nötig, damit Website-Inhalte berücksichtigt werden.”

Damit ist es für dich als Nutzer sofort sichtbar, warum die KI ggf. generischer bleibt.

---

### C) Optional aber stark empfohlen: Meta-Evaluation bekommt Business Context direkt
Du hast aktuell in `useMultiAIValidation.ts` beim Call von `meta-evaluation` **kein** `businessContext` dabei.  
Die Meta-Evaluation kann dann “Website-Inhalte” nur berücksichtigen, wenn sie in den Modellantworten ausreichend drinstehen. Wenn ein Modell die Website ignoriert, kann die Meta-Evaluation diesen Kontext nicht zuverlässig “zurückholen”.

**Frontend:**
- **Datei:** `src/hooks/useMultiAIValidation.ts`
- Beim Request an `meta-evaluation` zusätzlich mitschicken:
  - `businessContext: businessContext || null`  
  (in deinem Flow wäre das der `freshContext`, den du schon vor `validate()` lädst)

**Backend-Funktion:**
- **Datei:** `supabase/functions/meta-evaluation/index.ts`
- Request-Body um `businessContext` erweitern und im Prompt für den “Formatting/Polish”-Schritt explizit einfügen, z.B.:
  - `BUSINESS CONTEXT: ...` mit `website_url` und `website_summary`
- So kann die Formatierungs-KI die finalen Texte konsistent an der Website ausrichten, selbst wenn einzelne Modelle schwächer “tailoren”.

**Wichtig zur Umgebung:**
- Dein Frontend nutzt einen externen Backend-Client (`src/lib/supabase/external-client.ts`).  
  Wenn du `meta-evaluation` änderst, musst du diese Backend-Funktion auch in deinem externen Backend aktualisieren, sonst greift nur der Frontend-Teil.

---

### D) Optional: Prompt-Härtung für “alle Modelle sollen Website wirklich erwähnen”
Wenn du möchtest, dass jede Modellantwort sichtbar “beweist”, dass sie Website/Scan berücksichtigt hat:
- In den System-Prompts (multi-ai-query) ergänzen:
  - “Wenn Website Analysis vorhanden ist, nenne in Summary/Reasoning mindestens 2 konkrete Punkte daraus.”
- Das erhöht Konsistenz, kann aber Antworten etwas “steifer” machen. Ich würde es erst nach A+B testen.

---

## Testplan (End-to-End)
1) Öffne `/validate`
2) Setze URL A, scanne Website, prüfe: Summary sichtbar
3) Ändere URL auf URL B (ohne Scan)
   - Erwartung nach Fix: Summary verschwindet sofort, “Scan nötig” erscheint
4) Starte Validierung ohne Scan
   - Erwartung: Kein Modell sollte Inhalte von URL A verwenden; ggf. Hinweis “nicht gescannt”
5) Scanne URL B, starte Validierung erneut
   - Erwartung: Mehrere Modelle + Meta-Evaluation referenzieren sichtbar Website-Inhalte von URL B

---

## Ergebnis (Was danach besser ist)
- Keine “alte Website-Inhalte” mehr nach URL-Änderungen
- Scan-Button/UX ist korrekt (URL-Wechsel ⇒ Scan erforderlich)
- Weniger Modell-Inkonsistenzen, weil der Prompt nicht mehr widersprüchliche Website-Daten enthält
- Optional: Meta-Evaluation wird auch dann website-spezifisch, wenn einzelne Modelle schwächer tailoren
