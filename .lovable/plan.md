

## Ziel
Points of Agreement und Points of Dissent **immer sichtbar** machen, mit korrekter Klassifizierung basierend auf Modellübereinstimmung.

---

## Änderungsübersicht

### 1. Backend: Neue Agreement-Definition
**Datei:** `supabase/functions/meta-evaluation/index.ts`

**Aktuelle Logik (Zeile 432-449):**
```typescript
if (uniqueModels.length === modelCount) {
  consensus.push(computed);  // Nur 3/3 = Agreement
} else if (uniqueModelWeights >= 60) {
  majority.push(computed);
} else if (uniqueModels.length === 1 && recs.length === 1) {
  dissent.push(...);
}
```

**Neue Logik:**
```typescript
if (uniqueModels.length === modelCount) {
  // Full Consensus: Alle Modelle
  computed.agreementLevel = 'full';
  consensus.push(computed);
} else if (uniqueModels.length >= 2) {
  // Partial Consensus: >= 2 Modelle
  computed.agreementLevel = 'partial';
  consensus.push(computed);  // ← Jetzt auch in Agreement!
} else if (uniqueModels.length === 1) {
  // Echte Einzelmeinung = Dissent
  dissent.push({...});
}
```

**Ergebnis:**
- `uniqueModels.length >= 2` → **Agreement** (full oder partial)
- `uniqueModels.length === 1` → **Dissent** (echte Outlier)

---

### 2. Frontend: Sektionen immer rendern
**Dateien:** 
- `src/components/validation/ConsensusSection.tsx`
- `src/components/validation/DissentSection.tsx`

**Aktuelle Logik (Zeile 18 bzw. 40):**
```typescript
if (points.length === 0) return null;
```

**Neue Logik:** Empty-State anzeigen statt `null` zurückgeben:

```typescript
// ConsensusSection.tsx
if (points.length === 0) {
  return (
    <div className="p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border-l-4 border-l-green-500 border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-4">
        <ConsensusIcon size={24} className="text-green-600" />
        <div>
          <span className="font-bold text-green-700 dark:text-green-400 text-xl">Points of Agreement</span>
          <p className="text-sm text-green-600/70 mt-1">No shared recommendations across models for this decision.</p>
        </div>
      </div>
    </div>
  );
}

// DissentSection.tsx (analog mit amber)
if (points.length === 0) {
  return (
    <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border-l-4 border-l-amber-500 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-4">
        <DissentIcon size={24} className="text-amber-600" />
        <div>
          <span className="font-bold text-amber-700 dark:text-amber-400 text-xl">Points of Dissent</span>
          <p className="text-sm text-amber-600/70 mt-1">No strongly conflicting perspectives detected.</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Frontend: Agreement-Level anzeigen
**Datei:** `src/components/validation/ConsensusSection.tsx`

Den Titel dynamisch anpassen basierend auf `agreementLevel`:

```typescript
// Header anpassen
<span className="font-bold text-green-700 dark:text-green-400 text-base sm:text-xl">
  {hasPartialOnly ? 'Points of Agreement' : 'Full Consensus'}
</span>
<span className="text-xs text-green-600/70">
  {hasPartialOnly ? 'Majority of models agree' : 'All models agree'}
</span>
```

Optional: Badge pro Karte mit `full` oder `partial` Label.

---

### 4. Majority-Sektion entfernen (optional, empfohlen)

Da `>=2 Modelle` jetzt in Agreement landet und nur `1 Modell` in Dissent:
- **Majority wird redundant** (war für 60% Gewicht, aber bei 3 Modellen ist 2/3 = 66%)
- Kann vereinfacht werden: Majority-Inhalte in Agreement integrieren

**Vorschlag:** Majority-Sektion vorerst behalten, aber mit reduzierter Priorität (nur für gewichtsbasierte Sortierung intern).

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `supabase/functions/meta-evaluation/index.ts` | Zeile 432-449: Neue Klassifizierungslogik |
| `src/components/validation/ConsensusSection.tsx` | Empty-State + dynamischer Titel |
| `src/components/validation/DissentSection.tsx` | Empty-State |
| `src/hooks/useMultiAIValidation.ts` | Ggf. TypeScript-Interface für `agreementLevel` erweitern |

---

## Erwartetes Ergebnis

| Vorher | Nachher |
|--------|---------|
| Agreement nur bei 3/3 Modellen | Agreement bei ≥2 Modellen |
| Sektionen verschwinden wenn leer | Sektionen immer sichtbar mit Empty-State |
| Dissent als Catch-all | Dissent nur für echte Einzelmeinungen |
| Inkonsistente UI-Struktur | Stabile, vorhersehbare Seitenstruktur |

---

## Wichtiger Hinweis

Da ValidationOutput.tsx unter einem **visuellen Freeze** steht, werde ich dort keine Layout-Änderungen vornehmen. Die Änderungen beschränken sich auf die internen Komponenten `ConsensusSection` und `DissentSection`, die weiterhin an derselben Stelle gerendert werden.

