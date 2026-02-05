

# Business Context Integration Fix

## Problemanalyse

Der **Business Context wird in der Analyse ignoriert**, weil er zwar in der Datenbank gespeichert wird, aber nie an die AI-Modelle übergeben wird.

### Technische Ursachen

| Komponente | Datei | Problem |
|------------|-------|---------|
| Frontend Hook | `useMultiAIValidation.ts` Zeile 175-181 | `businessContext` wird nicht im Request Body gesendet |
| Validation Page | `ValidationPlatform.tsx` Zeile 255 | `validate()` wird ohne Business Context aufgerufen |
| Edge Function | `multi-ai-query/index.ts` Zeile 923-929 | `businessContext` wird nicht aus dem Request geparst |
| Enhanced Prompt | `multi-ai-query/index.ts` Zeile 1040-1044 | Nur `riskPreference` wird in den Prompt eingefügt |

---

## Lösung

### Schritt 1: Frontend - useMultiAIValidation.ts anpassen

**Datei:** `src/hooks/useMultiAIValidation.ts`

Die `validate`-Funktion muss einen neuen Parameter `businessContext` akzeptieren:

```typescript
// Zeile 135-141: Parameter hinzufügen
const validate = useCallback(async (
  prompt: string,
  riskPreference: number = 3,
  selectedModels: string[],
  modelWeights: Record<string, number>,
  teamId?: string,
  businessContext?: BusinessContext | null  // NEU
) => {

// Zeile 175-181: Im Request Body senden
body: JSON.stringify({
  prompt,
  riskPreference,
  selectedModels,
  modelWeights,
  streaming: true,
  businessContext  // NEU
}),
```

### Schritt 2: Frontend - ValidationPlatform.tsx anpassen

**Datei:** `src/pages/ValidationPlatform.tsx`

Den Business Context Hook importieren und an validate() übergeben:

```typescript
// Import hinzufügen (nach Zeile 23)
import { useBusinessContext } from "@/hooks/useBusinessContext";

// Hook im Component verwenden (nach Zeile 59)
const { context: businessContext } = useBusinessContext();

// In handleValidate() - Zeile 255 anpassen
await validate(
  prompt.trim(), 
  riskPreference, 
  selectedModels, 
  modelWeights, 
  teamId, 
  businessContext  // NEU
);
```

### Schritt 3: Edge Function - multi-ai-query/index.ts anpassen

**Datei:** `supabase/functions/multi-ai-query/index.ts`

**WICHTIG:** Diese Änderung musst du manuell in dein externes Supabase-Projekt (`fhzqngbbvwpfdmhjfnvk`) deployen!

#### 3.1 Request Parsing erweitern (Zeile 923-929)

```typescript
const { 
  prompt, 
  riskPreference = 3, 
  selectedModels,
  modelWeights,
  streaming = true,
  businessContext  // NEU
} = await req.json();
```

#### 3.2 Business Context Formatter hinzufügen (vor Zeile 1040)

```typescript
// Business Context String erstellen
function formatBusinessContext(ctx: any): string {
  if (!ctx) return '';
  
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
    parts.push(`Team Size: ${ctx.team_size} people`);
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
  
  if (ctx.website_summary) {
    parts.push(`Website Summary: ${ctx.website_summary}`);
  }
  
  if (parts.length === 0) return '';
  
  return `\n\nBUSINESS CONTEXT (MANDATORY - Tailor ALL recommendations specifically to this context):
${parts.join('\n')}`;
}
```

#### 3.3 Enhanced Prompt erweitern (Zeile 1040-1044)

```typescript
// Business Context formatieren
const contextString = formatBusinessContext(businessContext);

// Prepare the enhanced prompt with user context
const enhancedPrompt = `${prompt}

Context for your analysis:
- User prefers ${riskPreference <= 2 ? 'conservative' : riskPreference >= 4 ? 'aggressive/bold' : 'balanced'} recommendations${contextString}`;
```

---

## Zusammenfassung der Änderungen

| Änderungsort | Was wird geändert | Wo deployen |
|--------------|-------------------|-------------|
| `useMultiAIValidation.ts` | BusinessContext Parameter + Request Body | Lovable (automatisch) |
| `ValidationPlatform.tsx` | useBusinessContext Hook + validate() Aufruf | Lovable (automatisch) |
| `multi-ai-query/index.ts` | Request Parsing + formatBusinessContext() + Enhanced Prompt | **Manuell in Supabase** |

---

## Erwartetes Ergebnis

Nach der Implementation:
- Der Business Context wird bei jeder Analyse automatisch aus der DB geladen
- Der Context wird an die Edge Function gesendet
- Alle AI-Modelle erhalten den Context als Teil des System Prompts
- Empfehlungen werden spezifisch auf Industry, Stage, Team Size, Market etc. zugeschnitten

---

## Deployment-Workflow

1. **Lovable**: Änderungen an `useMultiAIValidation.ts` und `ValidationPlatform.tsx` werden automatisch deployed
2. **Supabase**: Du musst die `multi-ai-query` Edge Function manuell in dein externes Projekt deployen:
   - Option A: Supabase CLI mit `supabase functions deploy multi-ai-query`
   - Option B: Code manuell ins Supabase Dashboard kopieren

