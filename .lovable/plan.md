
Ziel
- Die Gemini-Modelle (Gemini 3 Pro + Gemini Flash) sollen zuverlässig funktionieren (keine 404 “Not Found”) – inklusive sauberer Fehlermeldungen, und mit robustem Fallback, damit die Gesamt-Validierung nicht scheitert, wenn ein einzelnes Gemini-Modell temporär nicht verfügbar ist.
- Dabei bleibt das externe Backend bestehen (deine App ruft weiterhin https://fhzqngbbvwpfdmhjfnvk.supabase.co auf).

Was ich im Code gefunden habe (Root-Cause Analyse)
1) multi-ai-query nutzt aktuell direkte Gemini-REST Calls:
   - Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent
   - API-Key: aus Deno.env.get('GEMINI_API_KEY')
   - Bei Fehlern wird im Response nur “API error: {status}” zurückgegeben (Details gehen im UI verloren).
2) Das Mapping ist für “Gemini 3 Pro” sehr wahrscheinlich falsch für deine Erwartung:
   - ALL_MODELS.geminiPro benutzt internal id: google/gemini-3-pro-preview (Label in UI: “Gemini 3 Pro”)
   - Aber MODEL_ID_MAPPING mappt aktuell auf gemini-2.5-pro.
   - Laut offizieller Gemini API Model-Übersicht (ai.google.dev) existiert das Modell gemini-3-pro-preview tatsächlich und ist das korrekte ID für “Gemini 3 Pro (Preview)”.
3) Zudem ist es realistisch, dass deine API-Key/Region/Account nicht alle Modelle freigeschaltet hat (dann gibt Google teils 404/Not Found zurück). Um das dauerhaft stabil zu lösen, brauchen wir:
   - “Model availability check” (models.list/models.get) + Fallback-Kandidaten je Modell
   - bessere Fehlerweitergabe (Status + Google-Errorbody)

Geplanter Fix (konkret)
A) multi-ai-query: Mapping korrigieren + “Model Resolution” + Fallback
1) MODEL_ID_MAPPING in supabase/functions/multi-ai-query/index.ts anpassen:
   - google/gemini-3-pro-preview  -> gemini-3-pro-preview   (statt gemini-2.5-pro)
   - google/gemini-3-flash-preview -> gemini-3-flash-preview (statt gemini-2.5-flash)
   - google/gemini-2.5-flash -> gemini-2.5-flash (bleibt)
   - google/gemini-2.5-pro -> gemini-2.5-pro (bleibt)
   - google/gemini-2.5-flash-lite -> gemini-2.5-flash-lite (bleibt)

2) In queryGoogleModel() eine neue Resolver-Logik einführen:
   - Für jedes “Google”-Modell definieren wir eine Prioritätenliste an Kandidaten-IDs, z.B.:
     - Gemini Pro Kandidaten:
       1) gemini-3-pro-preview
       2) gemini-2.5-pro
       3) gemini-2.0-flash (letzter Notnagel, damit wenigstens 1 Gemini-Antwort kommt)
     - Gemini Flash Kandidaten:
       1) gemini-2.5-flash
       2) gemini-3-flash-preview
       3) gemini-2.0-flash
   - Dann:
     - Optional (empfohlen): Vor dem ersten Generate-Call einmalig (mit In-Memory Cache, z.B. TTL 10 Minuten) models.list aufrufen:
       GET https://generativelanguage.googleapis.com/v1beta/models
       und daraus ein Set verfügbarer Modellnamen (ohne “models/”-Prefix) bauen.
     - Der Resolver nimmt den ersten Kandidaten, der im Set vorhanden ist.
     - Falls models.list fehlschlägt, wird “trial-and-error” genutzt: wir versuchen Kandidaten nacheinander, bis einer nicht-404 liefert.

3) API-Key Übergabe an Google:
   - Zusätzlich zu ?key=… (oder statt dessen) setzen wir den Header wie in der offiziellen REST-Doku:
     - x-goog-api-key: ${apiKey}
   - Ziel: Auth- und Modell-Fehler besser/konstanter behandeln (einige Setups verhalten sich über Header robuster als Query Param).

4) Fehlerdiagnose verbessern (damit “überprüfe alles” auch praktisch ist):
   - Wenn Google nicht ok zurückgibt:
     - Response-Body lesen (errorText)
     - möglichst JSON-parsen und die “message” extrahieren
     - im ModelResponse.error speichern als z.B.:
       “Gemini API 404 for model gemini-3-pro-preview (tried: …). Message: …”
   - Zusätzlich in SSE ein optionales Debug-Event senden (nur wenn request body debug=true), z.B.:
     - event: model_debug
       data: { modelKey, triedModelIds, chosenModelId, availableModelsSample }
   - Damit kannst du mir einfach den Text aus der UI/Console schicken und wir sehen sofort, ob es (a) Modell-ID, (b) Key/Berechtigung oder (c) Endpoint ist.

B) meta-evaluation: Google-Formatting Modell aktualisieren (nicht-blockierend, aber aufräumen)
- meta-evaluation nutzt für “Formatting only” aktuell ein Mapping, das gemini-1.5-flash erzwingt.
- Das ist riskant (Deprecations/Not Found). Plan:
  - GOOGLE_MODEL_MAPPING in supabase/functions/meta-evaluation/index.ts auf aktuelle IDs anheben:
    - google/gemini-3-flash-preview -> gemini-3-flash-preview
    - google/gemini-2.5-flash -> gemini-2.5-flash
    - google/gemini-3-pro-preview -> gemini-3-pro-preview
    - google/gemini-2.5-pro -> gemini-2.5-pro
  - Den Formatter standardmäßig auf gemini-3-flash-preview oder gemini-2.5-flash setzen + kleines Fallback auf gemini-2.0-flash.
- Wichtig: meta-evaluation wirft aktuell bei Formatting-Fehlern nicht, es loggt nur und nutzt computed results. Das bleibt so (kein Risiko für “komplett kaputt”).

C) Externes Backend: Rollout/Übernahme
- Da deine App auf das externe Backend zeigt, muss der gleiche Code-Fix dort landen.
- Nach Implementierung hier:
  1) Ich liefere dir den vollständigen aktualisierten Code der betroffenen Functions (multi-ai-query + meta-evaluation) zum Copy/Paste.
  2) Du ersetzt die Dateien im externen Backend und deployest dort.
  3) Danach testen wir in der App erneut.

Testplan (damit wir sicher sind, dass es wirklich gelöst ist)
1) Schnelltest “Model availability”
   - Entweder über neuen debug=true Pfad in multi-ai-query (zeigt welche Modelle gefunden wurden)
   - Oder über einen kleinen internen Check (models.list) im Log/Debug-Event.
2) App-Test:
   - Auswahl: Gemini 3 Pro + Gemini Flash + ein Nicht-Gemini-Modell
   - Erwartung: mindestens 2 Modelle liefern valide recommendations; ideal: beide Gemini liefern.
3) Fehlerfall-Check:
   - Wenn ein Modell weiterhin 404 liefert, sehen wir im UI/Log die genaue Google-Message + welche IDs probiert wurden.
   - Dann passen wir die Kandidatenliste an (z.B. falls dein Key kein gemini-3-pro-preview freischaltet).

Akzeptanzkriterien
- “Gemini 3 Pro” liefert nicht mehr konsistent “API error: 404”.
- “Gemini Flash” liefert nicht mehr konsistent “API error: 404”.
- Wenn Google tatsächlich ein Modell nicht erlaubt, fällt das System sauber zurück (anderer Gemini-Kandidat) und die Validierung scheitert nicht komplett.
- Bei erneutem Fehler bekommst du eine aussagekräftige Fehlermeldung (Status + Google-Message + tried models).

Risiken / Hinweise
- Manche API Keys sind eingeschränkt (Referrer/IP/Services). Dann kann Google absichtlich 404 liefern. Mit models.list + Error-Message-Propagation erkennen wir das eindeutig.
- “Gemini 3 Pro” ist laut Doku ein Preview-Modell (gemini-3-pro-preview). Preview-Verfügbarkeit kann sich ändern; deshalb ist Fallback wichtig.
