

## Problem: GPT Mini berücksichtigt die Website-URL nicht

Ich habe die Edge Function `multi-ai-query` untersucht und folgende **potenzielle Ursachen** identifiziert:

### Was ich gefunden habe:

1. **Business Context wird korrekt verarbeitet** (Zeile 1181-1185):
   - Die `formatBusinessContext()` Funktion wird aufgerufen
   - Der Kontext wird in den `enhancedPrompt` eingefügt
   - Der Prompt wird an **alle** Modelle gesendet

2. **Aber für OpenAI-Modelle (GPT Mini = gpt-4o-mini) gibt es ein potenzielles Problem**:
   - Der Business Context wird nur im **User Message Content** platziert (Zeile 307)
   - Das System Prompt hat Instruktionen zum Business Context, aber der Context selbst sitzt nur in der User Message
   - GPT Mini könnte weniger auf Context im User-Content reagieren als andere Modelle

3. **Unterschied zu anderen Modellen**:
   - Gemini, Claude und Perplexity erhalten denselben `enhancedPrompt`, aber möglicherweise mit anderer Prompt-Engineering-Effizienz
   - OpenAI Models könnten "blinker" für User-Content-Context sein

### Lösungsansatz:

**Drei Maßnahmen zur Behebung:**

1. **System Prompt für OpenAI verstärken**
   - Den System Prompt für OpenAI-Modelle (Zeile 264-295) mit expliziterem Business Context-Handling erweitern
   - Spezifische Instruktion: "The following business context MUST be considered in every recommendation"

2. **Business Context prominenter im User Message platzieren**
   - Den Business Context an den **Anfang** des `enhancedPrompt` verschieben (statt an das Ende)
   - So wird die Website URL/Summary zuerst gelesen

3. **Logging für Debugging hinzufügen**
   - Explizite Log-Ausgabe, wenn `businessContext` für GPT Mini verarbeitet wird
   - So können wir sehen, ob der Context überhaupt bei der API ankommt

### Dateien, die geändert werden:

| Datei | Änderung |
|-------|----------|
| `supabase/functions/multi-ai-query/index.ts` | System Prompt für OpenAI verstärken + Business Context prominenter platzieren |
| `supabase/functions/multi-ai-query/index.ts` | Zusätzliche Console-Logs für GPT Mini Business Context |

### Wichtig:
- Diese Änderung wird automatisch deployed (keine manuelle Synch mit externem Backend nötig, da du mit Lovable Cloud arbeitest)
- Die Testwirklichkeit: Danach sollte GPT Mini Website-Inhalte genauso berücksichtigen wie Gemini/Claude/Perplexity

