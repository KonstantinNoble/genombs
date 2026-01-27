

# Code-Anpassung: Lovable AI Gateway durch direkte OpenAI/Gemini APIs ersetzen

## Zusammenfassung

Du hast eigene API Keys (`OPENAI_API_KEY` und `GEMINI_API_KEY`) in deinem externen Supabase-Projekt konfiguriert. Der bestehende Code ist bereits fuer direkte API-Aufrufe vorbereitet, aber es gibt einen **Naming-Mismatch**:

| Was der Code erwartet | Was du konfiguriert hast |
|----------------------|--------------------------|
| `OPENAI_API_KEY` | `OPENAI_API_KEY` ✅ |
| `GOOGLE_AI_API_KEY` | `GEMINI_API_KEY` ❌ |

## Loesung

Es gibt zwei Optionen:

### Option A: Secret-Namen in Supabase aendern (Empfohlen)

Im Supabase Dashboard (`fhzqngbbvwpfdmhjfnvk` > Settings > Edge Functions > Secrets):
1. Loesche `GEMINI_API_KEY`
2. Erstelle `GOOGLE_AI_API_KEY` mit demselben Wert

**Vorteil**: Kein Code-Aenderung noetig.

### Option B: Code anpassen (Alternative)

Den Code in beiden Edge Functions aendern, um `GEMINI_API_KEY` zu verwenden:

---

## Technische Aenderungen (Option B)

### Datei 1: `supabase/functions/multi-ai-query/index.ts`

**Zeile 769 aendern:**
```typescript
// Vorher:
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

// Nachher:
const googleApiKey = Deno.env.get('GEMINI_API_KEY');
```

**Zeile 778 aendern:**
```typescript
// Vorher:
if (!googleApiKey) {
  throw new Error('GOOGLE_AI_API_KEY not configured');
}

// Nachher:
if (!googleApiKey) {
  throw new Error('GEMINI_API_KEY not configured');
}
```

### Datei 2: `supabase/functions/meta-evaluation/index.ts`

**Zeile 596 aendern:**
```typescript
// Vorher:
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

// Nachher:
const googleApiKey = Deno.env.get('GEMINI_API_KEY');
```

**Zeile 598-599 aendern:**
```typescript
// Vorher:
if (!googleApiKey) {
  throw new Error('GOOGLE_AI_API_KEY not configured');
}

// Nachher:
if (!googleApiKey) {
  throw new Error('GEMINI_API_KEY not configured');
}
```

---

## Betroffene Edge Functions

| Function | Aenderung | Status |
|----------|-----------|--------|
| `multi-ai-query` | Environment Variable Name | Code-Aenderung noetig |
| `meta-evaluation` | Environment Variable Name | Code-Aenderung noetig |

---

## API Endpoints - Keine Aenderung noetig

Der Code verwendet bereits die korrekten direkten API-Endpoints:

- **OpenAI**: `https://api.openai.com/v1/chat/completions`
- **Google AI**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Anthropic**: `https://api.anthropic.com/v1/messages`
- **Perplexity**: `https://api.perplexity.ai/chat/completions`

---

## Model Mapping - Bereits korrekt konfiguriert

Der Code mappt die internen Model-IDs bereits zu den echten API-Model-IDs:

```text
openai/gpt-5-mini  -->  gpt-4o-mini
openai/gpt-5       -->  gpt-4o
google/gemini-3-pro-preview  -->  gemini-1.5-pro
google/gemini-2.5-flash      -->  gemini-1.5-flash
```

---

## Nach der Aenderung

1. Edge Functions werden automatisch deployed
2. Teste die Validierung auf synoptas.com
3. Die Models sollten jetzt mit deinen eigenen API Keys funktionieren

## Empfehlung

**Ich empfehle Option A** (Secret umbenennen in Supabase), da dies keine Code-Aenderung erfordert und du bereits im Supabase Dashboard bist.

Wenn du Option B bevorzugst, kann ich die Code-Aenderungen umsetzen.

