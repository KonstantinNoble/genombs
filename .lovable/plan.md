
## Ziel
Die Competitor-Karte soll nach der Auswahl **dauerhaft geschlossen bleiben** (auch nach Conversation-Wechsel, Reload, erneutem Öffnen), damit kein erneutes Klicken mehr möglich ist.

## Was ich im Code gesehen habe
- `CompetitorSuggestions` hat bereits `submitted` + `initialSelectedUrls`.
- `ChatMessage` versucht die Auswahl in `messages.metadata.selected_urls` zu speichern.
- Der Persist-Write passiert aktuell **ohne Fehlerbehandlung** und ohne lokale State-Synchronisierung.
- Dadurch kann es passieren, dass der Write fehlschlägt (z. B. Berechtigungs-/Client-Thema) und die Karte später wieder offen erscheint.

## Geplanter Fix (robust, dauerhaft)

### 1) Persistenz-Write zuverlässig machen (mit sichtbarem Fehlerfall)
**Datei:** `src/components/chat/ChatMessage.tsx`
- `handleCompetitorsSelected` so umbauen, dass:
  - das Update-Ergebnis geprüft wird (`error` abfangen),
  - bei Fehler ein klarer Log + Toast kommt,
  - optional der aktualisierte Datensatz zurückgelesen wird (`select().single()`), damit wir sicher wissen, dass `selected_urls` wirklich gespeichert wurde.

**Nutzen:** Wir sehen sofort, ob die Datenbank-Aktualisierung tatsächlich klappt oder still scheitert.

---

### 2) UI-Status nicht nur lokal halten, sondern auch Parent-State sofort patchen
**Datei:** `src/pages/Chat.tsx` (oder alternativ `useChatMessages.ts`)
- Beim Klick auf „Analyze“ zusätzlich die betroffene Message in `messages` lokal patchen:
  - `metadata.selected_urls = urls`
- Damit bleibt die Karte sofort geschlossen, selbst wenn kurz danach Navigation/Reload passiert.
- Danach weiterhin persistentes DB-Update ausführen (aus Schritt 1).

**Nutzen:** Kein „wieder offen“-Flackern durch Timing/Race-Conditions.

---

### 3) Prop-Änderungen in `CompetitorSuggestions` aktiv synchronisieren
**Datei:** `src/components/chat/CompetitorSuggestions.tsx`
- Ergänzend `useEffect` einbauen:
  - Wenn `initialSelectedUrls` nachträglich ankommt/ändert, dann:
    - `submitted=true`
    - `submittedUrls=initialSelectedUrls`
- Der aktuelle `useState(alreadySubmitted)` gilt nur beim ersten Mount; mit `useEffect` reagieren wir auch auf spätere Daten-Updates.

**Nutzen:** Komponente bleibt korrekt, auch wenn `message.metadata` asynchron nachgeladen oder lokal gepatcht wird.

---

### 4) Architektur-Konsistenz für Backend-Client prüfen und vereinheitlichen
**Dateien:** `ChatMessage.tsx` + bestehende API-Schicht
- Sicherstellen, dass Lesen/Schreiben derselben Messages über denselben Backend-Client/Scope läuft.
- Falls nötig, den Metadata-Write in die bestehende API-Schicht (`chat-api.ts`) verschieben, damit alle Message-Operationen zentral und konsistent sind.

**Nutzen:** Vermeidet Fälle, in denen Read und Update auf unterschiedlichen Konfigurationen landen.

---

### 5) DB-Sicherheitsregel (nur falls wirklich erforderlich) verifizieren
- Die Update-Regel für Messages in eigener Conversation ist in der aktuellen Cloud-Config sichtbar.
- Ich prüfe trotzdem beim Implementieren, ob der Update-Fehler aus RLS kommt (über konkrete Fehlermeldung).
- Nur wenn nötig, passe ich die Policy minimal und sicher an.

**Nutzen:** Keine unnötigen DB-Änderungen; nur gezielt, falls tatsächlich blocker.

## Validierung (nach Umsetzung)
1. Competitor-Karte öffnen, 1–3 URLs wählen, „Analyze“ klicken.
2. Prüfen: Karte wird zur read-only Zusammenfassung.
3. Zu anderer Conversation wechseln und zurück.
4. Hard Reload der Seite.
5. Erneut prüfen: Karte bleibt geschlossen, keine Checkboxen mehr klickbar.
6. Negativtest: Bei absichtlich fehlgeschlagenem Write muss sichtbarer Fehler erscheinen (statt still wieder offen).

## Erwartetes Ergebnis
- Nach erster Analyse-Auswahl bleibt die Karte dauerhaft im „submitted/read-only“-Zustand.
- Kein erneutes Analyzieren über dieselbe Suggestion-Karte.
- Fehler sind transparent sichtbar statt still zu scheitern.

## Technischer Abschnitt (kurz)
```text
CompetitorSuggestions (UI state)
   ↑ initialSelectedUrls (from message.metadata)
ChatMessage
   ├─ optimistic local message patch (selected_urls)
   └─ persistent update messages.metadata.selected_urls
Chat reload / conversation switch
   └─ loadMessages -> metadata.selected_urls vorhanden -> Karte bleibt geschlossen
```
