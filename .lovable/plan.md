

# Plan: Vollständig korrigierte multi-ai-query Edge Function

## Problemübersicht

Der aktuelle Code hat eine kritische Lücke: Der Business Context wird zwar korrekt aus der Datenbank geladen und an den User-Prompt angehängt, **aber die System Prompts der AI-Modelle enthalten keine Anweisung, diesen Context aktiv zu nutzen**.

Das bedeutet: Die AI-Modelle könnten den Business Context einfach ignorieren.

## Änderungen

### 1. OpenAI System Prompt (Zeile 264-280)

**Vorher:**
```typescript
const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

Analyze the user's business question...
```

**Nachher:**
```typescript
const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

IMPORTANT: If the user provides BUSINESS CONTEXT (industry, company stage, team size, target market, geographic focus, etc.), you MUST tailor ALL your recommendations specifically to that context. Generic advice is not acceptable when context is provided. Consider the company's specific situation, resources, and market position.

Analyze the user's business question...
```

### 2. Gemini System Instruction (Zeile 391-426)

**Vorher:**
```typescript
const systemInstruction = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

Analyze the user's business question...
```

**Nachher:**
```typescript
const systemInstruction = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

IMPORTANT: If the user provides BUSINESS CONTEXT (industry, company stage, team size, target market, geographic focus, etc.), you MUST tailor ALL your recommendations specifically to that context. Generic advice is not acceptable when context is provided. Consider the company's specific situation, resources, and market position.

Analyze the user's business question...
```

### 3. Claude System Prompt (Zeile 588-596)

**Vorher:**
```typescript
const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.`;
```

**Nachher:**
```typescript
const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

IMPORTANT: If the user provides BUSINESS CONTEXT (industry, company stage, team size, target market, geographic focus, etc.), you MUST tailor ALL your recommendations specifically to that context. Generic advice is not acceptable when context is provided. Consider the company's specific situation, resources, and market position.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.`;
```

### 4. Perplexity System Prompt (Zeile 694-721)

**Vorher:**
```typescript
const systemPrompt = `You are a senior business strategist with access to real-time web data.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

Analyze the user's business question using current market data and trends.
```

**Nachher:**
```typescript
const systemPrompt = `You are a senior business strategist with access to real-time web data.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

IMPORTANT: If the user provides BUSINESS CONTEXT (industry, company stage, team size, target market, geographic focus, etc.), you MUST tailor ALL your recommendations specifically to that context and use web search to find industry-specific data, benchmarks, and trends. Generic advice is not acceptable when context is provided.

Analyze the user's business question using current market data and trends.
```

---

## Vollständiger korrigierter Code

Da du den kompletten Code benötigst, werde ich dir im nächsten Schritt den **gesamten überarbeiteten Code** als einzelnen Block bereitstellen, den du direkt in dein Supabase Dashboard → Edge Functions → `multi-ai-query` kopieren kannst.

**Die 4 kritischen Änderungen sind:**
1. Zeile 267-270: Business Context Anweisung für OpenAI
2. Zeile 394-397: Business Context Anweisung für Gemini
3. Zeile 591-594: Business Context Anweisung für Claude
4. Zeile 697-700: Business Context Anweisung für Perplexity

---

## Nächster Schritt

Klicke auf **"Approve"** und ich werde dir den vollständigen, korrigierten Code generieren, den du 1:1 in dein Supabase Dashboard kopieren kannst.

