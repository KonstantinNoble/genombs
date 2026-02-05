
# Business Context Integration - Vollständige Problembehebung

## Identifizierte Probleme

Nach gründlicher Analyse des gesamten Datenflusses wurden **4 kritische Probleme** identifiziert:

### Problem 1: System Prompts ignorieren den Business Context

| Model | Datei/Zeilen | Problem |
|-------|--------------|---------|
| OpenAI | `multi-ai-query/index.ts` Zeile 264-280 | System Prompt enthält keine Anweisung, den Business Context zu berücksichtigen |
| Gemini | `multi-ai-query/index.ts` Zeile 391-426 | System Prompt enthält keine Anweisung, den Business Context zu berücksichtigen |
| Claude | `multi-ai-query/index.ts` Zeile 609-617 | System Prompt enthält keine Anweisung, den Business Context zu berücksichtigen |
| Perplexity | `multi-ai-query/index.ts` Zeile 715-742 | System Prompt enthält keine Anweisung, den Business Context zu berücksichtigen |

**Ursache:** Der `businessContext` wird zwar in den `enhancedPrompt` (User Message) eingefügt (Zeile 1104-1108), aber die AI-Modelle haben keinen System-Level-Befehl, diesen Context zu priorisieren. LLMs ignorieren oft Kontext in der User Message, wenn der System Prompt keine entsprechenden Anweisungen enthält.

### Problem 2: Website URL fehlt in formatBusinessContext()

**Datei:** `multi-ai-query/index.ts` Zeile 1042-1101

Die `formatBusinessContext()` Funktion inkludiert `website_summary` (Zeile 1092-1094), aber **nicht** die rohe `website_url`. Wenn ein User keine Website gescannt hat aber eine URL eingegeben hat, geht diese Information verloren.

### Problem 3: Kein Debug-Logging für Business Context

Es gibt keinen Log-Output, der zeigt, was genau als Business Context an die AI gesendet wird. Das macht Debugging unmöglich.

### Problem 4: Deployment-Sync

Da du ein **externes Supabase-Projekt** (`fhzqngbbvwpfdmhjfnvk`) verwendest, werden Änderungen in Lovable nicht automatisch deployed. Jede Änderung an der Edge Function muss manuell synchronisiert werden.

---

## Datenfluss-Analyse (Ist-Zustand)

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (LOVABLE)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ValidationPlatform.tsx (Zeile 61)                                               │
│  ┌─────────────────────────────────────────────────────┐                         │
│  │ const { context: businessContext } = useBusinessContext();                    │
│  │                                                                               │
│  │ handleValidate() (Zeile 257):                                                 │
│  │   await validate(prompt, risk, models, weights, teamId, businessContext)      │
│  └─────────────────────────────────────────────────────┘                         │
│                              │                                                   │
│                              ▼                                                   │
│  useMultiAIValidation.ts (Zeile 177-183)                                         │
│  ┌─────────────────────────────────────────────────────┐                         │
│  │ body: JSON.stringify({                                                        │
│  │   prompt,                                                                     │
│  │   riskPreference,                                                             │
│  │   selectedModels,                                                             │
│  │   modelWeights,                                                               │
│  │   streaming: true,                                                            │
│  │   businessContext: businessContext || null  ← GESENDET                        │
│  │ })                                                                            │
│  └─────────────────────────────────────────────────────┘                         │
│                                                                                  │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        EDGE FUNCTION (multi-ai-query)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Request Parsing (Zeile 923-929):                                                │
│  ┌─────────────────────────────────────────────────────┐                         │
│  │ const { prompt, riskPreference, ..., businessContext } = await req.json();   │
│  └─────────────────────────────────────────────────────┘                         │
│                              │                                                   │
│                              ▼                                                   │
│  formatBusinessContext() (Zeile 1041-1101):                                      │
│  ┌─────────────────────────────────────────────────────┐                         │
│  │ function formatBusinessContext(ctx) {                                         │
│  │   // Konvertiert DB-Werte zu lesbarem String                                  │
│  │   // FEHLT: website_url                                                       │
│  │   // FEHLT: Debug-Logging                                                     │
│  │ }                                                                             │
│  └─────────────────────────────────────────────────────┘                         │
│                              │                                                   │
│                              ▼                                                   │
│  Enhanced Prompt Building (Zeile 1103-1108):                                     │
│  ┌─────────────────────────────────────────────────────┐                         │
│  │ const contextString = formatBusinessContext(businessContext);                 │
│  │ const enhancedPrompt = `${prompt}                                             │
│  │   Context for your analysis:                                                  │
│  │   - User prefers ${risk} recommendations${contextString}`;                    │
│  │                                                                               │
│  │ ← Context ist NUR in der User Message, NICHT im System Prompt                 │
│  └─────────────────────────────────────────────────────┘                         │
│                              │                                                   │
│                              ▼                                                   │
│  Model Queries (Zeile 1127-1142):                                                │
│  ┌──────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                               ││
│  │  OpenAI (Zeile 264-280)         Gemini (Zeile 391-426)                        ││
│  │  ┌────────────────────────┐     ┌────────────────────────┐                   ││
│  │  │ systemPrompt:          │     │ systemInstruction:     │                   ││
│  │  │ "You are a senior...   │     │ "You are a senior...   │                   ││
│  │  │ Your style: balanced   │     │ Your style: creative   │                   ││
│  │  │                        │     │                        │                   ││
│  │  │ ⚠ KEIN HINWEIS AUF     │     │ ⚠ KEIN HINWEIS AUF     │                   ││
│  │  │   BUSINESS CONTEXT     │     │   BUSINESS CONTEXT     │                   ││
│  │  └────────────────────────┘     └────────────────────────┘                   ││
│  │                                                                               ││
│  │  Claude (Zeile 609-617)         Perplexity (Zeile 715-742)                   ││
│  │  ┌────────────────────────┐     ┌────────────────────────┐                   ││
│  │  │ systemPrompt:          │     │ systemPrompt:          │                   ││
│  │  │ "You are a senior...   │     │ "You are a senior...   │                   ││
│  │  │                        │     │                        │                   ││
│  │  │ ⚠ KEIN HINWEIS AUF     │     │ ⚠ KEIN HINWEIS AUF     │                   ││
│  │  │   BUSINESS CONTEXT     │     │   BUSINESS CONTEXT     │                   ││
│  │  └────────────────────────┘     └────────────────────────┘                   ││
│  │                                                                               ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Losung - Technischer Implementierungsplan

### Schritt 1: formatBusinessContext() erweitern

**Datei:** `supabase/functions/multi-ai-query/index.ts`

**Zeilen:** 1041-1101

**Anderungen:**
1. Website URL hinzufugen (auch wenn kein Summary vorhanden)
2. Debug-Logging hinzufugen

```typescript
function formatBusinessContext(ctx: any): string {
  if (!ctx) {
    console.log('[BusinessContext] No context provided');
    return '';
  }
  
  const parts: string[] = [];
  
  if (ctx.industry) {
    const industryLabels: Record<string, string> = {
      'saas': 'SaaS', 'ecommerce': 'E-Commerce', 'fintech': 'FinTech',
      'healthtech': 'HealthTech', 'edtech': 'EdTech', 'marketplace': 'Marketplace',
      'agency': 'Agency', 'consulting': 'Consulting', 'manufacturing': 'Manufacturing', 'other': 'Other'
    };
    parts.push(`Industry: ${industryLabels[ctx.industry] || ctx.industry}`);
  }
  
  if (ctx.company_stage) {
    const stageLabels: Record<string, string> = {
      'idea': 'Idea Stage', 'pre-seed': 'Pre-Seed', 'seed': 'Seed',
      'series-a': 'Series A', 'series-b-plus': 'Series B+', 
      'growth': 'Growth Stage', 'established': 'Established'
    };
    parts.push(`Company Stage: ${stageLabels[ctx.company_stage] || ctx.company_stage}`);
  }
  
  if (ctx.team_size) {
    parts.push(`Team Size: ${ctx.team_size}`);
  }
  
  if (ctx.revenue_range) {
    const revenueLabels: Record<string, string> = {
      'pre-revenue': 'Pre-revenue', 'less-10k': 'Less than $10k/month',
      '10k-50k': '$10k-50k/month', '50k-100k': '$50k-100k/month', '100k-plus': '$100k+/month'
    };
    parts.push(`Revenue: ${revenueLabels[ctx.revenue_range] || ctx.revenue_range}`);
  }
  
  if (ctx.target_market) {
    const marketLabels: Record<string, string> = {
      'b2b': 'B2B', 'b2c': 'B2C', 'b2b2c': 'B2B2C', 'd2c': 'D2C'
    };
    parts.push(`Target Market: ${marketLabels[ctx.target_market] || ctx.target_market}`);
  }
  
  if (ctx.geographic_focus) {
    const geoLabels: Record<string, string> = {
      'local': 'Local', 'national': 'National', 'eu': 'European Union', 
      'us': 'United States', 'global': 'Global'
    };
    parts.push(`Geographic Focus: ${geoLabels[ctx.geographic_focus] || ctx.geographic_focus}`);
  }
  
  // NEU: Website URL hinzufugen (auch ohne Summary)
  if (ctx.website_url) {
    parts.push(`Company Website: ${ctx.website_url}`);
  }
  
  if (ctx.website_summary) {
    parts.push(`Website Analysis: ${ctx.website_summary}`);
  }
  
  if (parts.length === 0) {
    console.log('[BusinessContext] Context object provided but all fields empty');
    return '';
  }
  
  const contextString = `
- BUSINESS CONTEXT (MANDATORY - Tailor ALL recommendations specifically to this context):
  ${parts.join('\n  ')}`;
  
  // NEU: Debug-Logging
  console.log('[BusinessContext] Formatted context for AI:', contextString);
  
  return contextString;
}
```

### Schritt 2: OpenAI System Prompt aktualisieren

**Datei:** `supabase/functions/multi-ai-query/index.ts`

**Zeilen:** 264-280

```typescript
const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice

If no business context is provided, give general best-practice recommendations.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
${detailLevel}
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.${isPremium ? `

PREMIUM ANALYSIS REQUIREMENTS:
- Include competitive advantage analysis for each recommendation
- Provide long-term implications (12+ month outlook)
- Add resource requirements (budget estimates, team needs, tools)
- Include market context in your summary
- Provide a 12-month strategic outlook` : ''}`;
```

### Schritt 3: Gemini System Instruction aktualisieren

**Datei:** `supabase/functions/multi-ai-query/index.ts`

**Zeilen:** 391-426

```typescript
const systemInstruction = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice

If no business context is provided, give general best-practice recommendations.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
${detailLevel}
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.${isPremium ? `

PREMIUM ANALYSIS REQUIREMENTS:
- Include competitive advantage analysis for each recommendation
- Provide long-term implications (12+ month outlook)
- Add resource requirements (budget estimates, team needs, tools)
- Include market context in your summary
- Provide a 12-month strategic outlook` : ''}

CRITICAL: You MUST respond with ONLY a valid JSON object (no markdown, no explanation, just pure JSON) in this exact format:
{
  "recommendations": [...],
  "summary": "string",
  "overallConfidence": number (0-100)
}`;
```

### Schritt 4: Claude System Prompt aktualisieren

**Datei:** `supabase/functions/multi-ai-query/index.ts`

**Zeilen:** 609-617

```typescript
const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice

If no business context is provided, give general best-practice recommendations.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.`;
```

### Schritt 5: Perplexity System Prompt aktualisieren

**Datei:** `supabase/functions/multi-ai-query/index.ts`

**Zeilen:** 715-742

```typescript
const systemPrompt = `You are a senior business strategist with access to real-time web data.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice
- If a company website is provided, consider what you know about similar companies in that space

If no business context is provided, give general best-practice recommendations based on current market trends.

Analyze the user's business question using current market data and trends.
Provide ${recommendationCount} concrete, actionable recommendations.
Focus on recent developments and current industry benchmarks.
Include relevant statistics and data points from your web search.

IMPORTANT: Structure your response as valid JSON with these exact fields:
{
  "recommendations": [...],
  "summary": "string",
  "overallConfidence": number (0-100)
}`;
```

---

## Zusammenfassung aller Anderungen

| Datei | Zeilen | Anderung | Zweck |
|-------|--------|----------|-------|
| `multi-ai-query/index.ts` | 1041-1101 | `formatBusinessContext()` erweitern | Website URL + Debug-Logging |
| `multi-ai-query/index.ts` | 264-280 | OpenAI System Prompt | Context-Anweisung hinzufugen |
| `multi-ai-query/index.ts` | 391-426 | Gemini System Instruction | Context-Anweisung hinzufugen |
| `multi-ai-query/index.ts` | 609-617 | Claude System Prompt | Context-Anweisung hinzufugen |
| `multi-ai-query/index.ts` | 715-742 | Perplexity System Prompt | Context-Anweisung hinzufugen |

---

## Deployment-Workflow

### Automatisch (Lovable):
- Keine Frontend-Anderungen notig - der Code ist korrekt

### Manuell erforderlich (Externes Supabase):
Nach Genehmigung dieses Plans:
1. Ich werde die Anderungen an `supabase/functions/multi-ai-query/index.ts` vornehmen
2. Du musst die aktualisierte Edge Function manuell deployen:

**Option A: Supabase CLI**
```bash
supabase link --project-ref fhzqngbbvwpfdmhjfnvk
supabase functions deploy multi-ai-query
```

**Option B: Dashboard Copy-Paste**
1. Offne https://supabase.com/dashboard/project/fhzqngbbvwpfdmhjfnvk/functions
2. Wahle `multi-ai-query`
3. Ersetze den Code mit dem aktualisierten Code aus Lovable

---

## Verifizierung nach Deployment

Nach dem Deployment kannst du in den Edge Function Logs verifizieren:

1. Starte eine Analyse mit gesetztem Business Context
2. Prufe die Logs auf den neuen Debug-Output:
   ```
   [BusinessContext] Formatted context for AI:
   - BUSINESS CONTEXT (MANDATORY...):
     Industry: SaaS
     Company Stage: Seed
     Team Size: 2-5
     ...
   ```

3. Die AI-Antworten sollten nun explizit auf deinen Business Context eingehen (z.B. "Fur ein SaaS-Unternehmen in der Seed-Phase empfehle ich...")
